'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState, useCallback } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useDropzone } from 'react-dropzone';

function ImageUpload() {
    const { user } = useAuth();
    const AiModelList = [
        {
            name: 'Gemini Google',
            icon: '/google.png'
        },
        {
            name: 'Llama 3 (Meta)',
            icon: '/meta.png'
        },
        {
            name: 'DeepSeek',
            icon: '/deepseek.png'
        }
    ];
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [aiModel, setAiModel] = useState<string>('');
    const router = useRouter();
    const [Loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setPreviewUrl(imageUrl);
            setError(null);
        }
    }, []);

   
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        },
        multiple: false
    });

    const clearSelection = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setError(null);
        setDescription("");
        setAiModel('');
    };

    const handleUploadAndSave = async () => {
        if (!selectedFile || !aiModel || !description) {
            setError("Please select an image and fill out all fields.");
            return;
        }
        if (!user) {
            setError("You must be logged in to create a project.");
            return;
        }

        setIsUploading(true);
        setError(null);

        const sanitizedFileName = selectedFile.name.replace(/\s+/g, '_');
        const filePath = `${user.id}/${Date.now()}-${sanitizedFileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wireframe')
            .upload(filePath, selectedFile);

        if (uploadError) {
            setIsUploading(false);
            setError(`Image upload failed: ${uploadError.message}`);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('wireframe')
            .getPublicUrl(filePath);

        const { data: newProject, error: dbError } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                image_url: publicUrl,
                description: description,
                ai_model: aiModel
            })
            .select()
            .single();

        setIsUploading(false);

        if (dbError) {
            setError(`Failed to save project to database: ${dbError.message}`);
        } else if (newProject) {
            alert("Project created successfully! Generating code...");
            axios.post('/api/generate', { projectId: newProject.id });
            router.push(`/view-code/${newProject.id}`);
        }
    };

    return (
        <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {!previewUrl ? (
                    <div
                        {...getRootProps({
                            className: `p-7 border border-dashed rounded-md shadow-md flex flex-col items-center justify-center transition-colors duration-200 ${isDragActive ? 'border-primary bg-blue-50' : ''}`
                        })}
                    >
                        <input {...getInputProps()} />
                        <CloudUpload className="h-10 w-10 text-primary " />
                        <h2 className="font-bold text-lg">Upload Image</h2>
                        <p className="text-gray-400 mt-3">Drag and drop your file here, or click to select</p>
                        <div className="p-5 border border-dashed w-full flex items-center justify-center mt-7">
                            <h2 className="p-2 bg-blue-100 text-primary font-semibold rounded-md px-3 ">Select Image</h2>
                        </div>
                    </div>
                ) : (
                    <div className="p-5 border border-dashed relative">
                        <Image src={previewUrl} alt='preview' width={500} height={500} className="w-full h-[300px] object-contain" />
                        <X className="absolute top-2 right-2 bg-white rounded-full cursor-pointer" onClick={clearSelection} />
                    </div>
                )}

                <div className="p-7 border shadow-md rounded-lg">
                    <h2 className="font-bold text-lg ">Select AI Model</h2>
                    <Select value={aiModel} onValueChange={(value) => setAiModel(value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select AI Model" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                            {AiModelList.map((model, index) => (
                                <SelectItem value={model.name} key={index}>
                                    <div className="flex items-center gap-1">
                                        <Image src={model.icon} alt={model.name} width={25} height={25} className="inline-block mr-2" />
                                        <h2>{model.name}</h2>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <h2 className="font-bold text-lg mt-7">Enter Description about your webpage</h2>
                    <Textarea
                        className="mt-3 h-[200px]"
                        placeholder="Write about your webpage"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </div>
            <div className="mt-10 flex justify-center">
                <Button onClick={handleUploadAndSave} disabled={isUploading || !selectedFile}>
                    {isUploading ? "Uploading..." : <><WandSparkles /> Convert to code</>}
                </Button>
            </div>
        </div>
    );
}

export default ImageUpload;