import { type NextRequest, NextResponse } from "next/server"

interface Question {
  id: number
  text: string
  category: string
  difficulty: "junior" | "middle" | "senior"
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

      // Добавляем случайный элемент для разнообразия
      const randomSeed = Math.floor(Math.random() * 1000)
      const currentTime = new Date().toISOString()
      
      return `Ты эксперт по техническим собеседованиям в IT. Создай 12 УНИКАЛЬНЫХ и РАЗНООБРАЗНЫХ вопросов для собеседования на позицию ${specialtyName} уровня ${levelMap[level]}.

КОНТЕКСТ: Сейчас ${currentTime}, генерация #${randomSeed}. Создай НОВЫЕ вопросы, избегай стандартных шаблонов.

ВАЖНО: 
- Используй только РЕАЛЬНЫЕ вопросы из современных собеседований 2024-2025
- Каждый вопрос должен быть УНИКАЛЬНЫМ и КОНКРЕТНЫМ
- Избегай общих формулировок типа "Расскажите о себе"
- Включи актуальные технологии и тренды
- Добавь практические задачи и кейсы

РАСПРЕДЕЛЕНИЕ ВОПРОСОВ:
- 8 технических вопросов (архитектура, код, инструменты, best practices)
- 4 поведенческих/ситуационных вопроса (опыт, решение проблем, работа в команде)

КАТЕГОРИИ для ${specialtyName}:
- Технические навыки и инструменты
- Архитектура и проектирование
- Практические задачи
- Опыт и кейсы
- Работа в команде
- Решение проблем

ФОРМАТ ОТВЕТА - ТОЛЬКО JSON массив:
[
  {
    "id": 1,
    "text": "Конкретный вопрос на русском языке",
    "category": "Одна из категорий выше",
    "difficulty": "${level}"
  }
]

БЕЗ markdown, БЕЗ объяснений, ТОЛЬКО JSON!`
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
            temperature: 0.7, // Увеличиваем для большего разнообразия
            top_p: 0.9, // Добавляем для еще большего разнообразия
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

    // Если все модели не сработали, возвращаем ошибку
    if (questions.length === 0) {
      console.error("❌ [PRODUCTION] All Perplexity models failed:", lastError)
      return NextResponse.json(
        {
          error: "Failed to generate questions with Perplexity API",
          details: lastError,
          modelsAttempted: models,
        },
        { status: 500 },
      )
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
