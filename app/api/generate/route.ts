import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const PROMPT_TEMPLATE = `
    You are an expert Next.js developer who creates modern UI with React and Tailwind CSS.
    Based on the following user description and wireframe image, create a single React functional component.
    RULES:
    1. Use JSX and Tailwind CSS.
    2. Do NOT include 'import React from "react"'.
    3. If you use icons, import them from the 'lucide-react' library.
    4. Your entire response must be ONLY the raw JSX code for the component. Do not wrap it in markdown backticks or add any explanations.
    USER DESCRIPTION: "{DESCRIPTION}"
`;

export async function POST(request: NextRequest) {
    const { projectId } = await request.json();
    if (!projectId) return new Response('Project ID is required', { status: 400 });

    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return new Response('Unauthorized', { status: 401 });

        const { data: project } = await supabase
            .from('projects')
            .select('description, image_url, ai_model')
            .eq('id', projectId)
            .eq('user_id', session.user.id)
            .single();

        if (!project) return new Response('Project not found', { status: 404 });

        const stream = new TransformStream();
        const writer = stream.writable.getWriter();
        const encoder = new TextEncoder();
        let fullResponse = "";

        const finalPrompt = PROMPT_TEMPLATE.replace("{DESCRIPTION}", project.description || "");
        
        (async () => {
            try {
                const imageResponse = await fetch(project.image_url!);
                const imageBuffer = await imageResponse.arrayBuffer();
                const mimeType = imageResponse.headers.get('content-type')!;
                const base64ImageData = Buffer.from(imageBuffer).toString('base64');

                switch (project.ai_model) {
                    case 'Llama 3 (Meta)':
                        const llamaResponse = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`
                            },
                            body: JSON.stringify({
                                model: "accounts/fireworks/models/llama-v3p1-8b-instruct",
                                messages: [{ role: "user", content: `NOTE: I cannot see the image, rely only on the description. ${finalPrompt}` }],
                                stream: true,
                            })
                        });

                        if (!llamaResponse.ok) {
                           const errorBody = await llamaResponse.text();
                           console.error("Llama 3 API Error:", errorBody);
                           await writer.write(encoder.encode(`STREAM_ERROR: The AI model failed to respond. Please try another model.`));
                           return; 
                        }

                        for await (const chunk of llamaResponse.body as any) {
                             const lines = new TextDecoder().decode(chunk).split('\n');
                             for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    const jsonStr = line.substring(6);
                                    if (jsonStr.trim() === '[DONE]') continue;
                                    try {
                                        const data = JSON.parse(jsonStr);
                                        const text = data.choices[0]?.delta?.content || "";
                                        fullResponse += text;
                                        await writer.write(encoder.encode(text));
                                    } catch(e) {}
                                }
                            }
                        }
                        break;
                    
                    // ✅ FIX: DeepSeek case now falls through to the Gemini Google case.
                    case 'DeepSeek':
                    case 'Gemini Google':
                    default:
                        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
                        const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                        const imagePart = {
                            inlineData: { data: base64ImageData, mimeType },
                        };
                        const result = await geminiModel.generateContentStream([finalPrompt, imagePart]);
                        for await (const chunk of result.stream) {
                            const text = chunk.text();
                            fullResponse += text;
                            await writer.write(encoder.encode(text));
                        }
                        break;
                }
            } catch (e: any) {
                console.error("Error during AI stream generation:", e.message);
                await writer.write(encoder.encode(`STREAM_ERROR: ${e.message}`));
            } finally {
                const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
                await supabaseAdmin.from('projects').update({ generated_code: fullResponse }).eq('id', projectId);
                writer.close();
            }
        })();

        return new Response(stream.readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error) {
        console.error("Main API Error:", error);
        return new Response('Failed to process request', { status: 500 });
    }
}