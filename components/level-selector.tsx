"use client"

import { Clock, MessageSquare, Star, TrendingUp, Users, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InterviewLevel } from "@/types/interview"

interface LevelSelectorProps {
  selectedLevel?: InterviewLevel
  onLevelSelect: (level: InterviewLevel) => void
  specialty: string
}

const accentStyles = {
  green: {
    cardSelected: "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-200",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
    buttonSelected: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  yellow: {
    cardSelected: "bg-amber-50 border-amber-200 ring-2 ring-amber-200",
    icon: "bg-amber-100 text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
    buttonSelected: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  red: {
    cardSelected: "bg-rose-50 border-rose-200 ring-2 ring-rose-200",
    icon: "bg-rose-100 text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-400",
    buttonSelected: "bg-rose-500 hover:bg-rose-600 text-white",
  },
} as const

export function LevelSelector({ selectedLevel, onLevelSelect, specialty }: LevelSelectorProps) {
  const levels = [
    {
      id: "junior" as InterviewLevel,
      name: "Junior",
      description: "1–2 года опыта",
      icon: <Star className="w-6 h-6" />,
      accent: "green" as const,
      questions: 8,
      duration: "10–15 минут",
      focus: "Базовые технические знания и уверенность",
      skills: [
        "Понимание фундаментальных концепций",
        "Готовность объяснить решения простых задач",
        "Уверенность при рассказе о проектном опыте",
        "Навыки командной коммуникации",
      ],
    },
    {
      id: "middle" as InterviewLevel,
      name: "Middle",
      description: "2–5 лет опыта",
      icon: <TrendingUp className="w-6 h-6" />,
      accent: "yellow" as const,
      questions: 10,
      duration: "15–20 минут",
      focus: "Углублённый опыт и продуктовое мышление",
      skills: [
        "Навыки декомпозиции и аргументации",
        "Решение нестандартных технических кейсов",
        "Системное мышление и зрелый код-ревью",
        "Управление рисками в релизах",
      ],
    },
    {
      id: "senior" as InterviewLevel,
      name: "Senior",
      description: "5+ лет опыта",
      icon: <Users className="w-6 h-6" />,
      accent: "red" as const,
      questions: 12,
      duration: "20–25 минут",
      focus: "Архитектура, стратегия и лидерство",
      skills: [
        "Проектирование масштабируемых решений",
        "Управление продуктовой и технической стратегией",
        "Менторство и лидерство в командах",
        "Подготовка к сложным собеседованиям",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Выберите уровень сложности тренировки</h2>
        <p className="text-muted-foreground">
          Подберите сценарии под свой опыт — система адаптирует вопросы для направления «{specialty}».
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {levels.map((level) => {
          const accent = accentStyles[level.accent]
          const isSelected = selectedLevel === level.id

          return (
            <Card
              key={level.id}
              onClick={() => onLevelSelect(level.id)}
              className={cn(
                "group cursor-pointer rounded-3xl border border-border/60 bg-white/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                isSelected ? accent.cardSelected : "hover:border-border/80"
              )}
            >
              <CardHeader className="text-center space-y-3">
                <div className={cn("w-12 h-12 mx-auto rounded-full flex items-center justify-center", accent.icon)}>
                  {level.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">{level.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{level.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{level.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{level.questions} вопросов</span>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className={cn("w-full justify-center rounded-full px-3 py-1 text-xs font-medium", accent.badge)}
                >
                  <Zap className="mr-2 h-3.5 w-3.5" />
                  {level.focus}
                </Badge>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Что проверим:</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {level.skills.map((skill) => (
                      <li key={skill} className="flex items-start gap-2 leading-snug">
                        <span className={cn("mt-2 h-1.5 w-1.5 rounded-full", accent.dot)} />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={cn(
                    "w-full rounded-full border border-transparent px-5 py-2 text-sm font-medium transition-colors",
                    isSelected ? accent.buttonSelected : "bg-white text-foreground hover:bg-white/90 border-border/60"
                  )}
                  onClick={(event) => {
                    event.stopPropagation()
                    onLevelSelect(level.id)
                  }}
                >
                  {isSelected ? "Уровень выбран" : "Выбрать уровень"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedLevel && (
        <div className="text-center text-sm text-muted-foreground">
          Вы выбрали уровень{" "}
          <span className="font-semibold text-foreground">
            {levels.find((level) => level.id === selectedLevel)?.name}
          </span>
          . Следующий шаг — подготовка к тренингу.
        </div>
      )}
    </div>
  )
}
