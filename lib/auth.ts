export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  plan: "free" | "premium"
  interviewsUsed: number
  maxInterviews: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Проверка на клиентскую среду
const isClient = typeof window !== "undefined"

// Простая система аутентификации через localStorage
export class AuthService {
  private static readonly USER_KEY = "ai_interview_user"
  private static readonly GUEST_INTERVIEWS_KEY = "ai_interview_guest_count"

  static getCurrentUser(): User | null {
    if (!isClient) return null

    try {
      const userData = localStorage.getItem(this.USER_KEY)
      if (!userData) return null
      return JSON.parse(userData)
    } catch {
      return null
    }
  }

  static isAuthenticated(): boolean {
    if (!isClient) return false
    return this.getCurrentUser() !== null
  }

  static register(email: string, name: string, password: string): User {
    if (!isClient) throw new Error("Registration only available on client")

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      createdAt: new Date().toISOString(),
      plan: "free",
      interviewsUsed: 0,
      maxInterviews: 10, // Free plan: 10 interviews
    }

    localStorage.setItem(this.USER_KEY, JSON.stringify(user))

    // Очищаем счетчик гостевых интервью при регистрации
    localStorage.removeItem(this.GUEST_INTERVIEWS_KEY)

    return user
  }

  static login(email: string, password: string): User | null {
    if (!isClient) return null

    // В реальном приложении здесь была бы проверка на сервере
    // Для демо просто проверяем, есть ли пользователь с таким email
    const existingUser = this.getCurrentUser()
    if (existingUser && existingUser.email === email) {
      return existingUser
    }
    return null
  }

  static logout(): void {
    if (!isClient) return
    localStorage.removeItem(this.USER_KEY)
  }

  static updateUser(updates: Partial<User>): User | null {
    if (!isClient) return null

    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    const updatedUser = { ...currentUser, ...updates }
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser))
    return updatedUser
  }

  static canStartInterview(): { canStart: boolean; reason?: string; remainingInterviews?: number } {
    if (!isClient) {
      // На сервере возвращаем безопасные значения по умолчанию
      return { canStart: true, remainingInterviews: 1 }
    }

    const user = this.getCurrentUser()

    if (user) {
      // Зарегистрированный пользователь
      const remaining = user.maxInterviews - user.interviewsUsed
      if (remaining > 0) {
        return { canStart: true, remainingInterviews: remaining }
      } else {
        return {
          canStart: false,
          reason:
            user.plan === "free"
              ? "Достигнут лимит бесплатного плана. Обновите до Premium для неограниченных интервью."
              : "Достигнут лимит интервью.",
        }
      }
    } else {
      // Гостевой пользователь
      const guestCount = Number.parseInt(localStorage.getItem(this.GUEST_INTERVIEWS_KEY) || "0")
      if (guestCount < 1) {
        return { canStart: true, remainingInterviews: 1 - guestCount }
      } else {
        return {
          canStart: false,
          reason: "Вы уже прошли бесплатное интервью. Зарегистрируйтесь для получения дополнительных интервью.",
        }
      }
    }
  }

  static recordInterviewUsage(): void {
    if (!isClient) return

    const user = this.getCurrentUser()

    if (user) {
      // Увеличиваем счетчик для зарегистрированного пользователя
      this.updateUser({ interviewsUsed: user.interviewsUsed + 1 })
    } else {
      // Увеличиваем счетчик для гостя
      const currentCount = Number.parseInt(localStorage.getItem(this.GUEST_INTERVIEWS_KEY) || "0")
      localStorage.setItem(this.GUEST_INTERVIEWS_KEY, (currentCount + 1).toString())
    }
  }

  static getInterviewHistory(): any[] {
    if (!isClient) return []

    const historyKey = this.isAuthenticated()
      ? `interview_history_${this.getCurrentUser()?.id}`
      : "interview_history_guest"

    try {
      const history = localStorage.getItem(historyKey)
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  }

  static saveInterviewResult(result: any): void {
    if (!isClient) return

    const historyKey = this.isAuthenticated()
      ? `interview_history_${this.getCurrentUser()?.id}`
      : "interview_history_guest"

    const history = this.getInterviewHistory()
    history.push({
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      completedAt: new Date().toISOString(),
    })

    // Ограничиваем историю последними 50 интервью
    const limitedHistory = history.slice(-50)
    localStorage.setItem(historyKey, JSON.stringify(limitedHistory))
  }
}
