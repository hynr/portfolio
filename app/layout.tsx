import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import '@/styles/sprites.css'
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

// Press Start 2P retained for game-mode UI only
const pressStart2P = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
`

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
        <style dangerouslySetInnerHTML={{ __html: pressStart2P }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
