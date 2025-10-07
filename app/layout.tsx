import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

const fontSans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Careeros — современный карьерный помощник",
  description:
    "Подготовьтесь к техническим и продуктовым собеседованиям с Careeros: тренировки, обратная связь и персональные рекомендации.",
  creator: "Careeros",
  metadataBase: new URL("https://careeros.vercel.app"),
  openGraph: {
    title: "Careeros — современный карьерный помощник",
    description:
      "Светлый и вдохновляющий интерфейс для подготовки к собеседованиям: симуляции вопросов, аудиоанализ и ролевые сценарии.",
    url: "https://careeros.vercel.app",
    siteName: "Careeros",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careeros — современный карьерный помощник",
    description:
      "Интервью-тренажёр с аналитикой навыков и готовыми сценариями. Лёгкий интерфейс, созданный на основе компонентов shadcn/ui.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn("relative min-h-screen bg-transparent", fontSans.variable)}>
        {/* Yandex.Metrika counter */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104231873', 'ym');

    ym(104231873, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
`,
          }}
        />
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/104231873" style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_45%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.12),transparent_50%)]" />
            <div className="bg-card/60 backdrop-blur-sm">
              {children}
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
