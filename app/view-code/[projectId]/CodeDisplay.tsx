'use client';

import { Button } from '@/components/ui/button';
import { Check, Clipboard } from 'lucide-react';
import React, { useState } from 'react';

export default function CodeDisplay({ generatedCode }: { generatedCode: string | null }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!generatedCode) {
        return (
            <div className="p-4 bg-blue-100 text-blue-700 rounded-md">
                <p>Code is still being generated. Please refresh the page in a moment.</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white"
                onClick={handleCopy}
            >
                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            </Button>
            <pre className="p-4 bg-gray-900 text-white rounded-md overflow-x-auto h-full">
                <code>
                    {generatedCode}
                </code>
            </pre>
        </div>
    );
}