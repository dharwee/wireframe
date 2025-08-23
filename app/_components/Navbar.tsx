'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import ProfileAvatar from './ProfileAvatar';

export default function Navbar() {
    const { user, loading, signInWithGoogle } = useAuth();

    return (
        <header className="border-b dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10">
            <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <svg
                        className="h-7 w-7 text-gray-800 dark:text-gray-200"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-bold text-xl text-gray-800 dark:text-gray-200">Wireframe2Code</span>
                </Link>
                
                <div className="flex items-center gap-4">
                    {loading ? (
                        <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
                    ) : user ? (
                        <ProfileAvatar />
                    ) : (
                        <Button variant="outline" onClick={signInWithGoogle}>
                            Login
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
}