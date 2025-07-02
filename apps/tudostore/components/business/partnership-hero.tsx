"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"

interface PartnershipHeroProps {
  dictionary: {
    title1: string;
    title2: string;
    title3: string;
    becomePartner: string;
    companiesText: string;
  }
}

export function PartnershipHero({ dictionary }: PartnershipHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      return { width, height }
    }

    let { width, height } = setCanvasDimensions()

    // Handle resize
    const handleResize = () => {
      const dimensions = setCanvasDimensions()
      width = dimensions.width
      height = dimensions.height
    }

    window.addEventListener("resize", handleResize)

    // Create gradient points with more vibrant colors
    const points = [
      { x: width * 0.2, y: height * 0.3, radius: Math.max(width, height) * 0.45, color: "rgba(249, 115, 22, 0.65)" }, // orange-500 with higher opacity
      { x: width * 0.7, y: height * 0.4, radius: Math.max(width, height) * 0.55, color: "rgba(234, 88, 12, 0.6)" }, // orange-600 with higher opacity
      { x: width * 0.4, y: height * 0.7, radius: Math.max(width, height) * 0.5, color: "rgba(251, 146, 60, 0.55)" }, // orange-400 with higher opacity
      { x: width * 0.8, y: height * 0.2, radius: Math.max(width, height) * 0.35, color: "rgba(253, 186, 116, 0.5)" }, // orange-300 with medium opacity
    ]

    // Animation
    const animate = () => {
      time += 0.004 // Slightly faster animation
      ctx.clearRect(0, 0, width, height)

      // Fill background with white
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)

      // Update points position with more noticeable movement
      points[0].x = width * (0.2 + Math.sin(time * 0.5) * 0.08)
      points[0].y = height * (0.3 + Math.cos(time * 0.3) * 0.08)

      points[1].x = width * (0.7 + Math.cos(time * 0.4) * 0.07)
      points[1].y = height * (0.4 + Math.sin(time * 0.6) * 0.07)

      points[2].x = width * (0.4 + Math.sin(time * 0.7) * 0.09)
      points[2].y = height * (0.7 + Math.cos(time * 0.5) * 0.06)

      points[3].x = width * (0.8 + Math.cos(time * 0.3) * 0.07)
      points[3].y = height * (0.2 + Math.sin(time * 0.4) * 0.08)

      // Draw gradient blobs
      points.forEach((point) => {
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)
        gradient.addColorStop(0, point.color)
        gradient.addColorStop(0.7, point.color.replace(/[\d.]+\)$/g, "0.2)")) // Add a mid-stop for better gradient
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.globalCompositeOperation = "source-over"
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Add a bottom fade-out gradient to match the benefits section
      const fadeHeight = height * 0.15 // 15% of the height for the fade
      const fadeGradient = ctx.createLinearGradient(0, height - fadeHeight, 0, height)
      fadeGradient.addColorStop(0, "rgba(255, 255, 255, 0)") // Start transparent
      fadeGradient.addColorStop(1, "rgba(255, 247, 237, 1)") // End with orange-50 color

      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = fadeGradient
      ctx.fillRect(0, height - fadeHeight, width, fadeHeight)

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <section className="relative w-full overflow-hidden">
      {/* Mesh Gradient Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />

      <div className="max-w-7xl mx-auto relative z-10 h-full flex items-center px-4 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center w-full">
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gray-900"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="block">{dictionary?.title1 || 'Haz Crecer'}</span>
              <span className="block">{dictionary?.title2 || 'Tu Negocio'}</span>
              <span className="inline-block relative">
                {dictionary?.title3 || 'Con Nosotros'}
                <motion.span
                  className="absolute -bottom-2 left-0 h-3 bg-orange-500/50 rounded-sm -z-0"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, delay: 1 }}
                ></motion.span>
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 h-auto rounded-full shadow-lg"
                size="lg"
              >
                {dictionary?.becomePartner || 'Conviértete en Socio'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="absolute inset-0 bg-black/5 z-10 rounded-xl"></div>
            <Image
              src="/placeholder.svg?height=800&width=1200"
              alt="Business partnership"
              fill
              className="object-cover"
            />
            <motion.div
              className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg z-20 shadow-md"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <p className="font-medium text-orange-500 text-lg">{dictionary?.companiesText || 'Más de 500 empresas ya confían en nosotros'}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,247,237,1) 100%)",
        }}
      />
    </section>
  )
}
