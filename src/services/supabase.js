import { createClient } from "@supabase/supabase-js";

const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || "";

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
