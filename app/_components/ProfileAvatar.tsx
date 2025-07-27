"use client";
import React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext'; // ✅ USE: The correct hook from our Supabase context

function ProfileAvatar() {
    // ✅ FIX: Use the useAuth hook and destructure user and logout
    const { user, logout } = useAuth();

    // The Supabase user object from Google OAuth has the avatar URL here.
    const avatarUrl = user?.user_metadata?.avatar_url;

    return (
        <div>
            <Popover>
                <PopoverTrigger>
                    {/* ✅ FIX: Update the image source to use Supabase's user metadata */}
                    {avatarUrl && <img src={avatarUrl} alt='profile' className='w-[35px] h-[35px] rounded-full' />}
                </PopoverTrigger>
                <PopoverContent className='w-[100px] max-w-sm'>
                    {/* ✅ FIX: The logout button now calls the logout function from our context */}
                    <Button variant={'ghost'} onClick={logout} className=''>
                        Logout
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default ProfileAvatar;