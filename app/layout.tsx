import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'
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

const { bio, links } = PORTFOLIO_DATA
const siteName = `${bio.name} · ${bio.title}`
const pageTitle = `${bio.name} · Engineer`
const githubUrl = links.find((l) => l.type === 'github')?.url
const linkedinUrl = links.find((l) => l.type === 'linkedin')?.url
const sameAs: string[] = [githubUrl, linkedinUrl].filter(
  (u): u is NonNullable<typeof u> => Boolean(u)
)

export const metadata: Metadata = {
  metadataBase: new URL(bio.url),
  title: {
    default: pageTitle,
    template: `%s · ${bio.name}`,
  },
  description: bio.description,
  keywords: [
    'Huzaifa Naroo',
    'Software Engineer',
    'Full-Stack Developer',
    'AI Engineer',
    'Python',
    'TypeScript',
    'React',
    'Next.js',
    'AWS',
    'OpenAI',
    'Portfolio',
  ],
  authors: [{ name: bio.name, url: bio.url }],
  creator: bio.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: bio.url,
    siteName,
    title: pageTitle,
    description: bio.description,
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${bio.name} — ${bio.title}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: bio.description,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: bio.name,
  url: bio.url,
  jobTitle: bio.title,
  email: `mailto:${bio.email}`,
  description: bio.description,
  worksFor: {
    '@type': 'Organization',
    name: bio.company,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: bio.location,
  },
  sameAs,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
