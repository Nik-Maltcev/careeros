import { type NextRequest, NextResponse } from "next/server"

const FIRECRAWL_API_KEY = "fc-2d2e0ec383cc4af194229bb051a81d4d"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("Scraping job URL:", url)

    // Используем Firecrawl для скрапинга вакансии
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        includeTags: ["h1", "h2", "h3", "p", "ul", "li", "div"],
        excludeTags: ["nav", "footer", "header", "aside", "script", "style"],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Firecrawl API error:", response.status, errorText)
      throw new Error(`Firecrawl API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      console.error("Firecrawl scraping failed:", data.error)
      throw new Error("Failed to scrape job posting")
    }

    const jobContent = data.data.markdown || data.data.html || ""

    console.log("Successfully scraped job content:", jobContent.substring(0, 200) + "...")

    // Извлекаем ключевую информацию из вакансии
    const jobInfo = {
      title: data.data.metadata?.title || "Не указано",
      content: jobContent,
      url: url,
      scrapedAt: new Date().toISOString(),
    }

    return NextResponse.json(jobInfo)
  } catch (error: any) {
    console.error("Job scraping error:", error)
    return NextResponse.json({ error: error.message || "Failed to scrape job posting" }, { status: 500 })
  }
}
