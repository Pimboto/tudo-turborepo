//app\[lang]\page.tsx
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import { getDictionary } from "@/lib/dictionary";
import { FeatureSection } from "@/components/landing-page/feature-section";
import { CTASection } from "@/components/landing-page/cta-section";
import { Footer } from "@/components/Footer";

import type { Locale } from "@/middleware";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Navigation */}
      <Navbar
        lang={lang}
        dictionary={dict.navbar}
        variant="dark"
        transparentOnTop={true}
      />

      {/* Hero Section - Full screen with video background */}
      <HeroSection lang={lang} dictionary={dict.hero} />
      
      {/* Content Sections */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Features Section */}
          <FeatureSection dictionary={dict.featureSection} />
          
          {/* CTA Section - with spacing */}
          <div className="mt-24 mb-8">
            <CTASection dictionary={dict.ctaSection} />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer dictionary={dict.footer} lang={lang} />
    </main>
  );
}
