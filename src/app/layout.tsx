import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const lexend = Lexend({ 
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['300', '400', '500', '600', '700']
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://darwinly.vercel.app'
const siteName = 'Darwinly'
const title = 'Darwinly | See How Ideas Evolved'
const description =
  'Cross-reference books, science, news, movies, and public interest to reveal the full timeline of any concept - powered by AI.'
const ogImage = '/Darwinly.png'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName,
    type: 'website',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Darwinly - Explore how ideas evolve over time',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
