'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { ChangeEvent } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function ImageUpload() {
    const AiModelList=[
        {
            name: 'Gemini Google',
            icon: '/google.png'
        },
        
        {
            name: 'DeepSeek',
            icon: '/deepseek.png'
        },
        {
            name: 'Llama 3',
            icon: '/meta.png'   
        }
    ]
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const OnImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log("Selected file:", file.name);
            // You can add further processing here, like uploading the image
            const imageUrl = URL.createObjectURL(file);
            setPreviewUrl(imageUrl);

        } else {
            console.log("No file selected");
        }
    }
    return (
        <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {!previewUrl ? <div className="p-7 border border-dashed rounded-md shadow-md flex flex-col items-center justify-center">
                    <CloudUpload className="h-10 w-10 text-primary " />
                    <h2 className="font-bold text-lg">Upload Image</h2>
                    <p className="text-gray-400 mt-3"> Click Button Select Wireframe Image </p>
                    <div className="p-5 border border-dashed w-full flex items-center justify-center mt-7">
                        <label htmlFor="imageSelect" className="cursor-pointer">
                            <h2 className="p-2 bg-blue-100 text-primary font-semibold rounded-md px-3 ">Select Image</h2>
                        </label>
                    </div>
                    <input type="file" id='imageSelect' className="hidden" multiple={false} onChange={OnImageSelect} />
                </div> : <div className="p-5 border border-dashed">  <Image src={previewUrl} alt='preview' width={500} height={500} className="w-full h-[300px] object-content" /> <X className="flex justify-end w-full cursor-pointer" onClick={() => setPreviewUrl(null)} /> </div>}


                <div className="p-7 border shadow-md rounded-lg">
                    <h2 className="font-bold text-lg ">Select AI Model</h2>
                    <Select>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select AI Model" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                            {AiModelList.map((model,index)=>(

                                <SelectItem value={model.name}>
                                    <div key={index} className="flex items-center gap-1">
                                        <Image src={model.icon} alt={model.name} width={25} height={35} className="inline-block mr-2" />
                                        <h2>{model.name}</h2>
                                    </div>
                                    
                                </SelectItem>


                            ))}
                            
                        </SelectContent>
                    </Select>
                    <h2 className="font-bold text-lg mt-7">Enter Description about your webpage</h2>
                    <Textarea className="mt-3 h-[200px]" placeholder="Write about your webpage" />
                </div>

            </div>
            <div className="mt-10 flex justify-center">
                <Button><WandSparkles /> Convert to code</Button>
            </div>


        </div>
    )
}

export default ImageUpload;