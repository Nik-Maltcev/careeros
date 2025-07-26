// Система управления интервью с интеграцией Supabase
// Использует Supabase для авторизованных пользователей и localStorage для гостей

import { SupabaseAuthService } from './auth-supabase'

const INTERVIEWS_COUNT_KEY = "careeros_interviews_count"
const INTERVIEW_HISTORY_KEY = "careeros_interview_history"
const MAX_GUEST_INTERVIEWS = 1 // Гостям только 1 интервью

export interface InterviewResult {
  id: string
  specialty: string
  level: string
  overall_score: number
  questions_count: number
  completed_at: string
  analysis_data: any
}

export class InterviewManager {
  // Получить количество использованных интервью
  static async getUsedInterviewsCount(): Promise<number> {
    if (typeof window === "undefined") return 0
    
    try {
      const user = await SupabaseAuthService.getCurrentUser()
      
      if (user) {
        return user.interviews_used
      }
      
      // Гостевой режим - используем localStorage
      const count = localStorage.getItem(INTERVIEWS_COUNT_KEY)
      return count ? parseInt(count, 10) : 0
    } catch (error) {
      console.error("Error reading interviews count:", error)
      return 0
    }
  }

  // Получить количество оставшихся интервью
  static async getRemainingInterviews(): Promise<number> {
    try {
      const user = await SupabaseAuthService.getCurrentUser()
      
      if (user) {
        if (user.plan === 'premium') return 999
        return Math.max(0, user.max_interviews - user.interviews_used)
      }
      
      // Гостевой режим
      const used = await this.getUsedInterviewsCount()
      return Math.max(0, MAX_GUEST_INTERVIEWS - used)
    } catch (error) {
      console.error("Error getting remaining interviews:", error)
      return 0
    }
  }

  // Проверить, можно ли начать новое интервью
  static async canStartInterview(): Promise<{ canStart: boolean; reason?: string; remainingInterviews: number }> {
    try {
      return await SupabaseAuthService.canStartInterview()
    } catch (error) {
      console.error("Error checking interview availability:", error)
      return { canStart: false, reason: "Ошибка проверки доступности", remainingInterviews: 0 }
    }
  }

  // Записать использование интервью
  static async recordInterviewUsage(): Promise<void> {
    if (typeof window === "undefined") return

    try {
      const user = await SupabaseAuthService.getCurrentUser()
      
      if (user) {
        await SupabaseAuthService.recordInterviewUsage()
      } else {
        // Гостевой режим - используем localStorage
        const currentCount = await this.getUsedInterviewsCount()
        const newCount = currentCount + 1
        localStorage.setItem(INTERVIEWS_COUNT_KEY, newCount.toString())
        console.log(`Interview recorded (guest). Used: ${newCount}/${MAX_GUEST_INTERVIEWS}`)
      }
    } catch (error) {
      console.error("Error recording interview usage:", error)
    }
  }

  // Сохранить результат интервью
  static async saveInterviewResult(result: Omit<InterviewResult, "id" | "completed_at">): Promise<void> {
    if (typeof window === "undefined") return

    try {
      await SupabaseAuthService.saveInterviewResult(result)
    } catch (error) {
      console.error("Error saving interview result:", error)
    }
  }

  // Получить историю интервью
  static async getInterviewHistory(): Promise<InterviewResult[]> {
    if (typeof window === "undefined") return []

    try {
      return await SupabaseAuthService.getInterviewHistory()
    } catch (error) {
      console.error("Error reading interview history:", error)
      return []
    }
  }

  // Получить статистику
  static async getStats() {
    const history = await this.getInterviewHistory()
    const used = await this.getUsedInterviewsCount()
    const remaining = await this.getRemainingInterviews()

    if (history.length === 0) {
      return {
        totalInterviews: used,
        remainingInterviews: remaining,
        averageScore: 0,
        bestScore: 0,
        specialtyStats: {}
      }
    }

    const scores = history.map(h => h.overall_score || 0)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const bestScore = Math.max(...scores)

    // Статистика по специальностям
    const specialtyStats = history.reduce((acc, interview) => {
      const specialty = interview.specialty
      if (!acc[specialty]) {
        acc[specialty] = { count: 0, totalScore: 0, averageScore: 0 }
      }
      acc[specialty].count++
      acc[specialty].totalScore += interview.overall_score || 0
      acc[specialty].averageScore = acc[specialty].totalScore / acc[specialty].count
      return acc
    }, {} as Record<string, { count: number; totalScore: number; averageScore: number }>)

    return {
      totalInterviews: used,
      remainingInterviews: remaining,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore: Math.round(bestScore * 10) / 10,
      specialtyStats
    }
  }

  // Сбросить все данные (для отладки)
  static resetAllData(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(INTERVIEWS_COUNT_KEY)
      localStorage.removeItem(INTERVIEW_HISTORY_KEY)
      console.log("All interview data has been reset")
    } catch (error) {
      console.error("Error resetting data:", error)
    }
  }

  // Получить информацию для отладки
  static async getDebugInfo() {
    return {
      usedInterviews: await this.getUsedInterviewsCount(),
      remainingInterviews: await this.getRemainingInterviews(),
      maxInterviews: MAX_GUEST_INTERVIEWS,
      historyCount: (await this.getInterviewHistory()).length,
      canStart: await this.canStartInterview()
    }
  }
}

// Глобальные функции для консоли браузера (для отладки)
if (typeof window !== "undefined") {
  (window as any).resetInterviews = () => {
    InterviewManager.resetAllData()
    window.location.reload()
  }
  (window as any).debugInterviews = async () => {
    console.log("Interview Debug Info:", await InterviewManager.getDebugInfo())
  }
}