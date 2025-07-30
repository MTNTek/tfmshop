import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TFMshop - Shop, Smile, Save More',
  description: 'A modern e-commerce platform with Amazon-inspired UX and custom branding',
  keywords: ['e-commerce', 'shopping', 'online store', 'tfmshop'],
  authors: [{ name: 'TFMshop Team' }],
  creator: 'TFMshop',
  publisher: 'TFMshop',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'TFMshop - Shop, Smile, Save More',
    description: 'A modern e-commerce platform with Amazon-inspired UX and custom branding',
    url: 'https://tfmshop.com',
    siteName: 'TFMshop',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TFMshop',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TFMshop - Shop, Smile, Save More',
    description: 'A modern e-commerce platform with Amazon-inspired UX and custom branding',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification-token', // Add your Google verification token
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
