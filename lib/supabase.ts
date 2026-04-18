import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// RLS is disabled on the tasks table — this is a single-user app with no auth.
// All access is controlled by the anon key scoped to this project only.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
