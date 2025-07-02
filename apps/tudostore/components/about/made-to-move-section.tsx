"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface MadeToMoveSectionProps {
  dictionary: {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  }
}

export default function MadeToMoveSection({ dictionary }: MadeToMoveSectionProps) {
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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const decorVariants = {
    hidden: (direction: number) => ({ opacity: 0, x: direction * 10 }),
    visible: {
      opacity: 0.3,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="container mx-auto px-4 py-24 relative z-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={textVariants}
            >
              <h2 className="text-5xl md:text-7xl font-bold mb-6">{dictionary.title}</h2>
              <div className="w-24 h-1 bg-primary mb-8"></div>
              <p className="text-xl uppercase tracking-wider mb-6 font-light">{dictionary.subtitle}</p>
              <div className="space-y-6 text-lg md:text-xl">
                <p>{dictionary.paragraph1}</p>
                <p>{dictionary.paragraph2}</p>
                <p>{dictionary.paragraph3}</p>
              </div>
            </motion.div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={imageVariants}
              >
                <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/placeholder.svg?height=800&width=600&text=Movement"
                    alt="People in motion"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 border-4 border-primary/30 rounded-2xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={1}
                variants={decorVariants}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-32 h-32 border-4 border-primary/30 rounded-full"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={-1}
                variants={decorVariants}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
