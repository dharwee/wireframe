'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Clipboard } from 'lucide-react';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!params.projectId) return;

        const generateCode = async () => {
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectId: params.projectId }),
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }
                
                // Get the reader from the response body to read the stream
                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('Failed to get stream reader.');
                }
                
                const decoder = new TextDecoder();
                
                // Read from the stream until it's finished
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        setIsComplete(true);
                        break;
                    }
                    const chunk = decoder.decode(value);
                    setGeneratedCode((prevCode) => prevCode + chunk);
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'An unknown error occurred.');
            }
        };

        generateCode();
    }, [params.projectId]);

    const handleCopy = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold">Generated Code</h1>
            <p className="text-sm text-gray-500 mb-4">Project ID: {params.projectId}</p>
            
            {error ? (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    <h2 className='font-bold'>Error</h2>
                    <p>{error}</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Only show the copy button when generation is complete */}
                    {isComplete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        </Button>
                    )}
                    <pre className="p-4 bg-gray-900 text-white rounded-md overflow-x-auto min-h-[100px]">
                        <code>
                            {generatedCode}
                            {/* Blinking cursor effect while generating */}
                            {!isComplete && <span className="animate-ping">_</span>}
                        </code>
                    </pre>
                </div>
            )}
        </div>
    );
}