//components\hero-section.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import ScrollArrow from "./scroll-arrow"
import type { Dictionary } from "@/lib/dictionary"
import type { Locale } from "@/middleware"

interface HeroSectionProps {
  lang: Locale
  dictionary: Dictionary["hero"]
}

export default function HeroSection({ lang, dictionary }: HeroSectionProps) {
  const [scrollOpacity, setScrollOpacity] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // Calcular la opacidad basada en el scroll (0 al inicio, 1 cuando se ha scrolleado una pantalla completa)
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight

      // Calcular opacidad: comienza a cambiar después del 10% de scroll y llega al máximo al 50%
      const opacity = Math.min(scrollPosition / (windowHeight * 0.4), 1)
      setScrollOpacity(opacity)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video de fondo */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/background-video.mp4" type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>

      {/* Overlay oscuro para mejorar legibilidad - Opacidad dinámica */}
      <div
        className="absolute inset-0 bg-black z-10 transition-opacity duration-300"
        style={{ opacity: 0.4 + scrollOpacity * 0.5 }} // Comienza en 0.4 y aumenta hasta 0.9
      ></div>

      {/* Contenido */}
      <div className="relative z-20 flex flex-col h-full pt-24">
        {/* Contenido principal */}
        <main className="flex-1 flex flex-col justify-center items-start px-6 md:px-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {dictionary.title}
            </h1>

            {/* Slogan movido debajo del texto principal */}
            <p className="text-white text-xl md:text-2xl font-light italic mb-8">{dictionary.slogan}</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${lang}/search`}
                className="bg-white text-black px-8 py-3 text-center font-medium hover:bg-gray-200 transition-colors"
              >
                {dictionary.bookClass}
              </Link>
              <Link
                href={`/${lang}/search`}
                className="bg-transparent border border-white text-white px-8 py-3 text-center font-medium hover:bg-white/10 transition-colors"
              >
                {dictionary.startHere}
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Flecha de scroll */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 z-30">
        <ScrollArrow targetSection="second-section" />
      </div>
    </section>
  )
}
