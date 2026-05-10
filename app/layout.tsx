import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import '@/styles/game.css'
import '@/styles/content.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Press Start 2P is self-hosted from /public/fonts/. Declared with
// font-display: swap and no preload link, so the woff2 is only fetched
// when something actually paints with the family — i.e. when game-mode
// mounts and the canvas HUD calls fillText. Content-mode never triggers
// the fetch.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const pressStart2PFace = `@font-face{font-family:'Press Start 2P';font-style:normal;font-weight:400;font-display:swap;src:url('${basePath}/fonts/PressStart2P-Regular.woff2') format('woff2');}`

export const metadata: Metadata = {
  title: 'Huzaifa Naroo · Engineer',
  description:
    'Full-stack engineer at the seam of AI and product. Currently shipping HZSR. The Mario mode lives here for the same reason this site does.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: pressStart2PFace }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
