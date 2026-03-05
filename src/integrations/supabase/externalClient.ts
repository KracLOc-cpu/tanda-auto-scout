import { createClient } from '@supabase/supabase-js';

export const EXTERNAL_SUPABASE_URL = "https://gefiyoyjfosvrvxybmhg.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZml5b3lqZm9zdnJ2eHlibWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzg0OTIsImV4cCI6MjA4NzkxNDQ5Mn0.a6TJuHQK40DQJ9XtjMXTDST_LLZtjSAKXNi64IVwcOc";

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
