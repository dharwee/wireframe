// app/api/generate/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// This tells Next.js to use the Edge Runtime, which is optimized for streaming.
export const runtime = 'edge';

export async function POST(request: NextRequest) {
    const { projectId } = await request.json();
    
    if (!projectId) {
        return new Response('Project ID is required', { status: 400 });
    }

    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { data: project } = await supabase
            .from('projects')
            .select('description, image_url')
            .eq('id', projectId)
            .eq('user_id', session.user.id)
            .single();

        if (!project) {
            return new Response('Project not found or access denied', { status: 404 });
        }

        // Initialize a text encoder and a transform stream
        const encoder = new TextEncoder();
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();

        // Start the AI generation in the background
        (async () => {
            let fullResponse = "";
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `
                    You are an expert Next.js developer who creates modern UI with React and Tailwind CSS.
                    Based on the following user description and wireframe image, create a single React functional component.
                    RULES:
                    1. Use JSX and Tailwind CSS.
                    2. Do NOT include 'import React from "react"'.
                    3. If you use icons, import them from the 'lucide-react' library.
                    4. Your entire response must be ONLY the raw JSX code for the component. Do not wrap it in markdown backticks or add any explanations.
                    USER DESCRIPTION: "${project.description}"
                `;

                const response = await fetch(project.image_url!);
                const imageBuffer = await response.arrayBuffer();
                const imagePart = {
                    inlineData: {
                        data: Buffer.from(imageBuffer).toString("base64"),
                        mimeType: response.headers.get('content-type')!,
                    },
                };

                const result = await model.generateContentStream([prompt, imagePart]);

                // Stream the response token by token
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    fullResponse += chunkText; // Collect the full response
                    await writer.write(encoder.encode(chunkText)); // Send chunk to the client
                }

            } finally {
                // After streaming is complete, save the full response to the database
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );
                await supabaseAdmin
                    .from('projects')
                    .update({ generated_code: fullResponse })
                    .eq('id', projectId);
                
                writer.close(); // Close the stream
            }
        })();

        // Return the readable side of the stream to the client
        return new Response(stream.readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error) {
        console.error("Main API Error:", error);
        return new Response('Failed to generate code from AI model', { status: 500 });
    }
}