import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Syera AI - AI-Powered Mock Interview Platform',
  description: 'Practice mock interviews with Syera AI. Get real-time AI questions, instant feedback, and detailed analytics to ace your next interview.',
}

export const viewport: Viewport = {
  themeColor: '#0c1425',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen overflow-x-hidden">{children}</body>
    </html>
  )
}
