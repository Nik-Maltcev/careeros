"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Mail, Phone, Globe, User, FileText, Building, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Interview</span>
          </div>

          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Контактная информация</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Свяжитесь с нами для получения поддержки или по вопросам сотрудничества
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-400" />
                  Контактные данные
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Email</h4>
                    <a href="mailto:info@careeros.ru" className="text-blue-400 hover:text-blue-300 transition-colors">
                      info@careeros.ru
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Телефон</h4>
                    <a href="tel:+79295698640" className="text-green-400 hover:text-green-300 transition-colors">
                      +7 (929) 569-86-40
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Сайт</h4>
                    <a
                      href="https://careeros.ru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors flex items-center"
                    >
                      careeros.ru
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Information */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-yellow-400" />
                  Реквизиты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Исполнитель</h4>
                    <p className="text-gray-300">Мальцев Никита Евгеньевич</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">ИНН</h4>
                    <p className="text-gray-300 font-mono">165924805367</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Статус</h4>
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-400">Самозанятый</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Есть вопросы или предложения?</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Мы всегда готовы помочь вам с подготовкой к собеседованиям или ответить на любые вопросы о нашем
                  сервисе
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    <a href="mailto:info@careeros.ru">
                      <Mail className="w-4 h-4 mr-2" />
                      Написать письмо
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <a href="tel:+79295698640">
                      <Phone className="w-4 h-4 mr-2" />
                      Позвонить
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 md:py-8 px-4 mt-12 md:mt-16">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <p className="text-gray-400 text-sm md:text-base text-center lg:text-left">
              © 2024 AI Interview Service. Все права защищены.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 md:gap-6">
              <Link href="/contacts" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                Контакты
              </Link>
              <a
                href="https://docs.google.com/document/d/1gAtv0dwzobwDbc2hT5XxKJpBPZBsL22VEwSc2OkRUaE/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Оферта
              </a>
              <a
                href="https://docs.google.com/document/d/1Ye-4NEjraFxkm7gwuXeh_CmpNnI2jBoa21487kUAG3Q/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Правила пользования
              </a>
              <a
                href="https://docs.google.com/document/d/1246j4yie5ZNovJoOZ5HlcL8uCZejeb8jTPRp9My692g/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Политика конфиденциальности
              </a>
              <a
                href="https://docs.google.com/document/d/1zL0IVdekD7hRbH0oLXce305wK2vihhYeOye9XqmZ-LA/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Согласие на обработку данных
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
