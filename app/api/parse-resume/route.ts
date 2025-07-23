import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const resumeFile = formData.get("resume") as File
    const jobDataStr = formData.get("jobData") as string
    const additionalInfo = formData.get("additionalInfo") as string

    if (!resumeFile) {
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 })
    }

    console.log("Parsing resume file:", resumeFile.name, resumeFile.size, "bytes")

    // Конвертируем PDF в текст (упрощенная версия)
    // В реальном проекте здесь бы использовался PDF parser
    const arrayBuffer = await resumeFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Для демонстрации используем имитацию парсинга PDF
    // В реальности здесь был бы PDF-to-text конвертер
    const resumeText = await parsePDFContent(buffer)

    const jobData = JSON.parse(jobDataStr || "{}")

    console.log("Successfully parsed resume, length:", resumeText.length)

    return NextResponse.json({
      resumeText,
      fileName: resumeFile.name,
      fileSize: resumeFile.size,
      additionalInfo: additionalInfo || "",
      parsedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Resume parsing error:", error)
    return NextResponse.json({ error: error.message || "Failed to parse resume" }, { status: 500 })
  }
}

// Упрощенная функция парсинга PDF (в реальности нужна библиотека типа pdf-parse)
async function parsePDFContent(buffer: Buffer): Promise<string> {
  // Это заглушка - в реальном проекте здесь должен быть настоящий PDF parser
  // Например, с использованием библиотеки pdf-parse или pdf2pic

  console.log("Simulating PDF parsing for buffer of size:", buffer.length)

  // Возвращаем демо-текст резюме для тестирования
  return `
ИВАН ИВАНОВ
Frontend Developer

КОНТАКТНАЯ ИНФОРМАЦИЯ:
Email: ivan.ivanov@email.com
Телефон: +7 (999) 123-45-67
LinkedIn: linkedin.com/in/ivan-ivanov

ОПЫТ РАБОТЫ:
Frontend Developer | ООО "ТехКомпания" | 2022 - настоящее время
- Разработка веб-приложений на React.js и TypeScript
- Создание адаптивных интерфейсов с использованием CSS3 и SCSS
- Интеграция с REST API и GraphQL
- Оптимизация производительности приложений
- Участие в code review и менторинг junior разработчиков

Junior Frontend Developer | ООО "СтартАп" | 2021 - 2022
- Верстка лендингов и корпоративных сайтов
- Работа с JavaScript ES6+ и jQuery
- Использование препроцессоров CSS (SASS/LESS)
- Кроссбраузерная совместимость

ОБРАЗОВАНИЕ:
Бакалавр информационных технологий | МГУ | 2017-2021

НАВЫКИ:
- JavaScript (ES6+), TypeScript
- React.js, Redux, Next.js
- HTML5, CSS3, SCSS/SASS
- Git, Webpack, Vite
- REST API, GraphQL
- Figma, Adobe XD

ЯЗЫКИ:
- Русский (родной)
- Английский (B2)

ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ:
- Участие в хакатонах и open source проектах
- Сертификат React Developer от Meta
- Активное изучение новых технологий
  `.trim()
}
