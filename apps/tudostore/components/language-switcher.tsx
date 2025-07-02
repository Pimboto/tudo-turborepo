//components\language-switcher.tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect } from "react"
import Cookies from "js-cookie"

interface LanguageSwitcherProps {
  className?: string
  currentLang?: string
  variant?: "light" | "dark"
  isMobile?: boolean
}

export default function LanguageSwitcher({ className = "", currentLang = "en", variant = "dark", isMobile = false }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = () => {
    // Determinar el nuevo idioma (alternar entre en/es)
    const newLang = currentLang === "en" ? "es" : "en"
    
    // Actualizar la cookie
    Cookies.set("NEXT_LOCALE", newLang)

    // Redirigir a la misma página pero con el nuevo locale
    const newPathname = pathname.replace(/^\/[^/]+/, `/${newLang}`)
    router.push(newPathname)
  }

  // Determinar colores basados en la variante
  const textColor = variant === "dark" ? "text-white" : "text-gray-800"
  const hoverTextColor = variant === "dark" ? "hover:text-gray-300" : "hover:text-gray-600"
  
  // Determinar tamaño de la bandera según si es móvil o no
  const flagSize = isMobile ? 24 : 20

  return (
    <div 
      onClick={handleLanguageChange}
      className={`flex items-center gap-2 cursor-pointer ${textColor} ${hoverTextColor} transition-colors ${className}`}
    >
      {/* Mostrar la bandera actual */}
      <div className="relative overflow-hidden rounded-sm">
        <Image
          src={`/images/flags/${currentLang === "en" ? "us" : "es"}.svg`}
          alt={currentLang === "en" ? "English" : "Español"}
          width={flagSize}
          height={flagSize}
          className="object-cover"
        />
      </div>
      
      {/* Si no es móvil, mostrar el texto del idioma */}
      {!isMobile && (
        <span className="select-none">{currentLang === "en" ? "EN" : "ES"}</span>
      )}
    </div>
  )
}
