// // src/lib/supabaseClient.ts
// import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// // The createPagesBrowserClient function is already typed by the library
// export const supabase = createPagesBrowserClient();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
