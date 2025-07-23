import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  email: string
  name: string
  plan: "free" | "premium"
  max_interviews: number
  interviews_used: number
  created_at: string
  updated_at?: string
}

// Константы для localStorage ключей
const GUEST_INTERVIEWS_KEY = "ai_interview_guest_count"
const DEBUG_MODE_KEY = "ai_interview_debug"

export class SupabaseAuthService {
  // Утилиты для работы с localStorage
  private static getFromStorage(key: string, defaultValue = "0"): string {
    if (typeof window === "undefined") return defaultValue
    try {
      return localStorage.getItem(key) || defaultValue
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return defaultValue
    }
  }

  private static setToStorage(key: string, value: string): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  }

  private static removeFromStorage(key: string): void {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  }

  // Методы для отладки
  static enableDebugMode(): void {
    this.setToStorage(DEBUG_MODE_KEY, "true")
    console.log("🐛 Debug mode enabled")
  }

  static disableDebugMode(): void {
    this.removeFromStorage(DEBUG_MODE_KEY)
    console.log("🐛 Debug mode disabled")
  }

  private static isDebugMode(): boolean {
    return this.getFromStorage(DEBUG_MODE_KEY) === "true"
  }

  private static debugLog(...args: any[]): void {
    if (this.isDebugMode()) {
      console.log("🐛 [AUTH DEBUG]", ...args)
    }
  }

  // Методы для работы с гостевыми интервью
  static getGuestInterviewCount(): number {
    const count = Number.parseInt(this.getFromStorage(GUEST_INTERVIEWS_KEY, "0"))
    this.debugLog("Guest interview count:", count)
    return count
  }

  static setGuestInterviewCount(count: number): void {
    this.setToStorage(GUEST_INTERVIEWS_KEY, count.toString())
    this.debugLog("Set guest interview count to:", count)
  }

  static resetGuestInterviews(): void {
    this.removeFromStorage(GUEST_INTERVIEWS_KEY)
    this.debugLog("Reset guest interviews")
    console.log("✅ Guest interviews reset successfully")
  }

  static incrementGuestInterviews(): void {
    const current = this.getGuestInterviewCount()
    const newCount = current + 1
    this.setGuestInterviewCount(newCount)
    this.debugLog("Incremented guest interviews from", current, "to", newCount)
  }

  static async getCurrentUser(): Promise<Profile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        this.debugLog("No authenticated user found")
        return null
      }

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      this.debugLog(
        "Current user:",
        profile.email,
        "Plan:",
        profile.plan,
        "Used:",
        profile.interviews_used,
        "Max:",
        profile.max_interviews,
      )
      return profile
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  static async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: "Произошла ошибка при входе" }
    }
  }

  static async register(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: "Произошла ошибка при регистрации" }
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error logging out:", error)
      }
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  static async canStartInterview(): Promise<{ canStart: boolean; reason?: string; remainingInterviews: number }> {
    try {
      this.debugLog("=== Checking interview limits ===")

      const user = await this.getCurrentUser()

      if (!user) {
        // Гостевой режим
        const guestCount = this.getGuestInterviewCount()
        const maxGuestInterviews = 1
        const remaining = Math.max(0, maxGuestInterviews - guestCount)

        this.debugLog("Guest mode - Count:", guestCount, "Max:", maxGuestInterviews, "Remaining:", remaining)

        if (guestCount >= maxGuestInterviews) {
          this.debugLog("Guest limit exceeded")
          return {
            canStart: false,
            reason: "Достигнут лимит для гостей. Зарегистрируйтесь для получения дополнительных интервью.",
            remainingInterviews: 0,
          }
        }

        this.debugLog("Guest can start interview")
        return { canStart: true, remainingInterviews: remaining }
      }

      // Зарегистрированный пользователь
      if (user.plan === "premium") {
        this.debugLog("Premium user - unlimited interviews")
        return { canStart: true, remainingInterviews: 999 }
      }

      const remaining = Math.max(0, user.max_interviews - user.interviews_used)
      this.debugLog(
        "Registered user - Used:",
        user.interviews_used,
        "Max:",
        user.max_interviews,
        "Remaining:",
        remaining,
      )

      if (remaining <= 0) {
        this.debugLog("User limit exceeded")
        return {
          canStart: false,
          reason: "Достигнут лимит интервью. Обновите план для продолжения.",
          remainingInterviews: 0,
        }
      }

      this.debugLog("User can start interview")
      return { canStart: true, remainingInterviews: remaining }
    } catch (error) {
      console.error("Error checking interview limit:", error)
      this.debugLog("Error in canStartInterview:", error)
      return { canStart: false, reason: "Ошибка проверки лимита", remainingInterviews: 0 }
    }
  }

  static async recordInterviewUsage(): Promise<void> {
    try {
      this.debugLog("=== Recording interview usage ===")

      const user = await this.getCurrentUser()

      if (!user) {
        // Гостевой режим
        this.incrementGuestInterviews()
        this.debugLog("Guest interview usage recorded")
        return
      }

      // Зарегистрированный пользователь
      const newUsageCount = user.interviews_used + 1
      const { error } = await supabase
        .from("profiles")
        .update({
          interviews_used: newUsageCount,
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error incrementing interview count:", error)
        throw error
      }

      this.debugLog("User interview usage recorded - new count:", newUsageCount)
    } catch (error) {
      console.error("Error recording interview usage:", error)
      throw error
    }
  }

  // Алиас для совместимости
  static async incrementInterviewCount(): Promise<void> {
    return this.recordInterviewUsage()
  }

  static async handleAuthCallback() {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Auth callback error:", error)
        return { success: false, error: error.message }
      }

      if (data.session) {
        return { success: true, message: "Успешная авторизация!" }
      }

      return { success: false, error: "Сессия не найдена" }
    } catch (error) {
      console.error("Auth callback error:", error)
      return { success: false, error: "Ошибка обработки авторизации" }
    }
  }

  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      this.debugLog("Auth state change:", event, session?.user?.email || "No user")
      callback(session?.user || null)
    })
  }

  static async saveInterviewResult(result: {
    specialty: string
    level: string
    overall_score: number
    questions_count: number
    analysis_data: any
  }) {
    try {
      const user = await this.getCurrentUser()
      if (!user) {
        this.debugLog("No user found, skipping result save")
        return
      }

      const { error } = await supabase.from("interview_results").insert({
        user_id: user.id,
        specialty: result.specialty,
        level: result.level,
        overall_score: result.overall_score,
        questions_count: result.questions_count,
        analysis_data: result.analysis_data,
      })

      if (error) {
        console.error("Error saving interview result:", error)
        throw error
      }

      this.debugLog("Interview result saved successfully")
    } catch (error) {
      console.error("Error in saveInterviewResult:", error)
      throw error
    }
  }

  static async getInterviewHistory() {
    try {
      const user = await this.getCurrentUser()
      if (!user) return []

      const { data, error } = await supabase
        .from("interview_results")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })

      if (error) {
        console.error("Error getting interview history:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getInterviewHistory:", error)
      return []
    }
  }

  // Метод для полного сброса (для отладки)
  static fullReset(): void {
    this.resetGuestInterviews()
    this.removeFromStorage(DEBUG_MODE_KEY)
    console.log("🔄 Full reset completed")
  }

  // Метод для получения статуса отладки
  static getDebugInfo(): any {
    return {
      guestCount: this.getGuestInterviewCount(),
      debugMode: this.isDebugMode(),
      localStorage:
        typeof window !== "undefined"
          ? {
              [GUEST_INTERVIEWS_KEY]: this.getFromStorage(GUEST_INTERVIEWS_KEY),
              [DEBUG_MODE_KEY]: this.getFromStorage(DEBUG_MODE_KEY),
            }
          : null,
    }
  }
}
