import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY

    if (!openaiKey) {
      console.error("OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log("🎤 Transcribing audio file:", audioFile.name, "size:", audioFile.size)

    // Создаем FormData для OpenAI Whisper API
    const whisperFormData = new FormData()
    whisperFormData.append("file", audioFile)
    whisperFormData.append("model", "whisper-1")
    whisperFormData.append("language", "ru") // Русский язык
    whisperFormData.append("response_format", "json")

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI Whisper API error:", response.status, errorData)
      return NextResponse.json({ 
        error: `Transcription failed: ${response.status}`,
        fallback: "Аудио ответ (транскрипция недоступна)"
      }, { status: response.status })
    }

    const result = await response.json()
    const transcription = result.text || ""

    console.log("✅ Transcription successful:", transcription.substring(0, 100) + "...")

    return NextResponse.json({
      transcription: transcription,
      success: true
    })

  } catch (error: any) {
    console.error("Transcription error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to transcribe audio",
      fallback: "Аудио ответ (ошибка транскрипции)"
    }, { status: 500 })
  }
}