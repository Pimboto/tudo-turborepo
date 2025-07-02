//components\navbar.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import MobileMenu from "./mobile-menu"
import LanguageSwitcher from "./language-switcher"
import type { Dictionary } from "@/lib/dictionary"
import type { Locale } from "@/middleware"
import { usePathname } from "next/navigation"

interface NavbarProps {
  lang?: Locale
  dictionary?: Dictionary["navbar"]
  variant?: "light" | "dark" // Nueva prop para controlar el estilo
  transparentOnTop?: boolean // Controla si el navbar es transparente al inicio
}

export default function Navbar({
  lang,
  dictionary,
  variant = "dark", // Por defecto, texto blanco para fondos oscuros
  transparentOnTop = true, // Por defecto, transparente al inicio
}: NavbarProps) {
  const pathname = usePathname()
  // Extraer el idioma del pathname si no se proporciona como prop
  const currentLang = lang || (pathname?.split("/")[1] as Locale) || "en"

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Detectar si hemos hecho scroll más de 10px
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    // Añadir el event listener
    window.addEventListener("scroll", handleScroll)

    // Comprobar el estado inicial
    handleScroll()

    // Limpiar el event listener al desmontar
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  // Usar valores por defecto si dictionary no está disponible
  const navDict = dictionary || {
    searchClasses: "Search",
    pricing: "Pricing",
    about: "About",
    business: "Business",
    login: "Login",
    signup: "Sign Up",
  }

  // Determinar las clases de estilo basadas en la variante y el estado de scroll
  const getNavbarClasses = () => {
    // Clases base - Lower z-index to ensure dropdowns can appear above it
    // Using isolation-auto to create a new stacking context but not isolate the dropdowns
    let classes = "fixed top-0 left-0 right-0 w-full p-6 md:p-8 z-40 transition-all duration-300 isolation-auto "

    // Si debe ser transparente al inicio y no se ha hecho scroll
    if (transparentOnTop && !scrolled) {
      classes += "bg-transparent "
    } else {
      // Si es variante oscura (texto blanco)
      if (variant === "dark") {
        // Use CSS variable for backdrop-filter to prevent it from creating a stacking context that's too aggressive
        classes += "bg-black/30 backdrop-blur-md "
      }
      // Si es variante clara (texto oscuro)
      else {
        classes += "bg-white/70 backdrop-blur-md shadow-sm "
      }
    }

    return classes
  }

  // Determinar el color del texto basado en la variante
  const textColor = variant === "dark" ? "text-white" : "text-gray-800"
  const hoverTextColor = variant === "dark" ? "hover:text-gray-300" : "hover:text-gray-600"
  const buttonBgColor =
    variant === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"

  // Determinar qué logo usar basado en la variante
  const logoSrc = variant === "dark" ? "/images/logo-white.png" : "/images/logo-dark.png"

  return (
    <header className={getNavbarClasses()}>
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href={`/${currentLang}`} className="flex items-center">
          <div className="relative h-10 w-40">
            <Image
              src={logoSrc}
              alt="TUDO Logo"
              fill
              style={{ objectFit: "contain", objectPosition: "left" }}
              priority
            />
          </div>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href={`/${currentLang}/search`} className={`${textColor} ${hoverTextColor} transition-colors`}>
            {navDict.searchClasses}
          </Link>
          <Link href={`/${currentLang}/pricing`} className={`${textColor} ${hoverTextColor} transition-colors`}>
            {navDict.pricing}
          </Link>
          <Link href={`/${currentLang}/about`} className={`${textColor} ${hoverTextColor} transition-colors`}>
            {navDict.about}
          </Link>
          <Link href={`/${currentLang}/business`} className={`${textColor} ${hoverTextColor} transition-colors`}>
            {navDict.business}
          </Link>
          <LanguageSwitcher currentLang={currentLang} variant={variant} />
          <Link href={`/${currentLang}/login`} className={`${textColor} ${hoverTextColor} transition-colors`}>
            {navDict.login}
          </Link>
          <Link
            href={`/${currentLang}/signup`}
            className={`${buttonBgColor} px-4 py-2 rounded-md transition-colors flex items-center justify-center h-9`}
          >
            {navDict.signup}
          </Link>
        </div>
        <MobileMenu lang={currentLang} dictionary={navDict} variant={variant} />
      </nav>
    </header>
  )
}
