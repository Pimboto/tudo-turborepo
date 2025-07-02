//components\landing-page\feature-section.tsx
"use client"

import { useEffect, useRef } from "react"
import { Brain, Shield, Zap } from "lucide-react"
import { AnimatedIconEmbed } from "./animated-icon-embed"
import type { Dictionary } from "@/lib/dictionary"

interface FeatureSectionProps {
  dictionary: Dictionary["featureSection"]
}

// Map of icon keys to Lucide components
const iconMap = {
  brain: Brain,
  lightning: Zap,
  shield: Shield,
}

export function FeatureSection({ dictionary }: FeatureSectionProps) {
  // Refs para las animaciones
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Función para animar los elementos cuando son visibles
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    // Observar cada elemento de característica
    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  return (
    <section className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {dictionary.features.map((feature, index) => (
          <div
            key={index}
            ref={(el) => {
              featureRefs.current[index] = el;
            }}
            className="flex flex-col items-center text-center opacity-0 transform translate-y-4 transition-all duration-700 ease-out"
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="w-20 h-20 rounded-full bg-[#FFF5F5] flex items-center justify-center mb-6 relative overflow-hidden group">
              {/* Efecto de ondulación al hover */}
              <div className="absolute inset-0 bg-[#FFECE0] rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out"></div>

              {/* Icono animado o fallback a Lucide */}
              <div className="relative z-10">
                <AnimatedIconEmbed name={feature.icon as any} width={32} height={32} />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
