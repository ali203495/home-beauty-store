const SUPABASE_URL = 'https://usagnvqnkunfotfoodqs.supabase.co';
// PLEASE REPLACE 'YOUR_ANON_KEY_HERE' WITH YOUR ACTUAL SUPABASE API KEY
const SUPABASE_ANON_KEY = 'sb_publishable_XqW8d5UxWcVGLCk7YPFALw_oYDH4Uu0';

if (!window.supabase) {
    console.error("Supabase library not loaded!");
}

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabase;

