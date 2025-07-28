'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { ChangeEvent, useState } from "react";
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

function ImageUpload() {
    const { user } = useAuth();
    const AiModelList = [
        { name: 'Gemini Google', icon: '/google.png' },
        { name: 'DeepSeek', icon: '/deepseek.png' },
        { name: 'Llama 3', icon: '/meta.png' }
    ];

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [aiModel, setAiModel] = useState<string>(''); // ✅ FIX: Changed from 'model' to 'aiModel' for clarity
    const router = useRouter();
    const [Loading, setLoading] = useState(false);
    const OnImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setPreviewUrl(imageUrl);
            setError(null);
        }
    };
    
    const clearSelection = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setError(null);
        setDescription("");
        setAiModel('');
    };

    // ✅ FIX: Renamed function to reflect its full purpose
    const handleUploadAndSave = async () => {
        // ✅ ADD: Validate all form fields
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

        // 1. Upload Image to Storage
        const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wireframe') // Make sure this matches your bucket name
            .upload(filePath, selectedFile);

        if (uploadError) {
            setIsUploading(false);
            setError(`Image upload failed: ${uploadError.message}`);
            return;
        }

        // 2. Get Public URL of the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from('wireframe')
            .getPublicUrl(filePath);

        // ✅ ADD: 3. Insert all data into the 'projects' database table
        const { data:dbData, error: dbError } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                image_url: publicUrl,
                description: description,
                ai_model: aiModel
            })
            .select()
            .single()
        
        setIsUploading(false);

        if (dbError) {
            setError(`Failed to save project to database: ${dbError.message}`);
        } else if(dbData) {
            alert("Image uploaded successfully! Generating code...");
            clearSelection(); // Clear the form on success
            router.push(`/view-code/${user.id}`); // Redirect to the view code page
        }
    };

    return (
        <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {!previewUrl ? (
                    <div className="p-7 border border-dashed rounded-md shadow-md flex flex-col items-center justify-center">
                        <CloudUpload className="h-10 w-10 text-primary " />
                        <h2 className="font-bold text-lg">Upload Image</h2>
                        <p className="text-gray-400 mt-3"> Click Button Select Wireframe Image </p>
                        <div className="p-5 border border-dashed w-full flex items-center justify-center mt-7">
                            <label htmlFor="imageSelect" className="cursor-pointer">
                                <h2 className="p-2 bg-blue-100 text-primary font-semibold rounded-md px-3 ">Select Image</h2>
                            </label>
                        </div>
                        <input type="file" id='imageSelect' className="hidden" multiple={false} accept="image/*" onChange={OnImageSelect} />
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
                                        <Image src={model.icon} alt={model.name} width={25} height={35} className="inline-block mr-2" />
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
                {/* ✅ FIX: Button now calls the combined function */}
                <Button onClick={handleUploadAndSave} disabled={isUploading || !selectedFile}>
                    {isUploading ? "Uploading..." : <><WandSparkles /> Convert to code</>}
                </Button>
            </div>
        </div>
    );
}

export default ImageUpload;