import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// ✅ FIX: A new, much simpler prompt that forbids icons.
const PROMPT_TEMPLATE = `
You are a precise React component generator. Convert the provided wireframe image and description into a single, production-ready React component.

**ANALYSIS INSTRUCTIONS:**
1. Carefully examine the wireframe image to understand:
   - Layout structure and positioning
   - Component hierarchy and nesting
   - Spacing, alignment, and proportions
   - Interactive elements (buttons, forms, etc.)
   - Content areas and text placement

2. Use the user description to understand:
   - Functionality requirements
   - Specific styling preferences
   - Interactive behavior needed

**STYLING REQUIREMENTS:**
- Use Tailwind CSS classes exclusively for all styling
- Match the wireframe layout precisely using Flexbox/Grid
- Use semantic HTML elements (header, nav, main, section, article, etc.)
- Apply proper spacing with Tailwind spacing classes (p-, m-, gap-)
- Use appropriate Tailwind typography classes (text-sm, text-lg, font-bold, etc.)
- Ensure responsive design with Tailwind responsive prefixes (sm:, md:, lg:)
- Use Tailwind colors for backgrounds, borders, and text
- Add subtle shadows, borders, and hover effects where appropriate

**COMPONENT STRUCTURE:**
- Create a complete functional component with React hooks if needed
- Use proper component composition for complex layouts
- Implement any form inputs, buttons, or interactive elements shown in wireframe
- Add realistic placeholder content that matches the wireframe context
- Include proper accessibility attributes (alt text, aria-labels, etc.)

**CODE QUALITY:**
- Write clean, readable code with proper indentation
- Use descriptive variable and function names
- Add comments only for complex logic
- Ensure all JSX elements are properly closed
- Handle any state management needed for interactive elements

**OUTPUT REQUIREMENTS:**
- Return ONLY the raw JSX code, nothing else
- Start with: export default function App() {
- Do NOT include import statements
- Do NOT include markdown backticks, explanations, or conversational text
- Do NOT use placeholder comments like "// Add more components here"
- The component must be complete and render-ready
- Include realistic content, not just "Lorem ipsum" or "Content here"

**FORBIDDEN ELEMENTS:**
- No import React statements
- No external icons or SVG imports
- No console.log statements
- No TODO comments
- No explanation text outside the code

USER DESCRIPTION: "{DESCRIPTION}"

Generate the complete React component now:`;

// module.exports = PROMPT_TEMPLATE;

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
                const imageUrlForApi = `data:${mimeType};base64,${base64ImageData}`;

                switch (project.ai_model) {
                    case 'DeepSeek':
                        const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                            },
                            body: JSON.stringify({
                                model: "deepseek-chat",
                                messages: [{ role: "user", content: finalPrompt }],
                                images: [base64ImageData],
                                stream: true
                            })
                        });
                        if (!deepseekResponse.ok) {
                           const errorBody = await deepseekResponse.text();
                           console.error("DeepSeek API Error:", errorBody);
                           await writer.write(encoder.encode(`STREAM_ERROR: DeepSeek API Error.`));
                           return;
                        }
                        for await (const chunk of deepseekResponse.body as any) {
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
                           await writer.write(encoder.encode(`STREAM_ERROR: The AI model failed to respond.`));
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
                // Save the raw response from the AI
                const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
                await supabaseAdmin
                    .from('projects')
                    .update({ generated_code: fullResponse })
                    .eq('id', projectId);
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