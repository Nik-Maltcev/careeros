"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Brain,
  MessageCircle,
  Mail,
  Send,
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

export default function ContactsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Имитация отправки формы
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Сброс формы через 3 секунды
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Контакты</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Свяжитесь с нами
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Если у вас возникли проблемы или есть вопросы/предложения, мы всегда готовы помочь!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Основной способ связи
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Самый быстрый способ получить помощь
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">Telegram Bot</h3>
                      <p className="text-blue-300 font-mono">@careeros_bot</p>
                      <p className="text-gray-300 text-sm mt-2">
                        Пишите нам в любое время - отвечаем быстро!
                      </p>
                    </div>
                    <a 
                      href="https://t.me/careeros_bot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Написать
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Contact Methods */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Другие способы связи</CardTitle>
                <CardDescription className="text-gray-300">
                  Альтернативные каналы для связи с нами
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Mail className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400 text-sm">support@careeros.ru</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Время ответа</p>
                    <p className="text-gray-400 text-sm">Обычно в течение 2-4 часов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Частые вопросы</CardTitle>
                <CardDescription className="text-gray-300">
                  Возможно, ответ уже есть здесь
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-white hover:text-blue-300 transition-colors">
                    <span>Как получить больше интервью?</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-400 text-sm mt-2 pl-4">
                    Купите один из наших тарифов на главной странице. Интервью добавляются автоматически после оплаты.
                  </p>
                </details>
                
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-white hover:text-blue-300 transition-colors">
                    <span>Не работает микрофон</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-400 text-sm mt-2 pl-4">
                    Проверьте разрешения браузера на использование микрофона. Также можно отвечать текстом.
                  </p>
                </details>
                
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-white hover:text-blue-300 transition-colors">
                    <span>Как посмотреть результаты интервью?</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-400 text-sm mt-2 pl-4">
                    Зайдите в личный кабинет - там есть история всех ваших интервью с детальными результатами.
                  </p>
                </details>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Написать нам</CardTitle>
                <CardDescription className="text-gray-300">
                  Опишите вашу проблему или предложение
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">Сообщение отправлено!</h3>
                    <p className="text-gray-400">
                      Мы получили ваше сообщение и ответим в ближайшее время.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">
                          Имя
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Ваше имя"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-gray-300">
                        Тема
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="О чем хотите написать?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-300">
                        Сообщение
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Опишите вашу проблему или предложение подробнее..."
                        value={formData.message}
                        onChange={handleInputChange}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 min-h-[120px]"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Отправляем...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Отправить сообщение
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm mt-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">Нужна быстрая помощь?</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Напишите нам в Telegram - отвечаем быстрее всего!
                  </p>
                  <a 
                    href="https://t.me/careeros_bot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      @careeros_bot
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}