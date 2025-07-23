// Простая система управления интервью без авторизации
// Использует localStorage для хранения данных

const INTERVIEWS_COUNT_KEY = "careeros_interviews_count"
const INTERVIEW_HISTORY_KEY = "careeros_interview_history"
const MAX_FREE_INTERVIEWS = 3

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
  static getUsedInterviewsCount(): number {
    if (typeof window === "undefined") return 0
    
    try {
      const count = localStorage.getItem(INTERVIEWS_COUNT_KEY)
      return count ? parseInt(count, 10) : 0
    } catch (error) {
      console.error("Error reading interviews count:", error)
      return 0
    }
  }

  // Получить количество оставшихся интервью
  static getRemainingInterviews(): number {
    const used = this.getUsedInterviewsCount()
    return Math.max(0, MAX_FREE_INTERVIEWS - used)
  }

  // Проверить, можно ли начать новое интервью
  static canStartInterview(): { canStart: boolean; reason?: string; remainingInterviews: number } {
    const remaining = this.getRemainingInterviews()
    
    if (remaining <= 0) {
      return {
        canStart: false,
        reason: `Вы использовали все ${MAX_FREE_INTERVIEWS} бесплатных интервью. Обновите страницу или очистите данные браузера для сброса.`,
        remainingInterviews: 0
      }
    }

    return {
      canStart: true,
      remainingInterviews: remaining
    }
  }

  // Записать использование интервью
  static recordInterviewUsage(): void {
    if (typeof window === "undefined") return

    try {
      const currentCount = this.getUsedInterviewsCount()
      const newCount = currentCount + 1
      localStorage.setItem(INTERVIEWS_COUNT_KEY, newCount.toString())
      console.log(`Interview recorded. Used: ${newCount}/${MAX_FREE_INTERVIEWS}`)
    } catch (error) {
      console.error("Error recording interview usage:", error)
    }
  }

  // Сохранить результат интервью
  static saveInterviewResult(result: Omit<InterviewResult, "id" | "completed_at">): void {
    if (typeof window === "undefined") return

    try {
      const history = this.getInterviewHistory()
      const newResult: InterviewResult = {
        ...result,
        id: Date.now().toString(),
        completed_at: new Date().toISOString()
      }

      history.unshift(newResult) // Добавляем в начало массива
      
      // Ограничиваем историю 50 записями
      const limitedHistory = history.slice(0, 50)
      
      localStorage.setItem(INTERVIEW_HISTORY_KEY, JSON.stringify(limitedHistory))
      console.log("Interview result saved to history")
    } catch (error) {
      console.error("Error saving interview result:", error)
    }
  }

  // Получить историю интервью
  static getInterviewHistory(): InterviewResult[] {
    if (typeof window === "undefined") return []

    try {
      const history = localStorage.getItem(INTERVIEW_HISTORY_KEY)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error("Error reading interview history:", error)
      return []
    }
  }

  // Получить статистику
  static getStats() {
    const history = this.getInterviewHistory()
    const used = this.getUsedInterviewsCount()
    const remaining = this.getRemainingInterviews()

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
  static getDebugInfo() {
    return {
      usedInterviews: this.getUsedInterviewsCount(),
      remainingInterviews: this.getRemainingInterviews(),
      maxInterviews: MAX_FREE_INTERVIEWS,
      historyCount: this.getInterviewHistory().length,
      canStart: this.canStartInterview()
    }
  }
}

// Глобальные функции для консоли браузера (для отладки)
if (typeof window !== "undefined") {
  (window as any).InterviewManager = InterviewManager
  (window as any).resetInterviews = () => {
    InterviewManager.resetAllData()
    window.location.reload()
  }
  (window as any).debugInterviews = () => {
    console.log("Interview Debug Info:", InterviewManager.getDebugInfo())
  }
}