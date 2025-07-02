"use client"

import { useRef, useEffect } from "react"

interface MeshGradientBackgroundProps {
  colorIntensity?: number
}

export default function MeshGradientBackground({ colorIntensity = 0.12 }: MeshGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    // Set canvas dimensions with lower resolution for better performance
    const setCanvasDimensions = () => {
      if (!canvas) return

      // Use a lower resolution for better performance
      const scale = window.devicePixelRatio > 1 ? 0.5 : 0.7
      canvas.width = window.innerWidth * scale
      canvas.height = window.innerHeight * scale

      // Scale the canvas up with CSS
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    setCanvasDimensions()

    // Debounce resize event
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(setCanvasDimensions, 200)
    }

    window.addEventListener("resize", handleResize)

    // Create noise points - reduce number for better performance
    const points: { x: number; y: number; radius: number; intensity: number; speedX: number; speedY: number }[] = []
    const numPoints = 8
    const primaryColor = [255, 107, 53] // TUDO primary color

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 300 + 100,
        intensity: Math.random() * colorIntensity,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
      })
    }

    // Add a strong center point
    points.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: Math.max(canvas.width, canvas.height) * 0.5,
      intensity: 0,
      speedX: 0,
      speedY: 0,
    })

    // Animation loop with frame limiting
    let animationFrameId: number
    let lastTime = 0
    const targetFPS = 30
    const frameInterval = 1000 / targetFPS

    const render = (currentTime: number) => {
      if (!canvas || !ctx) return

      // Throttle frame rate
      const deltaTime = currentTime - lastTime
      if (deltaTime < frameInterval) {
        animationFrameId = requestAnimationFrame(render)
        return
      }
      lastTime = currentTime - (deltaTime % frameInterval)

      // Clear canvas
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create gradient
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      // For each pixel
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4

          // Calculate influence from each point
          let totalInfluence = 0

          for (const point of points) {
            const dx = x - point.x
            const dy = y - point.y
            // Avoid square root for better performance
            const distanceSquared = dx * dx + dy * dy
            const radiusSquared = point.radius * point.radius

            // Inverse square falloff without square root
            const influence = Math.max(0, 1 - distanceSquared / radiusSquared) * point.intensity
            totalInfluence += influence
          }

          // Clamp influence
          const clampedInfluence = Math.min(1, totalInfluence)

          // Set pixel color (white to orange)
          data[index] = 255 // R
          data[index + 1] = 255 - (255 - primaryColor[1]) * clampedInfluence // G
          data[index + 2] = 255 - (255 - primaryColor[2]) * clampedInfluence // B
          data[index + 3] = 255 // A
        }
      }

      ctx.putImageData(imageData, 0, 0)

      // Move points
      for (const point of points) {
        if (point.speedX === 0 && point.speedY === 0) continue // Skip center point

        point.x += point.speedX
        point.y += point.speedY

        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.speedX *= -1
        if (point.y < 0 || point.y > canvas.height) point.speedY *= -1
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimeout)
      cancelAnimationFrame(animationFrameId)
    }
  }, [colorIntensity])

  return (
    <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }} />
    </div>
  )
}
