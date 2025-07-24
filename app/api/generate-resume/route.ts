import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, candidateInfo } = await request.json()

    if (!jobDescription || !candidateInfo) {
      return NextResponse.json({ error: "Job description and candidate info are required" }, { status: 400 })
    }

    console.log("Generating cover letter...")
    console.log("Job description length:", jobDescription?.length || 0)
    console.log("Candidate info length:", candidateInfo?.length || 0)

    const openaiKey = process.env.OPENAI_API_KEY

    if (!openaiKey) {
      console.error("OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Извлекаем данные из описания вакансии
    const userDescription = jobDescription.trim()
    let jobData: any = {}

    // Пытаемся извлечь название компании и должности из описания
    const companyMatches = userDescription.match(/компания[:\s]+([^\n\r.]+)/i) ||
      userDescription.match(/организация[:\s]+([^\n\r.]+)/i) ||
      userDescription.match(/([А-ЯЁ][а-яё\s]+(?:ООО|ЗАО|ОАО|ИП|Ltd|Inc|Corp))/i)

    const positionMatches = userDescription.match(/должность[:\s]+([^\n\r.]+)/i) ||
      userDescription.match(/вакансия[:\s]+([^\n\r.]+)/i) ||
      userDescription.match(/позиция[:\s]+([^\n\r.]+)/i)

    jobData = {
      company_name: companyMatches ? companyMatches[1].trim() : "Компания",
      job_title: positionMatches ? positionMatches[1].trim() : "Позиция",
      job_description: userDescription,
      requirements: userDescription,
      responsibilities: userDescription
    }

    console.log("Extracted from job description:", {
      company: jobData.company_name,
      title: jobData.job_title,
      hasDescription: true
    })

    // Генерируем короткое сопроводительное письмо через ChatGPT
    const prompt = `
Ты эксперт по написанию кратких и эффективных сопроводительных писем. Создай КОРОТКОЕ профессиональное сопроводительное письмо.

ИНФОРМАЦИЯ О ВАКАНСИИ:
Компания: ${jobData.company_name}
Должность: ${jobData.job_title}
Полное описание вакансии:
${jobData.job_description}

ИНФОРМАЦИЯ О КАНДИДАТЕ:
${candidateInfo}

ТРЕБОВАНИЯ К ПИСЬМУ:
1. ДЛИНА: Максимум 80-120 слов (примерно 1 абзац)
2. СТРУКТУРА: Краткое обращение + основной абзац + подпись
3. СОДЕРЖАНИЕ:
   - Укажи конкретную должность и компанию
   - Выдели 2-3 ключевых навыка, релевантных для вакансии
   - Покажи понимание требований позиции
   - Продемонстрируй ценность для компании
4. СТИЛЬ:
   - Профессиональный и уверенный тон
   - Конкретные факты, без общих фраз
   - Используй ключевые слова из описания вакансии
   - Без лишних слов и воды

ПРИМЕР СТРУКТУРЫ:
"Уважаемые коллеги! Меня заинтересовала позиция [должность] в [компания]. Мой [X-летний] опыт в [область] и навыки [конкретные навыки] идеально соответствуют вашим требованиям. В [предыдущая компания/проект] я [конкретное достижение], что позволит мне эффективно решать задачи [упомянуть задачи из вакансии]. Готов обсудить, как мой опыт поможет развитию вашей команды. С уважением, [Имя]"

Верни ТОЛЬКО текст короткого сопроводительного письма без дополнительных комментариев.
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
