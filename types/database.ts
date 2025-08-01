export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          created_at: string
          plan: string | null
          interviews_used: number
          max_interviews: number
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          created_at?: string
          plan?: string | null
          interviews_used?: number
          max_interviews?: number
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          created_at?: string
          plan?: string | null
          interviews_used?: number
          max_interviews?: number
        }
      }
      interview_results: {
        Row: {
          id: string
          user_id: string
          specialty: string
          level: string
          overall_score: number | null
          questions_count: number
          analysis_data: any
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          specialty: string
          level: string
          overall_score?: number | null
          questions_count: number
          analysis_data: any
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          specialty?: string
          level?: string
          overall_score?: number | null
          questions_count?: number
          analysis_data?: any
          completed_at?: string | null
        }
      }
    }
  }
}