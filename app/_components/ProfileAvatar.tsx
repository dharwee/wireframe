'use client';

import React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

function ProfileAvatar() {
    // This gets the user and the CORRECT logout function from our auth context
    const { user, logout } = useAuth();

    const avatarUrl = user?.user_metadata?.avatar_url;
    const userEmail = user?.email || '';
    const initial = userEmail.charAt(0).toUpperCase();

    return (
        <div>
            <Popover>
                <PopoverTrigger>
                    {avatarUrl ? (
                        <Image 
                            src={avatarUrl} 
                            alt='profile' 
                            width={40} 
                            height={40} 
                            className='rounded-full' 
                        />
                    ) : (
                        <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold'>
                            {initial}
                        </div>
                    )}
                </PopoverTrigger>
                <PopoverContent className='w-40'>
                    <p className="text-sm text-gray-500 truncate mb-2">{userEmail}</p>
                    {/* This button now correctly calls the logout function from the context */}
                    <Button variant={'ghost'} onClick={logout} className='w-full justify-start'>
                        Logout
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default ProfileAvatar;