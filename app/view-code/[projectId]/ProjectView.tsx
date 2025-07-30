'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { RefreshCcw, WandSparkles } from 'lucide-react';
import CodePreview from './CodePreview';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Define a type for the project data for better TypeScript support
type Project = {
    id: string;
    generated_code: string | null;
    image_url: string | null;
    description: string | null;
    ai_model: string | null;
};

export default function ProjectView({ initialProject }: { initialProject: Project }) {
    const [project, setProject] = useState(initialProject);
    const [isGenerating, setIsGenerating] = useState(!initialProject.generated_code);

    // This effect handles the initial, automatic code generation if it's missing
    useEffect(() => {
        if (!project.generated_code) {
            handleRegenerate();
        }
    }, []);

    const handleRegenerate = async () => {
        setIsGenerating(true);
        setProject(prev => ({ ...prev, generated_code: '' })); 

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id }),
        });

        if (!response.ok || !response.body) {
            console.error("Failed to generate code");
            setIsGenerating(false);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            setProject(prev => ({ ...prev, generated_code: (prev.generated_code || '') + chunk }));
        }

        setIsGenerating(false);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <aside className="w-80 flex-shrink-0 bg-white p-6 border-r flex flex-col">
                <h2 className="text-xl font-bold mb-6">Project Details</h2>
                
                <div className="space-y-6 flex-grow">
                    <div>
                        <h3 className="font-bold my-2">Wireframe</h3>
                        <Image src={project?.image_url!} alt='Wireframe' width={300} height={400}
                            className='rounded-lg object-contain h-[200px] w-full border border-dashed p-2 bg-white'
                        />
                    </div>
                    
                    <div>
                        <h3 className='font-bold mt-4 mb-2'>AI Model</h3>
                        <Input defaultValue={project?.ai_model!} disabled={true} className='bg-white' />
                    </div>

                    <div>
                        <h3 className='font-bold mt-4 mb-2'>Description</h3>
                        <Textarea defaultValue={project?.description!} disabled={true}
                            className='bg-white h-[180px]' />
                    </div>
                </div>

                <Button className='mt-7 w-full' disabled={isGenerating} onClick={handleRegenerate}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Regenerate Code'}
                </Button>
            </aside>

            {/* Right Main Area */}
            <main className="flex-1">
                {isGenerating && !project.generated_code ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                        <h2 className="text-xl font-semibold">Analyzing the Wireframe...</h2>
                    </div>
                ) : (
                    <CodePreview generatedCode={project.generated_code} />
                )}
            </main>
        </div>
    );
}