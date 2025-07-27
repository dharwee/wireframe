// app/(routes)/layout.tsx
"use client"; // 👈 This must be a client component
import React from 'react';
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // 👈 Import from 'next/navigation'
import { useAuth } from '../../context/AuthContext'; // 👈 Adjust path to your context
// import Dashboard from './dashboard/page';
import DashboardProvider from './provider';
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is finished
    if (!loading) {
      // If there is no user, redirect to the login page
      if (!user) {
        router.push('/login'); // 👈 Change '/login' to your actual login page URL
      }
    }
  }, [user, loading, router]);

  // While checking for user, you can show a loading spinner
  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  // If user is authenticated, render the page
  if (user) {
    return <>
    <DashboardProvider>
    {children}
    </DashboardProvider>
    </>;
  }

  // If no user, return null while redirecting
  return null;
}