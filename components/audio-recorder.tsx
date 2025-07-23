"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Play, Pause, RotateCcw, Send } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  resetTrigger?: number
}

export function AudioRecorder({ onRecordingComplete, resetTrigger }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Сброс состояния при изменении resetTrigger
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      console.log("🔄 AudioRecorder: Resetting state due to resetTrigger:", resetTrigger)
      resetRecording()
    }
  }, [resetTrigger])

  const resetRecording = () => {
    console.log("🔄 AudioRecorder: Full reset initiated")

    // Останавливаем запись если активна
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    // Останавливаем поток
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Очищаем таймер
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Очищаем URL
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }

    // Сбрасываем все состояния
    setIsRecording(false)
    setIsPaused(false)
    setAudioURL(null)
    setRecordingTime(0)
    setHasRecording(false)
    setIsSubmitting(false)

    // Очищаем ссылки
    mediaRecorderRef.current = null
    audioChunksRef.current = []

    console.log("✅ AudioRecorder: Reset completed")
  }

  const startRecording = async () => {
    try {
      console.log("🎤 Starting recording...")

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream
      audioChunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log("🎤 Recording stopped, processing audio...")
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        })

        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setHasRecording(true)

        console.log("✅ Audio processed, blob size:", audioBlob.size)
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setIsPaused(false)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      console.log("✅ Recording started successfully")
    } catch (error) {
      console.error("❌ Error starting recording:", error)
      alert("Не удалось получить доступ к микрофону. Проверьте разрешения.")
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
      setIsPaused(true)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      console.log("⏸️ Recording paused")
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      console.log("▶️ Recording resumed")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      console.log("⏹️ Recording stopped")
    }
  }

  const handleSubmit = async () => {
    if (!hasRecording || !audioChunksRef.current.length) {
      console.log("❌ No recording to submit")
      return
    }

    console.log("📤 Submitting recording...")
    setIsSubmitting(true)

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      })

      console.log("📤 Calling onRecordingComplete with blob size:", audioBlob.size)
      await onRecordingComplete(audioBlob)

      console.log("✅ Recording submitted successfully")
    } catch (error) {
      console.error("❌ Error submitting recording:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [audioURL])

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Recording Visualization */}
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording && !isPaused
                  ? "bg-red-500/20 border-2 border-red-400 animate-pulse"
                  : hasRecording
                    ? "bg-green-500/20 border-2 border-green-400"
                    : "bg-blue-500/20 border-2 border-blue-400"
              }`}
            >
              {isRecording && !isPaused ? (
                <MicOff className="w-8 h-8 text-red-400" />
              ) : hasRecording ? (
                <Play className="w-8 h-8 text-green-400" />
              ) : (
                <Mic className="w-8 h-8 text-blue-400" />
              )}
            </div>

            {isRecording && <div className="absolute -inset-2 rounded-full border-2 border-red-400/30 animate-ping" />}
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className="text-2xl font-mono text-white">{formatTime(recordingTime)}</div>
            <div className="text-sm text-gray-400 mt-1">
              {isRecording && !isPaused
                ? "Запись..."
                : isPaused
                  ? "Пауза"
                  : hasRecording
                    ? "Готово к отправке"
                    : "Готов к записи"}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {!isRecording && !hasRecording && (
              <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3">
                <Mic className="w-4 h-4 mr-2" />
                Начать запись
              </Button>
            )}

            {isRecording && (
              <>
                {!isPaused ? (
                  <Button
                    onClick={pauseRecording}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Пауза
                  </Button>
                ) : (
                  <Button onClick={resumeRecording} className="bg-green-600 hover:bg-green-700 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Продолжить
                  </Button>
                )}

                <Button onClick={stopRecording} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <MicOff className="w-4 h-4 mr-2" />
                  Остановить
                </Button>
              </>
            )}

            {hasRecording && !isRecording && (
              <>
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Перезаписать
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Отправка..." : "Отправить ответ"}
                </Button>
              </>
            )}
          </div>

          {/* Audio Playback */}
          {audioURL && (
            <div className="w-full">
              <audio controls src={audioURL} className="w-full" style={{ filter: "invert(1) hue-rotate(180deg)" }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
