// components/pricing-components/pricing-content.tsx
"use client"

import { useState } from "react"
import { HeroSection } from "./pricing-hero-section"
import { SaveMoneySection } from "./save-money-section"
import { HowCreditsWorkSection } from "./how-credits-work-section"
import { FAQSection } from "./faq-section"
import type { Locale } from "@/middleware"

interface PricingContentProps {
  lang: Locale
  dictionary: any // Puedes definir un tipo más específico
}

export function PricingContent({ lang, dictionary }: PricingContentProps) {
  const [isContactOpen, setIsContactOpen] = useState(false)
  
  const handleTryNowClick = () => {
    window.location.href = `/${lang}/register`
  }
  
  return (
    <main className="container mx-auto px-4 pt-32 pb-16">
      <HeroSection dictionary={dictionary.hero} />
      <SaveMoneySection 
        onTryNowClick={handleTryNowClick} 
        dictionary={dictionary.saveMoney} 
      />
      <HowCreditsWorkSection dictionary={dictionary.howCredits} />
      <FAQSection 
        dictionary={dictionary.faq} 
        isOpen={isContactOpen}
        onOpenChange={setIsContactOpen}
      />
    </main>
  )
}
