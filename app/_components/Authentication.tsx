// app/_components/Authentication.tsx
"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient'; // ✅ ADD: Import the Supabase client

// ✅ FIX: Use proper TypeScript type for children
function Authentication({ children }: { children: React.ReactNode }) {

    // ✅ REWRITE: The sign-in function to use Supabase
    const onGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });

        if (error) {
            console.error('Error signing in with Google:', error.message);
        }
    };

    return (
        <div>
            {/* The onClick now calls the Supabase function */}
            <div onClick={onGoogleSignIn} style={{ cursor: 'pointer' }}>
                {children}
            </div>
        </div>
    );
}

export default Authentication;