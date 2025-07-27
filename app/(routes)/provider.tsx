"use client"
import React, { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'; // ✅ FIX: Import the correct Supabase auth hook
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import axios from "axios";
import AppHeader from '../_components/AppHeader';
import { AppSidebar } from '../_components/AppSidebar';
import { User } from '@supabase/supabase-js'; // ✅ ADD: Import Supabase User type for clarity

function DashboardProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // ✅ FIX: Use the Supabase auth hook
    const { user } = useAuth();
    const router = useRouter();

    // ✅ FIX: This effect now only handles syncing the user to your own DB.
    // The route protection is now handled by app/(routes)/layout.tsx
    useEffect(() => {
        if (user) {
            checkUser(user);
        }
    }, [user]);

    // ✅ FIX: Update function to use Supabase user object structure
    const checkUser = async (currentUser: User) => {
        try {
            await axios.post('/api/user', {
                // Supabase stores the name from Google in user_metadata
                userName: currentUser.user_metadata?.full_name,
                userEmail: currentUser.email
            });
        } catch (error) {
            console.error("Failed to sync user:", error);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full'>
                <AppHeader />
                <div className='p-10'>{children}</div>
            </main>
        </SidebarProvider>
    );
}

export default DashboardProvider;