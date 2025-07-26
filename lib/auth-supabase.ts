import { supabase, isSupabaseConfigured } from "./supabase"
import type { Profile } from "./supabase"

export class SupabaseAuthService {
  // Получить текущего пользователя
  static async getCurrentUser(): Promise<Profile | null> {
    if (!isSupabaseConfigured) {
      return null
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return null
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return profile
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  // Регистрация
  static async register(email: string, password: string, name: string) {
    if (!isSupabaseConfigured) {
      return { success: false, error: "Supabase не настроен" }
    }

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

  // Вход
  static async login(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { success: false, error: "Supabase не настроен" }
    }

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

  // Выход
  static async logout() {
    if (!isSupabaseConfigured) {
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error logging out:", error)
      }
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Проверка лимитов интервью
  static async canStartInterview(): Promise<{ canStart: boolean; reason?: string; remainingInterviews: number }> {
    try {
      if (!isSupabaseConfigured) {
        // Без Supabase - используем localStorage лимиты
        const INTERVIEWS_COUNT_KEY = "careeros_interviews_count"
        const MAX_FREE_INTERVIEWS = 3
        const used = parseInt(localStorage.getItem(INTERVIEWS_COUNT_KEY) || "0", 10)
        const remaining = Math.max(0, MAX_FREE_INTERVIEWS - used)
        
        if (remaining <= 0) {
          return {
            canStart: false,
            reason: `Вы использовали все ${MAX_FREE_INTERVIEWS} бесплатных интервью. Обновите страницу или очистите данные браузера для сброса.`,
            remainingInterviews: 0,
          }
        }
        
        return { canStart: true, remainingInterviews: remaining }
      }

      const user = await this.getCurrentUser()

      if (!user) {
        // Гостевой режим - проверяем localStorage для 1 бесплатного интервью
        const INTERVIEWS_COUNT_KEY = "careeros_interviews_count"
        const MAX_GUEST_INTERVIEWS = 1
        const used = parseInt(localStorage.getItem(INTERVIEWS_COUNT_KEY) || "0", 10)
        const remaining = Math.max(0, MAX_GUEST_INTERVIEWS - used)
        
        if (remaining <= 0) {
          return {
            canStart: false,
            reason: `Вы использовали бесплатное интервью. Зарегистрируйтесь или купите тариф для продолжения.`,
            remainingInterviews: 0,
          }
        }
        
        return { canStart: true, remainingInterviews: remaining }
      }

      if (user.plan === "premium") {
        return { canStart: true, remainingInterviews: 999 }
      }

      const remaining = user.max_interviews - user.interviews_used

      if (remaining <= 0) {
        return {
          canStart: false,
          reason: "Достигнут лимит интервью. Обновите план для продолжения.",
          remainingInterviews: 0,
        }
      }

      return { canStart: true, remainingInterviews: remaining }
    } catch (error) {
      console.error("Error checking interview limit:", error)
      return { canStart: false, reason: "Ошибка проверки лимита", remainingInterviews: 0 }
    }
  }

  // Записать использование интервью
  static async recordInterviewUsage(): Promise<void> {
    try {
      if (!isSupabaseConfigured) {
        // Без Supabase - используем localStorage
        const INTERVIEWS_COUNT_KEY = "careeros_interviews_count"
        const currentCount = parseInt(localStorage.getItem(INTERVIEWS_COUNT_KEY) || "0", 10)
        localStorage.setItem(INTERVIEWS_COUNT_KEY, (currentCount + 1).toString())
        return
      }

      const user = await this.getCurrentUser()

      if (!user) {
        // Гостевой режим - записываем в localStorage
        const INTERVIEWS_COUNT_KEY = "careeros_interviews_count"
        const currentCount = parseInt(localStorage.getItem(INTERVIEWS_COUNT_KEY) || "0", 10)
        localStorage.setItem(INTERVIEWS_COUNT_KEY, (currentCount + 1).toString())
        console.log(`Guest interview recorded. Used: ${currentCount + 1}`)
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          interviews_used: user.interviews_used + 1,
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error incrementing interview count:", error)
        throw error
      }
    } catch (error) {
      console.error("Error recording interview usage:", error)
      throw error
    }
  }

  // Сохранить результат интервью
  static async saveInterviewResult(result: {
    specialty: string
    level: string
    overall_score: number
    questions_count: number
    analysis_data: any
  }) {
    try {
      if (!isSupabaseConfigured) {
        // Без Supabase - сохраняем в localStorage
        const guestResults = JSON.parse(localStorage.getItem("guest_interview_results") || "[]")
        guestResults.push({
          ...result,
          id: Date.now().toString(),
          completed_at: new Date().toISOString(),
        })
        localStorage.setItem("guest_interview_results", JSON.stringify(guestResults))
        return
      }

      const user = await this.getCurrentUser()
      if (!user) {
        // Гостевой режим - сохраняем в localStorage
        const guestResults = JSON.parse(localStorage.getItem("guest_interview_results") || "[]")
        guestResults.push({
          ...result,
          id: Date.now().toString(),
          completed_at: new Date().toISOString(),
        })
        localStorage.setItem("guest_interview_results", JSON.stringify(guestResults))
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
    } catch (error) {
      console.error("Error in saveInterviewResult:", error)
      throw error
    }
  }

  // Получить историю интервью
  static async getInterviewHistory() {
    try {
      if (!isSupabaseConfigured) {
        // Без Supabase - читаем из localStorage
        return JSON.parse(localStorage.getItem("guest_interview_results") || "[]")
      }

      const user = await this.getCurrentUser()
      if (!user) {
        // Гостевой режим - читаем из localStorage
        return JSON.parse(localStorage.getItem("guest_interview_results") || "[]")
      }

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

  // Подписка на изменения аутентификации
  static onAuthStateChange(callback: (user: any) => void) {
    if (!isSupabaseConfigured) {
      // Без Supabase возвращаем пустую подписку
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })

    return { data }
  }
}