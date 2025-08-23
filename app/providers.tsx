// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { AuthContextProvider } from '@/context/AuthContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import React, { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <AuthContextProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AuthContextProvider>
    </ThemeProvider>
  )
}