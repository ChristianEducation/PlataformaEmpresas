import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ralzixlkpygaxiquubdm.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbHppeGxrcHlnYXhpcXV1YmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTY3MDIsImV4cCI6MjA2NTI3MjcwMn0.XkK6cD_PE-oQy61p1Bn2D7w4y8T9us2VHDHW3tr5kLc"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}
