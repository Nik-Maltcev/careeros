import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
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
            <img src="https://mc.yandex.ru/watch/104231873" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
        {children}
      </body>
    </html>
  )
}
