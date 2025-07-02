"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TestimonialsSectionProps {
  dictionary: {
    title: string;
    titleHighlight: string;
    description: string;
    testimonials: Array<{
      quote: string;
      author: string;
      position: string;
    }>;
  }
}

export function TestimonialsSection({ dictionary }: TestimonialsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  // Valores predeterminados por si el diccionario es undefined
  const defaultTestimonials = [
    {
      quote: "TUDO ha transformado completamente nuestro negocio. Hemos aumentado nuestras ventas en un 30% desde que nos unimos.",
      author: "María Rodríguez",
      position: "CEO, Fitness Center"
    },
    {
      quote: "La plataforma es intuitiva y el soporte es excepcional. Recomendaría TUDO a cualquier negocio de fitness.",
      author: "Carlos Méndez",
      position: "Director, Yoga Studio"
    },
    {
      quote: "Nos ha permitido llegar a clientes que nunca hubiéramos alcanzado. La inversión ha valido cada céntimo.",
      author: "Ana López",
      position: "Propietaria, Gym & Wellness"
    }
  ]

  return (
    <section className="w-full py-16 md:py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {dictionary?.title || 'Lo que dicen nuestros'} <span className="text-orange-500">{dictionary?.titleHighlight || 'socios'}</span>
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed mt-4">
            {dictionary?.description || 'Descubre cómo TUDO ha ayudado a negocios como el tuyo a crecer y prosperar'}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {(dictionary?.testimonials || defaultTestimonials).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="h-full border-orange-100">
                <CardContent className="p-6 space-y-4">
                  <Quote className="h-8 w-8 text-orange-500" />
                  <p className="italic text-gray-600">{testimonial.quote}</p>
                  <div>
                    <p className="font-bold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.position}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
