import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Типы для удобства использования
export type Profile = Database['public']['Tables']['profiles']['Row']
export type InterviewResult = Database['public']['Tables']['interview_results']['Row']