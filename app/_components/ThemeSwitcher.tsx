'use client';

import { useTheme } from 'next-themes';
import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <div className='p-2 flex items-center justify-left'>
     
      <Select onValueChange={(value) => setTheme(value)} defaultValue={theme}>
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Select Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className='flex items-center gap-2'>
              <Sun className='w-4 h-4' /> Light
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className='flex items-center gap-2'>
              <Moon className='w-4 h-4' /> Dark
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className='flex items-center gap-2'>
              <Monitor className='w-4 h-4' /> System
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}