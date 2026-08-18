import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_ORG_ID = "4fc2ef26-2fa6-43c1-9e7f-7362ac747a26";
export const DEFAULT_BRANCH_ID = "677f6f26-77d1-4a26-ab13-7c2f5a2994f9";
