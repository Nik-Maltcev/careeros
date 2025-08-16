"use client"

import { useState } from "react"
import { AlertTriangle, X, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VpnWarningProps {
  variant?: "header" | "sticky"
  className?: string
}

export function VpnWarning({ variant = "header", className = "" }: VpnWarningProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  if (variant === "header") {
    return (
      <div className={`flex items-center space-x-2 text-xs ${className}`}>
        <WifiOff className="w-4 h-4 text-orange-400" />
        <span className="text-orange-300">
          Проблемы с сервисом? <span className="font-medium">Отключите VPN</span>
        </span>
      </div>
    )
  }

  // Sticky variant
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm border-b border-orange-400/30 ${className}`}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              <div className="text-white">
                <span className="font-semibold">Проблемы с загрузкой?</span>
                <span className="ml-2">Попробуйте отключить VPN для стабильной работы сервиса</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Компонент для показа в мобильной версии header
export function VpnWarningMobile({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-1 text-xs ${className}`}>
      <WifiOff className="w-3 h-3 text-orange-400" />
      <span className="text-orange-300">VPN?</span>
    </div>
  )
}