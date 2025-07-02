//components\mobile-menu.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import LanguageSwitcher from "./language-switcher"
import type { Dictionary } from "@/lib/dictionary"
import type { Locale } from "@/middleware"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"

interface MobileMenuProps {
  lang: Locale
  dictionary: Dictionary["navbar"]
  variant?: "light" | "dark"
}

export default function MobileMenu({ lang, dictionary, variant = "dark" }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Determinar el color del texto basado en la variante
  const textColor = variant === "dark" ? "text-white" : "text-gray-800"
  const buttonBgColor = variant === "dark" ? "bg-white text-black" : "bg-black text-white"

  // Solo renderizar el portal en el cliente
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={`md:hidden ${textColor}`} aria-label="Open menu">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Usar portal para renderizar fuera de la jerarquía del DOM actual */}
      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-black/80 md:hidden" 
          style={{ zIndex: 99999999 }}
        >
          <div 
            className="fixed top-0 right-0 bottom-0 w-[250px] bg-black p-6 flex flex-col"
            style={{ zIndex: 99999999 }}
          >
            <div className="flex justify-end">
              <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <nav className="flex flex-col space-y-6 mt-8">
              <Link href={`/${lang}/search`} className="text-white text-lg" onClick={() => setIsOpen(false)}>
                {dictionary.searchClasses}
              </Link>
              <Link href={`/${lang}/pricing`} className="text-white text-lg" onClick={() => setIsOpen(false)}>
                {dictionary.pricing}
              </Link>
              <Link href={`/${lang}/about`} className="text-white text-lg" onClick={() => setIsOpen(false)}>
                {dictionary.about}
              </Link>
              <Link href={`/${lang}/business`} className="text-white text-lg" onClick={() => setIsOpen(false)}>
                {dictionary.business}
              </Link>
              
              {/* Botón de cambio de idioma simplificado */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher 
                  className="text-lg" 
                  currentLang={lang} 
                  variant="dark"
                  isMobile={true}
                />
                <span 
                  className="text-white text-lg cursor-pointer" 
                  onClick={() => {
                    const newLang = lang === "en" ? "es" : "en";
                    // Cierra el menú
                    setIsOpen(false);
                    // Pequeño tiempo para que se cierre el menú antes de cambiar de idioma
                    setTimeout(() => {
                      router.push(`/${newLang}${window.location.pathname.substring(3)}`);
                    }, 100);
                  }}
                >
                  {lang === "en" ? "English" : "Español"}
                </span>
              </div>
              
              <Link href={`/${lang}/login`} className="text-white text-lg" onClick={() => setIsOpen(false)}>
                {dictionary.login}
              </Link>
              <Link
                href={`/${lang}/signup`}
                className="bg-white text-black px-4 py-2 rounded-md text-center flex items-center justify-center h-10"
                onClick={() => setIsOpen(false)}
              >
                {dictionary.signup}
              </Link>
            </nav>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
