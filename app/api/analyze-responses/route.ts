import { type NextRequest, NextResponse } from "next/server"

interface QuestionFeedback {
  questionId: number
  questionText: string
  feedback: string
  score: number
  strengths: string[]
  improvements: string[]
}

// Функция для генерации обратной связи по каждому вопросу
async function generateQuestionFeedback(
  responses: any[],
  specialty: string,
  apiKey: string,
  model: string
): Promise<QuestionFeedback[]> {
  const feedbackPromises = responses.map(async (response, index) => {
    const answerText = response.response || "Ответ не предоставлен"

    const prompt = `Ты эксперт по техническим собеседованиям в IT. Проанализируй ответ кандидата на вопрос собеседования.

ВОПРОС: ${response.question}
ОТВЕТ КАНДИДАТА: ${answerText}
СПЕЦИАЛЬНОСТЬ: ${specialty}

КРИТЕРИИ ОЦЕНКИ:
- 8-10 баллов: Глубокий, детальный ответ с примерами и техническими подробностями
- 6-7 баллов: Хороший ответ, показывает понимание, но можно углубить
- 5 баллов: ПОВЕРХНОСТНЫЙ ответ - базовое понимание, но без деталей и примеров
- 3-4 балла: Слабый ответ с ошибками или неточностями
- 1-2 балла: Неправильный или отсутствующий ответ

ВАЖНО: Если ответ поверхностный (без конкретных примеров, деталей, практического опыта) - ставь 5/10!

Дай детальную обратную связь по этому конкретному ответу:

Верни ТОЛЬКО JSON в формате:
{
  "score": число от 1 до 10,
  "feedback": "Подробная обратная связь на русском языке",
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "improvements": ["что улучшить 1", "что улучшить 2"]
}`

    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No content in response")
      }

      // Парсим JSON ответ
      const cleanContent = content.replace(/```json\n?|```\n?/g, "").trim()
      const feedbackData = JSON.parse(cleanContent)

      return {
        questionId: index + 1,
        questionText: response.question,
        feedback: feedbackData.feedback,
        score: feedbackData.score,
        strengths: feedbackData.strengths || [],
        improvements: feedbackData.improvements || [],
      }
    } catch (error) {
      console.error(`Error generating feedback for question ${index + 1}:`, error)

      // Fallback обратная связь
      return {
        questionId: index + 1,
        questionText: response.question,
        feedback: "Не удалось сгенерировать детальную обратную связь для этого вопроса.",
        score: 5,
        strengths: ["Ответ предоставлен"],
        improvements: ["Попробуйте дать более развернутый ответ"],
      }
    }
  })

  return Promise.all(feedbackPromises)
}

export async function POST(request: NextRequest) {
  try {
    const { responses, specialty } = await request.json()

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "No responses provided" }, { status: 400 })
    }

    console.log("=== DETAILED ANALYSIS REQUEST ===")
    console.log("Specialty:", specialty)
    console.log("Total responses:", responses.length)

    // Детальный лог каждого ответа
    responses.forEach((r, index) => {
      console.log(`Response ${index + 1}:`, {
        question: r.question?.substring(0, 100) + "...",
        response: r.response,
        responseLength: r.response?.length || 0,
        duration: r.duration,
        hasValidResponse: !!(
          r.response &&
          r.response !== "Не отвечен" &&
          r.response.trim().length > 0 &&
          r.duration > 5
        ),
      })
    })

    // Проверяем API ключи
    const perplexityKey = process.env.PERPLEXITY_API_KEY

    console.log("API Keys check:", {
      hasPerplexity: !!perplexityKey,
      perplexityLength: perplexityKey ? perplexityKey.length : 0,
    })

    // Если есть Perplexity API ключ, пробуем использовать его для анализа
    if (perplexityKey) {
      try {
        console.log("Attempting analysis with Perplexity API...")

        const responsesSummary = responses
          .map((r, index) => {
            const hasValidResponse =
              r.response && r.response !== "Не отвечен" && r.response.trim().length > 0 && r.duration > 5
            return `Вопрос ${index + 1}: ${r.question}
Статус ответа: ${hasValidResponse ? "ОТВЕЧЕН" : "НЕ ОТВЕЧЕН"}
Ответ: ${r.response || "Отсутствует"}
Длительность: ${r.duration || 0} секунд
Качество: ${hasValidResponse ? "Содержательный ответ" : "Пропущен или слишком краткий"}`
          })
          .join("\n\n")

        const analysisPrompt = `Проанализируй результаты технического интервью для позиции ${specialty}.

ВАЖНО: Будь строгим и честным в оценке. Если кандидат не ответил на вопросы, оценка должна быть низкой!

ДАННЫЕ ИНТЕРВЬЮ:
${responsesSummary}

СТРОГИЕ КРИТЕРИИ ОЦЕНКИ:
- Если НЕ ОТВЕЧЕНО более 50% вопросов → общая оценка НЕ ВЫШЕ 3-4 баллов
- Если НЕ ОТВЕЧЕНО более 70% вопросов → общая оценка НЕ ВЫШЕ 2-3 баллов  
- Если НЕ ОТВЕЧЕНО 100% вопросов → общая оценка 1-2 балла
- Только содержательные ответы (длительность > 10 сек) засчитываются как полноценные

АНАЛИЗ ПО КРИТЕРИЯМ (0-10):
1. Технические знания: Основано на правильности и глубине ответов
2. Практический опыт: Наличие примеров и практических решений
3. Коммуникативные навыки: Четкость и структурированность изложения
4. Решение проблем: Логический подход к задачам

ВАЖНО: Отвечай ТОЛЬКО валидным JSON без дополнительного текста.

Формат ответа:
{
  "overallScore": 2.1,
  "criteriaScores": [
    {"name": "Технические знания", "score": 1.5, "description": "Честное описание на основе реальных ответов"},
    {"name": "Практический опыт", "score": 2.0, "description": "Честное описание на основе реальных ответов"},
    {"name": "Коммуникативные навыки", "score": 2.5, "description": "Честное описание на основе реальных ответов"},
    {"name": "Решение проблем", "score": 1.8, "description": "Честное описание на основе реальных ответов"}
  ],
  "strengths": ["Только реальные сильные стороны, если они есть"],
  "improvements": ["Конкретные области для критического улучшения"],
  "roadmap": [
    {
      "title": "Критическая цель на основе реальных пробелов",
      "description": "Честное описание что нужно изучить",
      "timeframe": "Реалистичные сроки",
      "resources": ["Конкретные ресурсы для изучения"]
    }
  ]
}`

        const perplexityModels = ["sonar-pro", "llama-3.1-sonar-large-128k-online", "llama-3.1-sonar-small-128k-online", "llama-3.1-70b-instruct"]

        for (const model of perplexityModels) {
          try {
            console.log(`Trying Perplexity model: ${model}`)

            const response = await fetch("https://api.perplexity.ai/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${perplexityKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  {
                    role: "system",
                    content:
                      "Ты строгий эксперт по техническим интервью. Оценивай честно и справедливо. Если кандидат не ответил на вопросы - ставь низкие оценки. Отвечай только валидным JSON.",
                  },
                  {
                    role: "user",
                    content: analysisPrompt,
                  },
                ],
                temperature: 0.1,
                max_tokens: 2500,
              }),
            })

            if (!response.ok) {
              console.error(`Perplexity API error for ${model}:`, response.status, response.statusText)
              continue
            }

            const result = await response.json()
            const content = result.choices?.[0]?.message?.content?.trim()

            if (!content) {
              console.error("Empty response from Perplexity")
              continue
            }

            console.log("Raw Perplexity response:", content.substring(0, 300) + "...")

            // Очищаем ответ
            let cleanContent = content
            const prefixesToRemove = ["```json", "```", "JSON:", "json", "Response:"]
            for (const prefix of prefixesToRemove) {
              if (cleanContent.startsWith(prefix)) {
                cleanContent = cleanContent.replace(prefix, "").trim()
                break
              }
            }

            if (cleanContent.endsWith("```")) {
              cleanContent = cleanContent.replace(/```$/, "").trim()
            }

            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              cleanContent = jsonMatch[0]
            }

            let analysis
            try {
              analysis = JSON.parse(cleanContent)
            } catch (parseError) {
              console.error("JSON Parse Error:", parseError)
              console.error("Content that failed to parse:", cleanContent)
              continue
            }

            // Валидируем структуру
            if (!analysis.overallScore || !analysis.criteriaScores || !Array.isArray(analysis.criteriaScores)) {
              console.error("Invalid analysis structure")
              continue
            }

            console.log(`Successfully analyzed with Perplexity model: ${model}`)
            console.log("Perplexity analysis result:", {
              overallScore: analysis.overallScore,
              criteriaCount: analysis.criteriaScores.length,
            })

            // Добавляем анализ каждого вопроса
            const questionFeedback = await generateQuestionFeedback(responses, specialty, perplexityKey, model)

            return NextResponse.json({
              ...analysis,
              questionFeedback,
              modelUsed: model,
              isDemoMode: false,
              source: "perplexity",
            })
          } catch (modelError: any) {
            console.error(`Perplexity model ${model} failed:`, modelError.message)
            continue
          }
        }

        console.log("All Perplexity models failed, falling back to corrected demo")
      } catch (error: any) {
        console.error("Perplexity analysis failed:", error)
      }
    }

    // Fallback к ИСПРАВЛЕННОМУ демо анализу
    console.log("Using CORRECTED demo analysis")
    const demoAnalysis = generateCorrectedDemoAnalysis(responses, specialty)
    console.log("Generated demo analysis:", {
      overallScore: demoAnalysis.overallScore,
      criteriaScores: demoAnalysis.criteriaScores.map((c) => ({ name: c.name, score: c.score })),
    })

    return NextResponse.json({
      ...demoAnalysis,
      modelUsed: "corrected_demo",
      isDemoMode: true,
      fallbackReason: "no_api_access",
      source: "corrected_demo",
    })
  } catch (error: any) {
    console.error("Server error:", error)

    // В случае любой ошибки возвращаем исправленный демо анализ
    const demoAnalysis = generateCorrectedDemoAnalysis([], "frontend")
    return NextResponse.json({
      ...demoAnalysis,
      modelUsed: "corrected_demo",
      isDemoMode: true,
      fallbackReason: "server_error",
      source: "corrected_demo",
    })
  }
}

function generateCorrectedDemoAnalysis(responses: any[], specialty: string) {
  console.log("=== GENERATING CORRECTED DEMO ANALYSIS ===")
  console.log("Input responses:", responses.length)

  // СТРОГИЙ анализ ответов
  const totalQuestions = responses.length

  // Считаем ПРАКТИЧЕСКИ ЛЮБЫЕ попытки ответить (очень мягкие критерии)
  const validAnswers = responses.filter((r) => {
    const hasValidResponse =
      r.response &&
      r.response !== "Не отвечен" &&
      r.response.trim().length > 0 &&
      r.duration > 1 && // СНИЗИЛИ до 1 секунды - засчитываем почти любую попытку!
      !r.response.includes("Аудио ответ") // Исключаем технические записи без содержания

    console.log(`Question analysis:`, {
      hasResponse: !!r.response,
      responseContent: r.response,
      duration: r.duration,
      isValid: hasValidResponse,
    })

    return hasValidResponse
  })

  const answeredQuestions = validAnswers.length
  const unansweredQuestions = totalQuestions - answeredQuestions

  console.log("Analysis stats:", {
    totalQuestions,
    answeredQuestions,
    unansweredQuestions,
    answerRate: totalQuestions > 0 ? answeredQuestions / totalQuestions : 0,
  })

  // Анализ длительности ТОЛЬКО для валидных ответов
  const durations = validAnswers.map((r) => r.duration || 0)
  const veryShortAnswers = durations.filter((d) => d < 15).length // < 15 сек
  const shortAnswers = durations.filter((d) => d >= 15 && d < 30).length // 15-30 сек
  const optimalAnswers = durations.filter((d) => d >= 30 && d <= 90).length // 30-90 сек
  const longAnswers = durations.filter((d) => d > 90).length // > 90 сек

  const totalDuration = durations.reduce((sum, d) => sum + d, 0)
  const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0

  console.log("Duration analysis:", {
    veryShortAnswers,
    shortAnswers,
    optimalAnswers,
    longAnswers,
    averageDuration,
  })

  // БОЛЕЕ МЯГКИЙ расчет оценки
  let overallScore = 5 // Начинаем с среднего уровня

  if (totalQuestions === 0) {
    overallScore = 5 // Нет данных = средняя оценка
  } else {
    const answerRate = answeredQuestions / totalQuestions

    console.log("Score calculation:", {
      answerRate,
      answeredQuestions,
      totalQuestions,
    })

    // СПРАВЕДЛИВАЯ базовая оценка (как вы просили)
    if (answerRate === 0) {
      overallScore = 2 // 0% ответов = 2 балла
    } else if (answerRate < 0.2) {
      overallScore = 3 // Менее 20% = 3 балла
    } else if (answerRate >= 0.2 && answerRate < 0.4) {
      overallScore = 4 // 20% ответов = 4 балла (средний уровень)
    } else if (answerRate >= 0.4 && answerRate < 0.6) {
      overallScore = 5 // 40% ответов = 5 баллов (хорошо!)
    } else if (answerRate >= 0.6 && answerRate < 0.8) {
      overallScore = 7 // 60% ответов = 7 баллов (отлично!)
    } else {
      overallScore = 9 // 80%+ ответов = 9 баллов (превосходно!)
    }

    // МАКСИМАЛЬНО ЩЕДРЫЕ бонусы за качество
    if (answeredQuestions > 0) {
      // Большой бонус просто за то, что есть ответы
      overallScore += 1

      if (optimalAnswers > answeredQuestions * 0.1) { // Очень низкий порог - 10%
        overallScore += 2 // Большой бонус
      }
      if (longAnswers > 0) {
        overallScore += 1.5 // Еще больший бонус
      }
      if (averageDuration > 15) { // Очень низкий порог
        overallScore += 1.5 // Большой бонус
      }
      if (averageDuration > 5) { // Бонус даже за очень короткие ответы
        overallScore += 1
      }
    }

    // УБИРАЕМ ШТРАФЫ ПОЛНОСТЬЮ - только позитивная оценка!
    // Никаких штрафов за короткие ответы
  }

  overallScore = Math.min(10, Math.max(3, overallScore)) // Минимум 3 балла вместо 1

  console.log("Final overall score:", overallScore)

  // Генерация оценок по критериям (тоже строгих)
  const criteriaScores = [
    {
      name: "Технические знания",
      score: calculateStrictTechnicalScore(answeredQuestions, totalQuestions, averageDuration, overallScore),
      description: generateHonestTechnicalDescription(answeredQuestions, totalQuestions, averageDuration, specialty),
    },
    {
      name: "Практический опыт",
      score: calculateStrictExperienceScore(longAnswers, optimalAnswers, answeredQuestions, overallScore),
      description: generateHonestExperienceDescription(longAnswers, optimalAnswers, answeredQuestions, averageDuration),
    },
    {
      name: "Коммуникативные навыки",
      score: calculateStrictCommunicationScore(veryShortAnswers, optimalAnswers, answeredQuestions, overallScore),
      description: generateHonestCommunicationDescription(
        veryShortAnswers,
        optimalAnswers,
        answeredQuestions,
        averageDuration,
      ),
    },
    {
      name: "Решение проблем",
      score: calculateStrictProblemSolvingScore(answeredQuestions, longAnswers, totalQuestions, overallScore),
      description: generateHonestProblemSolvingDescription(answeredQuestions, longAnswers, totalQuestions),
    },
  ]

  // Честные сильные стороны и улучшения
  const strengths = generateHonestStrengths(
    answeredQuestions,
    totalQuestions,
    optimalAnswers,
    longAnswers,
    averageDuration,
  )
  const improvements = generateHonestImprovements(
    unansweredQuestions,
    totalQuestions,
    veryShortAnswers,
    averageDuration,
    specialty,
  )
  const roadmap = generateHonestRoadmap(
    answeredQuestions,
    totalQuestions,
    veryShortAnswers,
    averageDuration,
    specialty,
    overallScore,
  )

  // Генерируем fallback обратную связь по вопросам с анализом СОДЕРЖАНИЯ
  const questionFeedback: QuestionFeedback[] = responses.map((response, index) => {
    const answerText = response.response || ""
    const question = response.question || ""
    
    // Анализируем качество ответа по СОДЕРЖАНИЮ, а не по длине
    let score = 5 // По умолчанию 5/10 для поверхностных ответов
    let feedback = ""
    let strengths: string[] = []
    let improvements: string[] = []
    
    if (!answerText || answerText === "Не отвечен" || answerText.trim().length === 0) {
      // Нет ответа
      score = 2
      feedback = "Демо-режим: Вопрос не был отвечен. Рекомендуется изучить тему и подготовить ответ."
      strengths = ["Участие в интервью"]
      improvements = ["Изучить основы темы", "Подготовить ответ на вопрос"]
    } else {
      // Анализируем содержание ответа
      const hasKeywords = analyzeAnswerContent(answerText, question, specialty)
      
      if (hasKeywords.isDetailed) {
        // Детальный ответ с техническими терминами и примерами
        score = Math.floor(Math.random() * 2) + 8 // 8-9
        feedback = "Демо-режим: Отличный ответ! Демонстрирует глубокое понимание темы с техническими деталями."
        strengths = ["Глубокое понимание темы", "Использование технических терминов", "Конкретные примеры"]
        improvements = ["Продолжать развивать экспертизу в данной области"]
      } else if (hasKeywords.isGood) {
        // Хороший ответ с пониманием темы
        score = Math.floor(Math.random() * 2) + 6 // 6-7
        feedback = "Демо-режим: Хороший ответ, показывает понимание темы. Можно добавить больше деталей."
        strengths = ["Понимание основных концепций", "Правильное направление мышления"]
        improvements = ["Добавить больше технических деталей", "Привести конкретные примеры"]
      } else if (hasKeywords.isBasic) {
        // Базовый ответ - поверхностный (5/10 как просили)
        score = 5
        feedback = "Демо-режим: ПОВЕРХНОСТНЫЙ ответ - показано базовое понимание, но недостаточно деталей и глубины."
        strengths = ["Базовое понимание темы", "Попытка ответить на вопрос"]
        improvements = ["Углубить знания по теме", "Добавить технические детали", "Привести практические примеры"]
      } else {
        // Слабый ответ
        score = Math.floor(Math.random() * 2) + 3 // 3-4
        feedback = "Демо-режим: Ответ требует улучшения. Необходимо лучше изучить тему."
        strengths = ["Попытка ответить на вопрос"]
        improvements = ["Изучить основы темы", "Подготовить более структурированный ответ"]
      }
    }
    
    return {
      questionId: index + 1,
      questionText: response.question,
      feedback,
      score,
      strengths,
      improvements,
    }
  })

// Функция анализа содержания ответа
function analyzeAnswerContent(answer: string, question: string, specialty: string) {
  const answerLower = answer.toLowerCase()
  const questionLower = question.toLowerCase()
  
  // Технические термины для разных специальностей
  const technicalTerms = {
    frontend: ['react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'html', 'dom', 'api', 'component', 'state', 'props', 'hook', 'redux', 'webpack', 'babel'],
    backend: ['api', 'database', 'sql', 'server', 'microservice', 'rest', 'graphql', 'authentication', 'authorization', 'cache', 'queue', 'docker', 'kubernetes'],
    fullstack: ['frontend', 'backend', 'database', 'api', 'server', 'client', 'architecture', 'deployment', 'scaling'],
    mobile: ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'mobile', 'app', 'native'],
    devops: ['docker', 'kubernetes', 'ci/cd', 'deployment', 'infrastructure', 'monitoring', 'logging', 'scaling', 'cloud'],
    qa: ['testing', 'automation', 'selenium', 'cypress', 'unit test', 'integration', 'bug', 'quality'],
    default: ['код', 'программ', 'разработ', 'технолог', 'алгоритм', 'структур', 'паттерн', 'архитектур']
  }
  
  const relevantTerms = technicalTerms[specialty as keyof typeof technicalTerms] || technicalTerms.default
  
  // Подсчитываем технические термины
  const techTermCount = relevantTerms.filter(term => answerLower.includes(term)).length
  
  // Ищем примеры и конкретику
  const hasExamples = /например|пример|использовал|делал|работал|проект|опыт|практик/i.test(answer)
  const hasDetails = /потому что|так как|поскольку|дело в том|объясн|причин|механизм|принцип/i.test(answer)
  const hasComparison = /отличие|разница|сравнен|лучше|хуже|преимущество|недостаток/i.test(answer)
  
  // Определяем качество ответа
  const isDetailed = techTermCount >= 3 && (hasExamples || hasDetails) && answer.length > 100
  const isGood = techTermCount >= 2 || hasExamples || hasDetails || hasComparison
  const isBasic = techTermCount >= 1 || answer.length > 30
  
  return { isDetailed, isGood, isBasic, techTermCount, hasExamples, hasDetails }
}

  return {
    overallScore: Math.round(overallScore * 10) / 10, // Округляем до 1 знака
    criteriaScores,
    strengths,
    improvements,
    roadmap,
    questionFeedback,
  }
}

// БОЛЕЕ МЯГКИЕ функции расчета оценок
function calculateStrictTechnicalScore(
  answered: number,
  total: number,
  avgDuration: number,
  baseScore: number,
): number {
  if (total === 0 || answered === 0) return 3 // Минимум 3 вместо 1

  let score = Math.max(3, baseScore * 0.9) // Менее строгий коэффициент

  // Более мягкие условия для бонуса
  if (answered / total > 0.5 && avgDuration > 20) { // Снизили пороги
    score += 0.8 // Увеличили бонус
  }

  return Math.min(10, Math.max(3, Math.round(score * 10) / 10))
}

function calculateStrictExperienceScore(
  longAnswers: number,
  optimalAnswers: number,
  answered: number,
  baseScore: number,
): number {
  if (answered === 0) return 3 // Минимум 3 вместо 1

  let score = Math.max(3, baseScore * 0.85) // Менее строгий коэффициент

  // Более щедрый бонус
  if (longAnswers > 0 && answered > 0) {
    score += (longAnswers / answered) * 2 // Увеличили множитель
  }

  // Дополнительный бонус за оптимальные ответы
  if (optimalAnswers > 0 && answered > 0) {
    score += (optimalAnswers / answered) * 1
  }

  return Math.min(10, Math.max(3, Math.round(score * 10) / 10))
}

function calculateStrictCommunicationScore(
  veryShort: number,
  optimal: number,
  answered: number,
  baseScore: number,
): number {
  if (answered === 0) return 4 // Коммуникация оценивается выше

  let score = Math.max(4, baseScore * 1.0) // Без штрафного коэффициента

  // Более мягкий штраф
  if (veryShort > answered * 0.8) { // Увеличили порог
    score -= 0.5 // Уменьшили штраф
  }

  // Более щедрый бонус
  if (optimal > answered * 0.2) { // Снизили порог
    score += 1 // Увеличили бонус
  }

  return Math.min(10, Math.max(4, Math.round(score * 10) / 10))
}

function calculateStrictProblemSolvingScore(
  answered: number,
  longAnswers: number,
  total: number,
  baseScore: number,
): number {
  if (total === 0 || answered === 0) return 3 // Минимум 3 вместо 1

  let score = Math.max(3, baseScore * 0.9) // Менее строгий коэффициент

  // Более щедрый бонус
  if (longAnswers > 0 && answered > 0) {
    score += (longAnswers / answered) * 1.5 // Увеличили множитель
  }

  // Бонус просто за то, что ответил на большинство вопросов
  if (answered / total > 0.6) {
    score += 0.5
  }

  return Math.min(10, Math.max(3, Math.round(score * 10) / 10))
}

// ЧЕСТНЫЕ функции описаний
function generateHonestTechnicalDescription(
  answered: number,
  total: number,
  avgDuration: number,
  specialty: string,
): string {
  if (total === 0) return "Интервью не было проведено"
  if (answered === 0) return `Начальный уровень в ${specialty}. Отличная возможность для изучения основ`

  const answerRate = answered / total

  if (answerRate < 0.3) {
    return `Базовый уровень знаний ${specialty}. Есть хорошая основа для развития`
  } else if (answerRate < 0.6) {
    return `Развивающиеся знания ${specialty}. Показаны базовые концепции, есть потенциал`
  } else if (answerRate < 0.8 || avgDuration < 25) {
    return `Хорошие базовые знания ${specialty}. Демонстрирует понимание ключевых концепций`
  } else {
    return `Отличные знания ${specialty}. Подробные и структурированные ответы`
  }
}

function generateHonestExperienceDescription(
  longAnswers: number,
  optimalAnswers: number,
  answered: number,
  avgDuration: number,
): string {
  if (answered === 0) return "Начальный этап карьеры. Отличная возможность для получения практического опыта"

  if (longAnswers === 0 && avgDuration < 20) {
    return "Развивающийся практический опыт. Есть базовое понимание, можно углублять"
  } else if (longAnswers > answered * 0.3) {
    return "Отличный практический опыт! Приводит конкретные примеры и детали"
  } else if (avgDuration > 30) {
    return "Хороший практический опыт. Демонстрирует понимание реальных задач"
  } else {
    return "Базовый практический опыт. Хорошая основа для дальнейшего развития"
  }
}

function generateHonestCommunicationDescription(
  veryShort: number,
  optimal: number,
  answered: number,
  avgDuration: number,
): string {
  if (answered === 0) return "Развивающиеся коммуникативные навыки. Хорошая возможность для практики"

  if (veryShort > answered * 0.8) { // Увеличили порог
    return "Базовые коммуникативные навыки. Рекомендуется развивать навык развернутых объяснений"
  } else if (optimal > answered * 0.3) { // Снизили порог
    return "Отличные коммуникативные навыки! Четкие и структурированные ответы"
  } else if (avgDuration > 20) { // Снизили порог
    return "Хорошие коммуникативные навыки. Способен выражать технические мысли"
  } else {
    return "Развивающиеся навыки коммуникации. Есть потенциал для улучшения"
  }
}

function generateHonestProblemSolvingDescription(answered: number, longAnswers: number, total: number): string {
  if (total === 0 || answered === 0) return "Развивающиеся навыки решения проблем. Хорошая основа для роста"

  const answerRate = answered / total

  if (answerRate < 0.4) {
    return "Базовые навыки решения проблем. Есть потенциал для развития аналитического мышления"
  } else if (answerRate > 0.6 && longAnswers > 0) {
    return "Отличные навыки решения проблем! Демонстрирует системный подход"
  } else if (answerRate > 0.4) {
    return "Хорошие навыки решения проблем. Справляется с техническими задачами"
  } else {
    return "Развивающиеся навыки решения проблем. Хорошая основа для дальнейшего роста"
  }
}

// ЧЕСТНЫЕ рекомендации
function generateHonestStrengths(
  answered: number,
  total: number,
  optimal: number,
  longAnswers: number,
  avgDuration: number,
): string[] {
  const strengths: string[] = []

  if (total === 0) {
    return ["Готовность к участию в интервью"]
  }

  if (answered === 0) {
    return ["Участие в техническом интервью - первый шаг к развитию"]
  }

  const answerRate = answered / total

  if (answerRate > 0.8) {
    strengths.push("Ответил на большинство вопросов")
  }

  if (optimal > answered * 0.4) {
    strengths.push("Умеет давать структурированные ответы")
  }

  if (longAnswers > 0) {
    strengths.push("Способен давать подробные объяснения")
  }

  if (avgDuration > 40) {
    strengths.push("Развернутые ответы на вопросы")
  }

  if (strengths.length === 0) {
    strengths.push("Готовность учиться и развиваться")
  }

  return strengths
}

function generateHonestImprovements(
  unanswered: number,
  total: number,
  veryShort: number,
  avgDuration: number,
  specialty: string,
): string[] {
  const improvements: string[] = []

  if (total === 0) {
    improvements.push("Необходимо пройти полное интервью")
    return improvements
  }

  if (unanswered === total) {
    improvements.push("КРИТИЧНО: Не дан ни один ответ. Необходимо срочное изучение основ")
    improvements.push(`Начните с базовых концепций ${specialty}`)
    improvements.push("Практикуйтесь в объяснении простых технических понятий")
    return improvements
  }

  if (unanswered > total * 0.7) {
    improvements.push("КРИТИЧНО: Большинство вопросов остались без ответа")
  } else if (unanswered > total * 0.5) {
    improvements.push("Много пропущенных вопросов - изучите основы специальности")
  }

  if (veryShort > (total - unanswered) * 0.5) {
    improvements.push("Ответы слишком краткие - развивайте навык объяснения")
  }

  if (avgDuration < 15) {
    improvements.push("Учитесь давать более подробные технические объяснения")
  }

  improvements.push("Практикуйтесь в техническом интервью с коллегами")
  improvements.push("Изучайте не только теорию, но и практические примеры")

  return improvements
}

function generateHonestRoadmap(
  answered: number,
  total: number,
  veryShort: number,
  avgDuration: number,
  specialty: string,
  overallScore: number,
): any[] {
  const roadmap: any[] = []

  if (total === 0 || answered === 0) {
    roadmap.push({
      title: "Критическое изучение основ",
      description: `Необходимо с нуля изучить основы ${specialty}. Начните с самых базовых концепций.`,
      timeframe: "3-6 месяцев",
      resources: [
        "Базовые учебники и курсы",
        "Интерактивные платформы обучения",
        "Простые практические проекты",
        "Менторство опытного разработчика",
        "Ежедневная практика",
      ],
    })
  } else if (answered < total * 0.5) {
    roadmap.push({
      title: "Срочное восполнение пробелов",
      description: `Критически важно изучить пропущенные темы по ${specialty}. Фокус на практическом применении.`,
      timeframe: "2-4 месяца",
      resources: [
        "Структурированные курсы по специальности",
        "Практические проекты с наставником",
        "Ежедневное изучение документации",
        "Участие в код-ревью",
        "Регулярные mock-интервью",
      ],
    })
  } else {
    roadmap.push({
      title: "Углубление знаний",
      description: `Развивайте экспертизу в ${specialty} и улучшайте коммуникативные навыки.`,
      timeframe: "1-3 месяца",
      resources: [
        "Продвинутые курсы и сертификации",
        "Сложные практические проекты",
        "Участие в open source",
        "Технические выступления",
        "Менторство других разработчиков",
      ],
    })
  }

  // Всегда добавляем цель по коммуникации
  roadmap.push({
    title: "Развитие коммуникативных навыков",
    description: "Научитесь четко объяснять технические концепции и структурировать ответы.",
    timeframe: "1-2 месяца",
    resources: [
      "Практика объяснения концепций",
      "Запись видео-объяснений",
      "Mock-интервью с друзьями",
      "Участие в технических дискуссиях",
      "Курсы по презентационным навыкам",
    ],
  })

  return roadmap
}
