"use client"

import { useEffect, useRef } from "react"

// Definición de los iconos disponibles con sus tokens y nombres
const ICONS_CONFIG = {
  bookmark: {
    name: "bookmark",
    token: "58d47e4a-6b48-483e-8b00-362c17e23d3c",
  },
  "high-five": {
    name: "High Five",
    token: "dfda27f9-e133-49e0-bf9e-4d952d0ab596",
  },
  "thank-you": {
    name: "Thank you",
    token: "eb0b9e1a-e71e-4b20-a7dc-7c38f678e237",
  },
  location: {
    name: "location",
    token: "b850824d-8d8d-4f7a-bda1-76b818d1c529",
  },
  // Nuevos iconos para la sección de características
  brain: {
    name: "bookmark", // Usando bookmark como sustituto para brain
    token: "58d47e4a-6b48-483e-8b00-362c17e23d3c",
  },
  lightning: {
    name: "High Five", // Usando high-five como sustituto para lightning
    token: "dfda27f9-e133-49e0-bf9e-4d952d0ab596",
  },
  shield: {
    name: "Thank you", // Usando thank-you como sustituto para shield
    token: "eb0b9e1a-e71e-4b20-a7dc-7c38f678e237",
  },
}

type AnimatedIconEmbedProps = {
  name: keyof typeof ICONS_CONFIG
  width?: number
  height?: number
  className?: string
}

export function AnimatedIconEmbed({ name, width = 40, height = 40, className }: AnimatedIconEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    // Función para cargar el script de animatedicons.co
    const loadScript = () => {
      if (scriptLoaded.current) return

      const script = document.createElement("script")
      script.src = "https://animatedicons.co/scripts/embed-animated-icons.js"
      script.async = true
      script.onload = () => {
        scriptLoaded.current = true
        renderIcon()
      }
      document.body.appendChild(script)
    }

    // Función para renderizar el icono una vez que el script esté cargado
    const renderIcon = () => {
      if (!containerRef.current) return

      // Limpiar el contenedor antes de añadir el nuevo icono
      containerRef.current.innerHTML = ""

      const iconConfig = ICONS_CONFIG[name]
      if (!iconConfig) return

      // Crear el elemento animated-icons
      const iconElement = document.createElement("animated-icons")
      iconElement.setAttribute(
        "src",
        `https://animatedicons.co/get-icon?name=${encodeURIComponent(iconConfig.name)}&style=minimalistic&token=${iconConfig.token}`,
      )
      iconElement.setAttribute("trigger", "loop-on-hover")
      iconElement.setAttribute(
        "attributes",
        '{"variationThumbColour":"#FF9422","variationName":"Two Tone","variationNumber":2,"numberOfGroups":2,"backgroundIsGroup":false,"strokeWidth":1,"defaultColours":{"group-1":"#000000","group-2":"#FF9422","background":"#FFFFFF"}}',
      )
      iconElement.setAttribute("height", height.toString())
      iconElement.setAttribute("width", width.toString())

      containerRef.current.appendChild(iconElement)
    }

    // Si el script ya está cargado, solo renderizar el icono
    if (document.querySelector('script[src="https://animatedicons.co/scripts/embed-animated-icons.js"]')) {
      scriptLoaded.current = true
      renderIcon()
    } else {
      loadScript()
    }

    return () => {
      // Limpieza si es necesario
    }
  }, [name, height, width])

  return <div ref={containerRef} className={className} />
}
