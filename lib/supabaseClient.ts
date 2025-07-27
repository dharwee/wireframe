// src/lib/supabaseClient.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// The createPagesBrowserClient function is already typed by the library
export const supabase = createPagesBrowserClient();