import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/sprites.css'
import '@/styles/game.css'
import '@/styles/content.css'

const inter = Inter({ subsets: ['latin'] })

// Add Press Start 2P font for retro gaming UI
const pressStart2P = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
`

export const metadata: Metadata = {
  title: 'Huzaifa Naroo - Portfolio',
  description: 'Interactive portfolio with content and game modes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: pressStart2P }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}