import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// ✅ FIX: A new, much simpler prompt that forbids icons.
const PROMPT_TEMPLATE = `
You are an expert frontend developer specializing in converting wireframes into pixel-perfect React components with Tailwind CSS.

**ANALYSIS INSTRUCTIONS:**
- Carefully examine the wireframe image to understand the layout, components, spacing, and visual hierarchy
- Identify all UI elements: headers, navigation, buttons, forms, cards, lists, images, text blocks
- Note the responsive behavior and grid/flexbox patterns
- Determine appropriate semantic HTML structure

**STYLING REQUIREMENTS:**
- Use ONLY Tailwind CSS utility classes for all styling
- Implement responsive design with Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
- Use appropriate spacing (p-, m-, gap-), sizing (w-, h-), and layout utilities (flex, grid)
- Apply proper typography classes (text-, font-, leading-)
- Use semantic color classes (bg-, text-, border-) that match the wireframe
- Implement hover and focus states where appropriate

**CODE STRUCTURE:**
- Output MUST be a single, complete React functional component
- Start with 'export default function App() {'
- Use semantic HTML elements (header, nav, main, section, article, aside, footer)
- Implement proper component structure with logical nesting
- Use meaningful className combinations for styling

**CONTENT HANDLING:**
- Replace wireframe placeholder text with realistic, contextual content
- Use placeholder images with appropriate alt text
- Implement interactive elements (buttons, forms, links) with proper accessibility
- Add realistic data for lists, cards, and repeated elements

**TECHNICAL CONSTRAINTS:**
- Do NOT include 'import React from "react"' or any other imports
- Do NOT use inline styles or CSS-in-JS
- Do NOT include icons, SVG elements, or external assets unless specified
- Do NOT add markdown backticks, code blocks, or explanatory text
- Ensure all JSX tags are properly closed and valid
- Use only HTML5 semantic elements and standard attributes

**OUTPUT FORMAT:**
- Return ONLY the raw JSX code
- No explanations, comments, or surrounding text
- Code must be immediately executable as a React component

**ACCESSIBILITY:**
- Include proper ARIA labels where needed
- Ensure keyboard navigation support
- Use semantic HTML for screen readers
- Include alt text for images

USER DESCRIPTION: "{DESCRIPTION}"

WIREFRAME IMAGE: Analyze the provided wireframe image carefully to understand the exact layout, components, and design patterns to implement.
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