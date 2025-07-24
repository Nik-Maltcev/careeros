import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { jobUrl, jobDescription, candidateInfo } = await request.json()

    if (!jobUrl || !candidateInfo) {
      return NextResponse.json({ error: "Job URL and candidate info are required" }, { status: 400 })
    }

    console.log("Generating cover letter...")
    console.log("Job URL:", jobUrl)
    console.log("Candidate info length:", candidateInfo?.length || 0)

    const openaiKey = process.env.OPENAI_API_KEY
    const firecrawlKey = process.env.FIRECRAWL_API_KEY

    if (!openaiKey) {
      console.error("OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    let jobData: any = {}

    if (!firecrawlKey) {
      console.warn("Firecrawl API key not found, using simple scraping fallback")

      try {
        // Простое извлечение данных без Firecrawl
        const response = await fetch(jobUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        if (response.ok) {
          const html = await response.text()

          // Простое извлечение title из HTML
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
          const title = titleMatch ? titleMatch[1].trim() : "Позиция"

          // Попытка найти название компании в title или meta
          const companyMatch = html.match(/company["\s]*:[\s]*["']([^"']+)["']/i) ||
            html.match(/organization["\s]*:[\s]*["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)
          const company = companyMatch ? companyMatch[1].trim() : "Компания"

          jobData = {
            company_name: company,
            job_title: title,
            job_description: `Вакансия: ${title} в компании ${company}. Ссылка: ${jobUrl}. Пожалуйста, изучите подробности по ссылке для более точного понимания требований.`,
            requirements: "Требования указаны в оригинальной вакансии по ссылке",
            responsibilities: "Обязанности указаны в оригинальной вакансии по ссылке",
            location: "Уточните в оригинальной вакансии",
            employment_type: "Уточните в оригинальной вакансии"
          }
        } else {
          throw new Error("Failed to fetch job page")
        }
      } catch (fetchError) {
        console.error("Simple scraping failed:", fetchError)
        // Базовый fallback
        jobData = {
          company_name: "Компания",
          job_title: "Позиция",
          job_description: `Вакансия по ссылке: ${jobUrl}. Для создания более точного сопроводительного письма рекомендуется настроить Firecrawl API.`,
          requirements: "Требования не извлечены - изучите вакансию по ссылке",
          responsibilities: "Обязанности не извлечены - изучите вакансию по ссылке",
          location: "Не указано",
          employment_type: "Не указано"
        }
      }
    } else {
      try {
        // Извлекаем данные о вакансии через Firecrawl
        console.log("Extracting job data with Firecrawl...")

        const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/extract", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            urls: [jobUrl],
            prompt: "Extract job details including: company name, job title, job description, requirements, responsibilities, benefits, and any other relevant information about this job posting.",
            schema: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                job_title: { type: "string" },
                job_description: { type: "string" },
                requirements: { type: "string" },
                responsibilities: { type: "string" },
                benefits: { type: "string" },
                location: { type: "string" },
                employment_type: { type: "string" }
              },
              required: ["company_name", "job_title", "job_description"]
            }
          }),
        })

        if (!firecrawlResponse.ok) {
          const errorData = await firecrawlResponse.json().catch(() => ({}))
          console.error("Firecrawl API error:", firecrawlResponse.status, errorData)
          throw new Error(`Failed to extract job data: ${firecrawlResponse.status}`)
        }

        const firecrawlResult = await firecrawlResponse.json()

        if (!firecrawlResult.success || !firecrawlResult.data) {
          throw new Error("Failed to extract job data from URL")
        }

        jobData = firecrawlResult.data
        console.log("Job data extracted:", {
          company: jobData.company_name,
          title: jobData.job_title,
          hasDescription: !!jobData.job_description
        })
      } catch (firecrawlError) {
        console.error("Firecrawl extraction failed, using fallback:", firecrawlError)
        // Fallback если Firecrawl не работает
        jobData = {
          company_name: "Компания",
          job_title: "Позиция",
          job_description: `Вакансия по ссылке: ${jobUrl}. Пожалуйста, изучите требования самостоятельно.`,
          requirements: "Требования не извлечены - изучите вакансию по ссылке",
          responsibilities: "Обязанности не извлечены - изучите вакансию по ссылке",
          location: "Не указано",
          employment_type: "Не указано"
        }
      }
    }

    // Если пользователь предоставил описание вакансии, используем его
    if (jobDescription && jobDescription.trim()) {
      console.log("Using user-provided job description")
      const userDescription = jobDescription.trim()
      
      // Пытаемся извлечь название компании и должности из описания
      const companyMatches = userDescription.match(/компания[:\s]+([^\n\r.]+)/i) || 
                            userDescription.match(/организация[:\s]+([^\n\r.]+)/i) ||
                            userDescription.match(/([А-ЯЁ][а-яё\s]+(?:ООО|ЗАО|ОАО|ИП|Ltd|Inc|Corp))/i)
      
      const positionMatches = userDescription.match(/должность[:\s]+([^\n\r.]+)/i) ||
                             userDescription.match(/вакансия[:\s]+([^\n\r.]+)/i) ||
                             userDescription.match(/позиция[:\s]+([^\n\r.]+)/i)
      
      if (companyMatches) {
        jobData.company_name = companyMatches[1].trim()
      }
      
      if (positionMatches) {
        jobData.job_title = positionMatches[1].trim()
      }
      
      // Используем полное описание от пользователя
      jobData.job_description = userDescription
      jobData.requirements = userDescription
      jobData.responsibilities = userDescription
      
      console.log("Extracted from user description:", {
        company: jobData.company_name,
        title: jobData.job_title,
        hasDescription: true
      })
    }

    // Генерируем сопроводительное письмо через ChatGPT
    const prompt = `
Ты эксперт по написанию сопроводительных писем и карьерный консультант. Твоя задача - создать персонализированное и убедительное сопроводительное письмо для конкретной вакансии.

ИНФОРМАЦИЯ О ВАКАНСИИ:
Компания: ${jobData.company_name}
Должность: ${jobData.job_title}
Описание: ${jobData.job_description}
Требования: ${jobData.requirements || "Не указаны"}
Обязанности: ${jobData.responsibilities || "Не указаны"}
Местоположение: ${jobData.location || "Не указано"}
Тип занятости: ${jobData.employment_type || "Не указан"}

ИНФОРМАЦИЯ О КАНДИДАТЕ:
${candidateInfo}

ЗАДАЧА:
Создай профессиональное сопроводительное письмо, которое:

1. СТРУКТУРА:
   - Обращение к компании/HR
   - Вступительный абзац с указанием позиции
   - 2-3 основных абзаца с аргументами
   - Заключительный абзац с призывом к действию
   - Подпись

2. СОДЕРЖАНИЕ:
   - Покажи понимание компании и позиции
   - Выдели 3-4 ключевых навыка/достижения кандидата, релевантных для вакансии
   - Объясни, почему кандидат подходит именно для этой роли
   - Продемонстрируй мотивацию и интерес к компании
   - Используй конкретные примеры из опыта кандидата

3. СТИЛЬ:
   - Профессиональный, но не формальный тон
   - Уверенность без высокомерия
   - Персонализация под компанию и вакансию
   - Избегай шаблонных фраз
   - Длина: 250-400 слов

4. КЛЮЧЕВЫЕ ПРИНЦИПЫ:
   - Покажи ценность, которую кандидат принесет компании
   - Используй ключевые слова из описания вакансии
   - Будь конкретным в примерах и достижениях
   - Заверши сильным призывом к действию

Верни ТОЛЬКО текст сопроводительного письма без дополнительных комментариев.
`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Ты эксперт по написанию сопроводительных писем. Создаешь персонализированные письма, которые помогают кандидатам получить интервью.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI API error:", response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const generatedCoverLetter = result.choices[0]?.message?.content

    if (!generatedCoverLetter) {
      throw new Error("No cover letter generated")
    }

    console.log("Successfully generated cover letter, length:", generatedCoverLetter.length)

    return NextResponse.json({
      coverLetter: generatedCoverLetter,
      jobData: jobData,
      generatedAt: new Date().toISOString(),
      model: "gpt-4o",
    })
  } catch (error: any) {
    console.error("Cover letter generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate cover letter" }, { status: 500 })
  }
}
