import MadeToMoveSection from "@/components/about/made-to-move-section"
import NoStringsSection from "@/components/about/no-strings-section"
import MakeItHappenSection from "@/components/about/make-it-happen-section"
import MeshGradientBackground from "@/components/about/mesh-gradient-background"
import Navbar from "@/components/navbar"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/middleware"
import type { Metadata } from "next"
import { Footer } from "@/components/Footer"

export async function generateMetadata({ 
  params 
}: { 
  params: { lang: Locale } 
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang)

  // Agregamos verificación de seguridad
  return {
    title: dict?.aboutpage?.metadata?.title || "About Us",
    description: dict?.aboutpage?.metadata?.description || "Learn more about our fitness platform",
  }
}

export default async function AboutPage({ 
  params 
}: { 
  params: { lang: Locale } 
}) {
  // Correctamente esperamos el valor de lang desde params
  const dict = await getDictionary(params.lang)
  
  // Verificamos que dict tenga la estructura correcta
  const defaultDict = {
    madeToMove: {},
    noStrings: {},
    makeItHappen: {}
  }

  // Usamos el operador de encadenamiento opcional para evitar errores
  const aboutDict = dict?.aboutpage || defaultDict

  return (
    <main className="relative">
      {/* Aplicamos el gradiente a toda la página */}
      <MeshGradientBackground colorIntensity={0.15} />

      {/* Contenido de la página */}
      <div className="relative z-10">
        <Navbar lang={params.lang} dictionary={dict?.navbar || {}} variant="light" transparentOnTop={true} />
        <MadeToMoveSection dictionary={aboutDict.madeToMove} />
        <NoStringsSection dictionary={aboutDict.noStrings} />
        <MakeItHappenSection dictionary={aboutDict.makeItHappen} />
        <Footer dictionary={dict.footer} lang={params.lang} />
      </div>


      {/* Footer */}
    </main>

  )
}

// Para optimizar el rendimiento con páginas pre-renderizadas
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'es' }
  ]
}
