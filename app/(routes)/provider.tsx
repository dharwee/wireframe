"use client"
import React, { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'; // ✅ FIX: Import the correct Supabase auth hook
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import axios from "axios";
import AppHeader from '../_components/AppHeader';
import { AppSidebar } from '../_components/AppSidebar';
import { User } from '@supabase/supabase-js'; 

function DashboardProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
   
    const { user } = useAuth();
    const router = useRouter();

 
    // The route protection is now handled by app/(routes)/layout.tsx
    useEffect(() => {
        if (user) {
            checkUser(user);
        }
    }, [user]);


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