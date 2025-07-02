import type React from "react";
import { PartnershipHero } from "@/components/business/partnership-hero";
import { BenefitsSection } from "@/components/business/benefits-section";
import { TestimonialsSection } from "@/components/business/testimonials-section";
import { CTASection } from "@/components/business/cta-section";
import Navbar from "@/components/navbar";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/middleware";
import { Footer } from "@/components/Footer";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden relative z-10">
      <Navbar
        lang={params.lang}
        dictionary={dict?.navbar || {}}
        variant="light"
        transparentOnTop={true}
      />

      <main className="flex-1 w-full">
        {/* Hero de Partnership */}
        <PartnershipHero dictionary={dict?.business?.partnership || {}} />

        {/* Sección de Beneficios */}
        <BenefitsSection dictionary={dict?.business?.benefits || {}} />

        {/* Transición de Benefits a Testimonials */}
        <div
          className="h-16 w-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,247,237,1) 0%, rgba(255,255,255,1) 100%)",
          }}
        />

        {/* Sección de Testimonios */}
        <TestimonialsSection dictionary={dict?.business?.testimonials || {}} />

        {/* Transición de Testimonials a CTA */}
        <div
          className="h-16 w-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,237,213,1) 100%)",
            opacity: 0.9,
          }}
        />

        {/* Sección CTA */}
        <CTASection dictionary={dict?.business?.cta || {}} />
      </main>

      {/* Renderizamos children solo si es necesario */}
      {children}
      <Footer dictionary={dict.footer} lang={params.lang} />

      {/* Footer */}
    </div>
  );
}
