// app/[lang]/pricing/page.tsx (Server Component)
import Navbar from "@/components/navbar"
import { PricingContent } from "@/components/pricing-components/pricing-content" // Nuevo componente cliente
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/middleware"
import { Footer } from "@/components/Footer";


export default async function PricingPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang)
  
  return (
    <div className="min-h-screen container mx-auto px-4 mt-20 bg-background relative z-999">
      <Navbar lang={lang} dictionary={dict.navbar}  variant="light" transparentOnTop={false} />
      <PricingContent lang={lang} dictionary={dict.pricing} />
      <Footer dictionary={dict.footer} lang={lang} />

    </div>
  )
}
