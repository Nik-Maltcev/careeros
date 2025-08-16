"use client"

import { WifiOff } from "lucide-react"

interface VpnWarningProps {
  className?: string
}

export function VpnWarning({ className = "" }: VpnWarningProps) {
  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      <WifiOff className="w-4 h-4 text-orange-400" />
      <span className="text-orange-300">
        Проблемы с сервисом? <span className="font-medium">Отключите VPN</span>
      </span>
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