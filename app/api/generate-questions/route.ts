import { type NextRequest, NextResponse } from "next/server"

interface Question {
  id: number
  text: string
  category: string
  difficulty: "junior" | "middle" | "senior"
}

// Fallback вопросы на случай, если Perplexity API не работает
function getFallbackQuestions(specialty: string, level: string): Question[] {
  const baseQuestions: Record<string, Question[]> = {
    frontend: [
      { id: 1, text: "Объясните разницу между let, const и var в JavaScript", category: "Технические навыки", difficulty: level as any },
      { id: 2, text: "Что такое Virtual DOM и как он работает в React?", category: "Технические навыки", difficulty: level as any },
      { id: 3, text: "Как работает замыкание (closure) в JavaScript?", category: "Технические навыки", difficulty: level as any },
      { id: 4, text: "Расскажите о жизненном цикле компонента в React", category: "Технические навыки", difficulty: level as any },
      { id: 5, text: "Что такое hoisting в JavaScript?", category: "Технические навыки", difficulty: level as any },
      { id: 6, text: "Как бы вы оптимизировали производительность React приложения?", category: "Архитектура", difficulty: level as any },
      { id: 7, text: "Объясните разницу между CSS Grid и Flexbox", category: "Технические навыки", difficulty: level as any },
      { id: 8, text: "Что такое TypeScript и какие у него преимущества?", category: "Технические навыки", difficulty: level as any },
      { id: 9, text: "Расскажите о сложной задаче, которую вам пришлось решать", category: "Опыт", difficulty: level as any },
      { id: 10, text: "Как вы работаете в команде и решаете конфликты?", category: "Работа в команде", difficulty: level as any },
      { id: 11, text: "Что такое Progressive Web App (PWA)?", category: "Технические навыки", difficulty: level as any },
      { id: 12, text: "Как бы вы подошли к отладке медленно работающего приложения?", category: "Решение проблем", difficulty: level as any },
    ],
    backend: [
      { id: 1, text: "Объясните разницу между SQL и NoSQL базами данных", category: "Технические навыки", difficulty: level as any },
      { id: 2, text: "Что такое REST API и какие у него принципы?", category: "Технические навыки", difficulty: level as any },
      { id: 3, text: "Как работает индексирование в базах данных?", category: "Технические навыки", difficulty: level as any },
      { id: 4, text: "Объясните паттерн MVC", category: "Архитектура", difficulty: level as any },
      { id: 5, text: "Что такое микросервисная архитектура?", category: "Архитектура", difficulty: level as any },
      { id: 6, text: "Как бы вы обеспечили безопасность API?", category: "Технические навыки", difficulty: level as any },
      { id: 7, text: "Что такое кэширование и какие виды кэша вы знаете?", category: "Технические навыки", difficulty: level as any },
      { id: 8, text: "Объясните ACID свойства транзакций", category: "Технические навыки", difficulty: level as any },
      { id: 9, text: "Расскажите о проекте, которым вы гордитесь", category: "Опыт", difficulty: level as any },
      { id: 10, text: "Как вы подходите к code review?", category: "Работа в команде", difficulty: level as any },
      { id: 11, text: "Что такое Docker и зачем он нужен?", category: "Технические навыки", difficulty: level as any },
      { id: 12, text: "Как бы вы масштабировали высоконагруженное приложение?", category: "Архитектура", difficulty: level as any },
    ]
  }

  // Возвращаем вопросы для специальности или общие frontend вопросы
  return baseQuestions[specialty] || baseQuestions.frontend
}

export async function POST(request: NextRequest) {
  try {
    const { specialty, level } = await request.json()

    console.log("🔄 [PRODUCTION] Generating questions for:", { specialty, level })

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      console.error("❌ [PRODUCTION] PERPLEXITY_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          error: "Perplexity API key not configured",
          details: "PERPLEXITY_API_KEY environment variable is missing",
        },
        { status: 500 },
      )
    }

    // Список моделей в порядке приоритета - только Perplexity модели
    const models = [
      "sonar-pro", // продвинутая модель с улучшенными цитированиями
      "llama-3.1-sonar-large-128k-online", // основная модель с онлайн поиском
      "llama-3.1-sonar-small-128k-online", // более быстрая модель
      "llama-3.1-70b-instruct", // fallback без online поиска
    ]

    let questions: Question[] = []
    let modelUsed = ""
    let lastError = ""

    // Создаем детальный промпт для получения актуальных вопросов
    const createPrompt = (specialty: string, level: string) => {
      const specialtyMap: Record<string, string> = {
        frontend: "Frontend разработчика (React, Vue, Angular, JavaScript, TypeScript, HTML, CSS)",
        backend: "Backend разработчика (Node.js, Python, Java, C#, Go, базы данных, API)",
        devops: "DevOps инженера (Docker, Kubernetes, CI/CD, AWS, Azure, мониторинг)",
        "data-scientist": "Data Scientist (Python, машинное обучение, статистика, pandas, numpy)",
        "product-manager": "Product Manager (стратегия продукта, аналитика, roadmap, stakeholder management)",
        "ux-ui-designer": "UX/UI дизайнера (Figma, прототипирование, user research, design systems)",
        marketing: "маркетолога (digital marketing, SEO, аналитика, контент-маркетинг)",
        "project-manager": "Project Manager (Agile, Scrum, управление командой, планирование)",
        "business-analyst": "бизнес-аналитика (анализ требований, процессы, документация)",
        "system-analyst": "системного аналитика (архитектура систем, техническая документация)",
        "tech-support": "специалиста технической поддержки (troubleshooting, customer service)",
      }

      const specialtyName = specialtyMap[specialty] || specialty
      const levelMap: Record<string, string> = {
        junior: "Junior (1-2 года опыта)",
        middle: "Middle (2-5 лет опыта)",
        senior: "Senior (5+ лет опыта)",
      }

      return `Ты эксперт по техническим собеседованиям в IT. Создай 12 актуальных вопросов для собеседования на позицию ${specialtyName} уровня ${levelMap[level]}.

ВАЖНО: Используй только РЕАЛЬНЫЕ вопросы, которые действительно задают на собеседованиях в 2024-2025 году. Найди актуальную информацию о том, какие вопросы сейчас популярны для этой позиции.

Требования к вопросам:
- Все вопросы на русском языке
- Смесь технических и поведенческих вопросов (70% технических, 30% поведенческих)
- Соответствие уровню ${level}
- Актуальные технологии и подходы
- Разные категории: технические навыки, опыт, решение проблем, архитектура
- Каждый вопрос должен быть четким и конкретным

Верни ТОЛЬКО JSON массив в точно таком формате:
[
  {
    "id": 1,
    "text": "Текст вопроса на русском",
    "category": "Название категории",
    "difficulty": "${level}"
  }
]

Никакого дополнительного текста, объяснений или markdown форматирования.`
    }

    // Пробуем каждую модель по очереди
    for (const model of models) {
      try {
        console.log(`🔄 [PRODUCTION] Trying model: ${model}`)

        const prompt = createPrompt(specialty, level)

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${perplexityApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content:
                  "Ты эксперт по техническим собеседованиям в IT. Создаешь только актуальные вопросы, которые реально задают на собеседованиях в 2024-2025 году. Отвечаешь только валидным JSON без дополнительного текста.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 3000,
            temperature: 0.5, // Умеренное разнообразие
            top_p: 0.8, // Умеренная случайность
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          lastError = `${model}: HTTP ${response.status} - ${errorText}`
          console.error(`❌ [PRODUCTION] ${model} failed:`, response.status, errorText)
          continue
        }

        const data = await response.json()
        console.log(`📊 [PRODUCTION] ${model} response:`, {
          choices: data.choices?.length || 0,
          content: data.choices?.[0]?.message?.content?.substring(0, 100) + "...",
        })

        if (!data.choices?.[0]?.message?.content) {
          lastError = `${model}: No content in response`
          console.error(`❌ [PRODUCTION] ${model}: No content in response`)
          continue
        }

        let content = data.choices[0].message.content.trim()

        // Очищаем контент от markdown форматирования
        content = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .replace(/^json\n?/i, "")
          .trim()

        // Если контент начинается не с [, пытаемся найти JSON массив
        if (!content.startsWith("[")) {
          const jsonMatch = content.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            content = jsonMatch[0]
          }
        }

        // Пытаемся парсить JSON
        try {
          const parsedQuestions = JSON.parse(content)

          if (!Array.isArray(parsedQuestions)) {
            lastError = `${model}: Response is not an array`
            console.error(`❌ [PRODUCTION] ${model}: Response is not an array`)
            continue
          }

          // Валидируем структуру вопросов
          const validQuestions = parsedQuestions.filter((q) => {
            return (
              q &&
              typeof q === "object" &&
              typeof q.id === "number" &&
              typeof q.text === "string" &&
              typeof q.category === "string" &&
              typeof q.difficulty === "string" &&
              q.text.length > 10
            )
          })

          if (validQuestions.length < 10) {
            lastError = `${model}: Only ${validQuestions.length} valid questions (need 10+)`
            console.error(`❌ [PRODUCTION] ${model}: Only ${validQuestions.length} valid questions`)
            continue
          }

          // Успех!
          questions = validQuestions.slice(0, 12) // Берем максимум 12 вопросов
          modelUsed = model
          console.log(`✅ [PRODUCTION] Successfully generated ${questions.length} questions using ${model}`)
          break
        } catch (parseError) {
          lastError = `${model}: JSON parse error - ${parseError}`
          console.error(`❌ [PRODUCTION] ${model} JSON parse error:`, parseError)
          console.error(`❌ [PRODUCTION] Raw content:`, content.substring(0, 500))
          continue
        }
      } catch (fetchError) {
        lastError = `${model}: Network error - ${fetchError}`
        console.error(`❌ [PRODUCTION] ${model} network error:`, fetchError)
        continue
      }
    }

    // Если все модели не сработали, используем fallback демо-вопросы
    if (questions.length === 0) {
      console.error("❌ [PRODUCTION] All Perplexity models failed, using fallback questions:", lastError)
      
      // Fallback демо-вопросы для разных специальностей
      const fallbackQuestions = getFallbackQuestions(specialty, level)
      
      return NextResponse.json({
        questions: fallbackQuestions,
        source: "fallback",
        isDemoMode: true,
        fallbackReason: lastError,
        totalQuestions: fallbackQuestions.length,
      })
    }

    console.log(`🎉 [PRODUCTION] Questions generated successfully using ${modelUsed}`)

    return NextResponse.json({
      questions,
      source: "perplexity",
      isDemoMode: false,
      modelUsed,
      totalQuestions: questions.length,
    })
  } catch (error) {
    console.error("❌ [PRODUCTION] Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
