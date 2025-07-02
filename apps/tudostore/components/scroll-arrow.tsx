"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

interface ScrollArrowProps {
  targetSection?: string
  className?: string
}

export default function ScrollArrow({ targetSection = "second-section", className = "" }: ScrollArrowProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClick = () => {
    const section = document.getElementById(targetSection)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Ocultar la flecha cuando se hace scroll más allá de cierto punto
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight

      // Ocultar la flecha cuando se ha scrolleado más del 50% de la altura de la ventana
      setIsVisible(scrollPosition < windowHeight * 0.5)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`flex flex-col items-center cursor-pointer ${className}`}
      onClick={handleClick}
      aria-label="Scroll down"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick()
        }
      }}
    >
      {/* Eliminado el texto "SCROLL DOWN", dejando solo la flecha */}
      <div className="relative">
        <ChevronDown className="text-white w-10 h-10 animate-bounce-slow" />
      </div>
    </div>
  )
}
