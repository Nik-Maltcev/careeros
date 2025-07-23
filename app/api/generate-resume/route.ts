import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { jobData, resumeData, additionalInfo } = await request.json()

    if (!jobData || !resumeData) {
      return NextResponse.json({ error: "Job data and resume data are required" }, { status: 400 })
    }

    console.log("Generating resume with GPT-4...")
    console.log("Job title:", jobData.title)
    console.log("Resume length:", resumeData.resumeText?.length || 0)

    const openaiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API

    if (!openaiKey) {
      console.error("OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const prompt = `
Ты эксперт по созданию резюме и HR-специалист. Твоя задача - адаптировать существующее резюме под конкретную вакансию, чтобы максимально увеличить шансы на получение интервью.

ВАКАНСИЯ:
Название: ${jobData.title}
Описание: ${jobData.content}

ТЕКУЩЕЕ РЕЗЮМЕ:
${resumeData.resumeText}

ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ:
${additionalInfo || "Не указана"}

ЗАДАЧА:
1. Проанализируй требования вакансии и выдели ключевые навыки, технологии и качества
2. Адаптируй резюме под эти требования:
   - Переформулируй опыт работы, подчеркнув релевантные навыки
   - Добавь ключевые слова из вакансии для прохождения ATS
   - Переструктурируй разделы для максимального соответствия
   - Выдели достижения, которые наиболее релевантны для позиции
3. Сохрани профессиональный тон и структуру резюме
4. Убедись, что все данные остаются правдивыми, но представлены в лучшем свете

ВАЖНО:
- Используй ключевые слова из вакансии естественным образом
- Подчеркни наиболее релевантный опыт в начале каждого раздела
- Добавь метрики и конкретные достижения где возможно
- Оптимизируй для ATS-систем (используй стандартные заголовки разделов)
- Длина резюме должна быть 1-2 страницы

Верни ТОЛЬКО текст адаптированного резюме без дополнительных комментариев.
`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Используем gpt-4o вместо gpt-4.1
        messages: [
          {
            role: "system",
            content:
              "Ты эксперт по созданию резюме и карьерный консультант. Создаешь персонализированные резюме, оптимизированные для конкретных вакансий и ATS-систем.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI API error:", response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const generatedResume = result.choices[0]?.message?.content

    if (!generatedResume) {
      throw new Error("No resume generated")
    }

    console.log("Successfully generated resume, length:", generatedResume.length)

    return NextResponse.json({
      resume: generatedResume,
      generatedAt: new Date().toISOString(),
      model: "gpt-4o",
    })
  } catch (error: any) {
    console.error("Resume generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate resume" }, { status: 500 })
  }
}
