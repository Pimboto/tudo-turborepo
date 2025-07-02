"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface BenefitsSectionProps {
  dictionary: {
    title: string;
    titleHighlight: string;
    description: string;
    benefits: string[];
  }
}

export function BenefitsSection({ dictionary }: BenefitsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="w-full py-16 md:py-24 bg-orange-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {dictionary?.title || 'Beneficios'} <span className="text-orange-500">{dictionary?.titleHighlight || 'de la Asociación'}</span>
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed mt-4">
            {dictionary?.description || 'Descubre las ventajas de convertirte en nuestro socio comercial'}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(dictionary?.benefits || ['Amplía tu base de clientes', 'Aumenta la visibilidad en tu mercado', 'Acceso a recursos de marketing', 'Gerente de cuenta dedicado']).map((benefit, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-2 bg-white p-4 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="font-medium">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
