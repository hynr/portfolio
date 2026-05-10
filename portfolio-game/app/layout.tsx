import type { Metadata } from 'next'
import '@/styles/game.css'

export const metadata: Metadata = {
  title: 'Portfolio Game',
  description: 'Interactive portfolio game built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}