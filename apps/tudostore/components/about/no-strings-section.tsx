"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Sparkles } from "lucide-react"

interface NoStringsSectionProps {
  dictionary: {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
  }
}

export default function NoStringsSection({ dictionary }: NoStringsSectionProps) {
  // Definir variantes de animación para reutilizar
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, rotate: -3 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const secondImageVariants = {
    hidden: { opacity: 0, scale: 0.9, rotate: 3 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="container mx-auto px-4 py-24 relative z-20">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          {/* Ajustado el tamaño y posición de la columna de texto */}
          <div className="md:col-span-6 md:col-start-7">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={textVariants}
              className="md:pl-8" // Añadido padding a la izquierda en pantallas medianas y grandes
            >
              <h2 className="text-5xl md:text-7xl font-bold mb-6">{dictionary.title}</h2>
              <div className="w-24 h-1 bg-primary mb-8"></div>
              <p className="text-xl uppercase tracking-wider mb-6 font-light">{dictionary.subtitle}</p>
              <div className="space-y-6 text-lg md:text-xl">
                <p>{dictionary.paragraph1}</p>
                <p>{dictionary.paragraph2}</p>
              </div>
            </motion.div>
          </div>

          {/* Ajustado el tamaño de la columna de imágenes */}
          <div className="md:col-span-6 md:col-start-1 md:row-start-1">
            <div className="relative">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={imageVariants}
                className="relative z-10"
              >
                <div className="relative h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-2xl transform rotate-3">
                  <Image
                    src="/placeholder.svg?height=800&width=600&text=Joy"
                    alt="People enjoying fitness"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={secondImageVariants}
                className="absolute top-12 -right-4 md:-right-12 z-0"
              >
                <div className="relative h-[300px] md:h-[450px] w-[200px] md:w-[300px] rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 border-4 border-white/30">
                  <Image
                    src="/placeholder.svg?height=800&width=600&text=Freedom"
                    alt="Freedom in fitness"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
              </motion.div>

              {/* Floating icons - simplificado para mejor rendimiento */}
              <motion.div
                className="absolute -bottom-10 right-10 text-primary/80"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                  ease: "easeInOut",
                  repeatType: "loop",
                }}
              >
                <Sparkles size={40} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
