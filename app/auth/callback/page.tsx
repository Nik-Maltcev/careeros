"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, Home } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase не настроен")
        }

        console.log("Processing auth callback...")
        console.log("Current URL:", window.location.href)

        // Получаем параметры из hash части URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const urlParams = new URLSearchParams(window.location.search)

        // Логируем все параметры
        console.log("Hash params:", Object.fromEntries(hashParams.entries()))
        console.log("URL params:", Object.fromEntries(urlParams.entries()))

        // Проверяем параметры из hash (приоритет)
        const access_token = hashParams.get("access_token") || urlParams.get("access_token")
        const refresh_token = hashParams.get("refresh_token") || urlParams.get("refresh_token")
        const expires_at = hashParams.get("expires_at") || urlParams.get("expires_at")
        const token_type = hashParams.get("token_type") || urlParams.get("token_type")
        const type = hashParams.get("type") || urlParams.get("type")

        // Также проверяем старые параметры
        const token = urlParams.get("token")
        const oldType = urlParams.get("type")

        console.log("Extracted params:", {
          access_token: access_token ? "present" : "missing",
          refresh_token: refresh_token ? "present" : "missing",
          expires_at,
          token_type,
          type,
          oldToken: token ? "present" : "missing",
          oldType,
        })

        // Если есть access_token и refresh_token из hash, устанавливаем сессию
        if (access_token && refresh_token) {
          console.log("Setting session with tokens from hash...")

          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })

          if (error) {
            console.error("Session error:", error)
            throw new Error("Ошибка установки сессии: " + error.message)
          }

          console.log("Session set successfully:", data)

          // Проверяем, что пользователь действительно аутентифицирован
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            console.log("User authenticated:", user.email)
            setStatus("success")
            setMessage("Email успешно подтвержден! Добро пожаловать!")

            // Очищаем URL от токенов
            window.history.replaceState({}, document.title, "/auth/callback")

            // Перенаправляем на главную страницу через 2 секунды
            setTimeout(() => {
              router.push("/")
            }, 2000)
          } else {
            throw new Error("Не удалось получить данные пользователя после установки сессии")
          }
          return
        }

        // Если есть старые параметры token и type, обрабатываем как OTP
        if (token && oldType) {
          console.log("Processing OTP verification...")

          if (oldType === "signup") {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: "email",
            })

            if (error) {
              console.error("Email verification error:", error)
              throw new Error("Ошибка подтверждения email: " + error.message)
            }

            console.log("Email verification successful:", data)
            setStatus("success")
            setMessage("Email успешно подтвержден! Теперь вы можете войти в систему.")

            setTimeout(() => {
              router.push("/")
            }, 3000)
          } else {
            throw new Error("Неизвестный тип подтверждения: " + oldType)
          }
          return
        }

        // Если нет ни тех, ни других параметров
        throw new Error("Отсутствуют необходимые параметры для подтверждения")
      } catch (error: any) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage(error.message || "Произошла ошибка при подтверждении")
      }
    }

    // Небольшая задержка для загрузки всех параметров
    const timer = setTimeout(handleAuthCallback, 100)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            {status === "loading" && (
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {status === "loading" && "Подтверждение email..."}
            {status === "success" && "Email подтвержден!"}
            {status === "error" && "Ошибка подтверждения"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">{message}</p>

          {status === "success" && (
            <div className="space-y-3">
              <p className="text-sm text-green-300">Перенаправление на главную страницу...</p>
              <Link href="/">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                  <Home className="w-4 h-4 mr-2" />
                  Перейти на главную
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-red-300">Попробуйте зарегистрироваться заново или обратитесь в поддержку</p>
              <div className="space-y-2">
                <Link href="/">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                    <Home className="w-4 h-4 mr-2" />
                    Вернуться на главную
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Попробовать снова
                </Button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Пожалуйста, подождите...</p>
              <div className="text-xs text-gray-500">Обработка токенов аутентификации</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
