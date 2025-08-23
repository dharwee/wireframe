'use client'

import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CircleDollarSign, Home, Paintbrush, Settings } from "lucide-react"
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from './ThemeSwitcher' // Assuming this is still here

const items = [
    {
        title: "Workspace",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Design",
        url: "/design",
        icon: Paintbrush,
    },
    {
        title: "Credits",
        url: "/credits",
        icon: CircleDollarSign,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
    
]

export function AppSidebar() {
    const path = usePathname();
    console.log(path);
    return (
        <Sidebar className="dark:bg-gray-950 dark:text-gray-200">
            <SidebarHeader>
                <div className='p-4'>
                    <Image src={'./logo.svg'} alt='logo' width={100} height={100}
                        className='w-full h-full' />
                    <h2 className='text-sm text-gray-400 dark:text-gray-500 text-center'>Build Awesome</h2>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className='mt-5'>
                            {items.map((item, index) => (
                                <a href={item.url} key={index}
                                className={`p-2 text-lg flex gap-2 items-center
                                 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg 
                                 ${path===item.url ? 'bg-blue-200 dark:bg-blue-800' : ''}`}>
                                    <item.icon className='h-5 w-5' />
                                    <span>{item.title}</span>
                                </a>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
          
            <SidebarFooter>
              <h2 className='p-2 text-gray-400 dark:text-gray-500 text-sm'>Made with ❤️</h2>
            </SidebarFooter>
        </Sidebar>
    )
}