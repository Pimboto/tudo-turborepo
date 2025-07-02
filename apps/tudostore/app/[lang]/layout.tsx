//app\[lang]\layout.tsx
import type React from "react"
import "../globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { locales } from "@/middleware"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  return {
    title: "TUDO - No strings. just joy.",
    description: "Your all-access pass to fitness, wellness & beauty",
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon.png' },
      ],
      apple: [
        { url: '/apple-icon.png' },
      ],
    },
  }
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
