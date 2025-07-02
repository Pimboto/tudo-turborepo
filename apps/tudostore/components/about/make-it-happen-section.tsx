"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

interface MakeItHappenSectionProps {
  dictionary: {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    discoverLink: string;
  }
}

export default function MakeItHappenSection({ dictionary }: MakeItHappenSectionProps) {
  // Definir variantes de animación para reutilizar
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const lineVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const subtitleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const contentVariants = {
    hidden: (direction: number) => ({ opacity: 0, x: direction * 30 }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-24">
      {/* Diagonal lines */}
      <div className="absolute inset-0 z-10 opacity-10">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[200%] w-px bg-primary"
            style={{
              left: `${i * 10}%`,
              top: "-50%",
              transform: "rotate(45deg)",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <motion.div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={titleVariants}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              {dictionary.title}
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={lineVariants}
              className="w-24 h-1 bg-primary mx-auto mb-8"
            />
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={subtitleVariants}
              className="text-xl uppercase tracking-wider mb-6 font-light"
            >
              {dictionary.subtitle}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={-1}
              variants={contentVariants}
            >
              <div className="relative">
                <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/placeholder.svg?height=800&width=600&text=Achievement"
                    alt="People achieving goals"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-full h-full border-2 border-primary/30 rounded-2xl"></div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-primary/30 rounded-2xl"></div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={1}
              variants={contentVariants}
            >
              <div className="space-y-6 text-lg md:text-xl">
                <p>{dictionary.paragraph1}</p>
                <p>{dictionary.paragraph2}</p>
                <p>{dictionary.paragraph3}</p>
              </div>

              <motion.div
                className="mt-8 inline-flex items-center gap-2 text-primary text-lg font-medium cursor-pointer group"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <span>{dictionary.discoverLink}</span>
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
