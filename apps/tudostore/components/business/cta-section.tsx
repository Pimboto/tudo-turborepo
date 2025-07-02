"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CTASectionProps {
  dictionary: {
    title: string;
    titleHighlight: string;
    description: string;
    buttonText: string;
  }
}

export function CTASection({ dictionary }: CTASectionProps) {
  return (
    <section className="w-full py-16 md:py-24 bg-orange-100 text-gray-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {dictionary?.title || '¿Listo para'} <span className="text-orange-500">{dictionary?.titleHighlight || 'unirte'}</span>?
          </h2>
          <p className="mx-auto max-w-[700px] md:text-xl/relaxed text-gray-700">
            {dictionary?.description || 'Comienza hoy mismo y transforma tu negocio con nuestra plataforma líder en el sector'}
          </p>
          <div className="pt-4">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 text-lg font-medium">
              {dictionary?.buttonText || 'Conviértete en Socio'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
