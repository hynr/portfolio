import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Huzaifa Naroo - Full Stack Engineer',
  description: 'Software Engineer specializing in Python, Django, React, and AWS. Building scalable solutions at HZSR.',
  keywords: 'software engineer, full stack developer, python, react, aws, django, postgresql',
  authors: [{ name: 'Huzaifa Naroo' }],
  creator: 'Huzaifa Naroo',
  openGraph: {
    title: 'Huzaifa Naroo - Full Stack Engineer',
    description: 'Software Engineer specializing in Python, Django, React, and AWS',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Huzaifa Naroo - Full Stack Engineer',
    description: 'Software Engineer specializing in Python, Django, React, and AWS',
  },
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dark-50 text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}