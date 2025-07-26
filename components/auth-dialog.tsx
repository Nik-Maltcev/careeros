"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Brain, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react"

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Форма входа
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })
  
  // Форма регистрации
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await SupabaseAuthService.login(loginForm.email, loginForm.password)
      
      if (result.success) {
        setSuccess("Успешный вход в систему!")
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 1000)
      } else {
        setError(result.error || "Ошибка входа")
      }
    } catch (error) {
      setError("Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Валидация
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Пароли не совпадают")
      setIsLoading(false)
      return
    }

    if (registerForm.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      setIsLoading(false)
      return
    }

    try {
      const result = await SupabaseAuthService.register(
        registerForm.email,
        registerForm.password,
        registerForm.name
      )
      
      if (result.success) {
        setSuccess("Регистрация успешна! Проверьте email для подтверждения.")
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      } else {
        setError(result.error || "Ошибка регистрации")
      }
    } catch (error) {
      setError("Произошла ошибка при регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-white">Careeros</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            {isSupabaseConfigured 
              ? "Войдите или зарегистрируйтесь для получения неограниченного доступа к интервью"
              : "Аутентификация временно недоступна. Продолжите как гость."
            }
          </DialogDescription>
        </DialogHeader>

        {!isSupabaseConfigured && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-orange-300 text-sm font-medium">Supabase не настроен</p>
                <p className="text-orange-200 text-xs mt-1">
                  Добавьте переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в настройки Railway
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          </div>
        )}

        {isSupabaseConfigured ? (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="login" className="text-gray-300 data-[state=active]:text-white">
                Вход
              </TabsTrigger>
              <TabsTrigger value="register" className="text-gray-300 data-[state=active]:text-white">
                Регистрация
              </TabsTrigger>
            </TabsList>

          <TabsContent value="login">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Вход в систему</CardTitle>
                <CardDescription className="text-gray-400">
                  Введите ваши данные для входа
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Регистрация</CardTitle>
                <CardDescription className="text-gray-400">
                  Создайте аккаунт для неограниченного доступа
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-gray-300">
                      Имя
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Ваше имя"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-300">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-gray-300">
                      Подтвердите пароль
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">Аутентификация недоступна</h3>
            <p className="text-gray-400 text-sm mb-4">
              Для включения регистрации и входа необходимо настроить Supabase в переменных окружения Railway.
            </p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Продолжить как гость
            </Button>
          </div>
        )}

        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Продолжить как гость
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}