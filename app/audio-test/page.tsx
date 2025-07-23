"use client"

import { useState } from "react"
import { AudioRecorder } from "@/components/audio-recorder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AudioTestPage() {
  const [recordings, setRecordings] = useState<{ blob: Blob; duration: number; timestamp: Date }[]>([])
  const [questionAudio, setQuestionAudio] = useState<string | undefined>()

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordings((prev) => [...prev, { blob, duration, timestamp: new Date() }])
    console.log("Recording completed:", { size: blob.size, duration })
  }

  const handlePlaybackStart = () => {
    console.log("Question playback started")
  }

  const handlePlaybackEnd = () => {
    console.log("Question playback ended")
  }

  const simulateQuestionAudio = () => {
    // In a real app, this would be the AI-generated question audio
    setQuestionAudio("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-center">Тест аудио компонента</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Button onClick={simulateQuestionAudio} className="mb-4">
                  Загрузить тестовый вопрос
                </Button>
              </div>

              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                onPlaybackStart={handlePlaybackStart}
                onPlaybackEnd={handlePlaybackEnd}
                questionAudio={questionAudio}
                maxRecordingTime={60}
              />

              {recordings.length > 0 && (
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">История записей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recordings.map((recording, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="text-sm">
                            Запись #{index + 1} - {Math.round(recording.duration)}с
                          </span>
                          <span className="text-xs text-gray-500">{recording.timestamp.toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
