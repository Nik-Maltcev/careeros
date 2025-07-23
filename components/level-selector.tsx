"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, Star, TrendingUp, Users, Zap } from "lucide-react"
import type { InterviewLevel } from "@/types/interview"

interface LevelSelectorProps {
  selectedLevel?: InterviewLevel
  onLevelSelect: (level: InterviewLevel) => void
  specialty: string
}

export function LevelSelector({ selectedLevel, onLevelSelect, specialty }: LevelSelectorProps) {
  const levels = [
    {
      id: "junior" as InterviewLevel,
      name: "Junior",
      description: "1-2 года опыта",
      icon: <Star className="w-6 h-6" />,
      color: "green",
      questions: 8,
      duration: "10-15 мин",
      focus: "Основы и базовые концепции",
      skills: [
        "Базовые знания технологий",
        "Понимание основных принципов",
        "Готовность к обучению",
        "Базовые навыки решения задач",
      ],
    },
    {
      id: "middle" as InterviewLevel,
      name: "Middle",
      description: "2-5 лет опыта",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "yellow",
      questions: 10,
      duration: "15-20 мин",
      focus: "Практический опыт и решение задач",
      skills: [
        "Самостоятельное решение задач",
        "Опыт работы с проектами",
        "Знание лучших практик",
        "Способность к менторству",
      ],
    },
    {
      id: "senior" as InterviewLevel,
      name: "Senior",
      description: "5+ лет опыта",
      icon: <Users className="w-6 h-6" />,
      color: "red",
      questions: 12,
      duration: "20-25 мин",
      focus: "Архитектура, лидерство и экспертиза",
      skills: ["Архитектурные решения", "Техническое лидерство", "Менторство команды", "Стратегическое планирование"],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Выберите уровень сложности</h2>
        <p className="text-gray-300">Выберите уровень, который соответствует вашему опыту в области {specialty}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map((level) => (
          <Card
            key={level.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedLevel === level.id
                ? `bg-${level.color}-500/20 border-${level.color}-400 ring-2 ring-${level.color}-400`
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
            onClick={() => onLevelSelect(level.id)}
          >
            <CardHeader className="text-center">
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-full bg-${level.color}-500/20 flex items-center justify-center text-${level.color}-400`}
              >
                {level.icon}
              </div>
              <CardTitle className="text-white text-xl">{level.name}</CardTitle>
              <CardDescription className="text-gray-300">{level.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{level.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{level.questions} вопросов</span>
                </div>
              </div>

              {/* Focus */}
              <div>
                <Badge variant="secondary" className={`bg-${level.color}-500/20 text-${level.color}-300 text-xs`}>
                  <Zap className="w-3 h-3 mr-1" />
                  {level.focus}
                </Badge>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">Что будет оцениваться:</p>
                <ul className="space-y-1">
                  {level.skills.map((skill, index) => (
                    <li key={index} className="text-xs text-gray-400 flex items-start">
                      <span className={`w-1 h-1 rounded-full bg-${level.color}-400 mt-2 mr-2 flex-shrink-0`} />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Select Button */}
              <Button
                className={`w-full ${
                  selectedLevel === level.id
                    ? `bg-${level.color}-600 hover:bg-${level.color}-700 text-white`
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onLevelSelect(level.id)
                }}
              >
                {selectedLevel === level.id ? "Выбрано" : "Выбрать уровень"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLevel && (
        <div className="text-center">
          <p className="text-gray-300 text-sm">
            Выбран уровень:{" "}
            <span className="text-white font-semibold">{levels.find((l) => l.id === selectedLevel)?.name}</span>
          </p>
        </div>
      )}
    </div>
  )
}
