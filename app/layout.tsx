import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'
import { ANALYTICS_DOMAIN } from '@/lib/analytics'
import './globals.css'
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
        <style dangerouslySetInnerHTML={{ __html: pressStart2PFace }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {ANALYTICS_DOMAIN && (
          <script
            defer
            data-domain={ANALYTICS_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
