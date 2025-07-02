//components\landing-page\cta-section.tsx
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/dictionary"

interface CTASectionProps {
  dictionary: Dictionary["ctaSection"]
}

export function CTASection({ dictionary }: CTASectionProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9422]/20 to-[#FF9422]/5 p-10 text-center">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">{dictionary.title}</h2>

        <p className="mb-8 text-lg text-muted-foreground">
          {dictionary.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="animate-shimmer bg-[#FF9422] hover:bg-[#FF9422]/90 bg-[length:200%_100%] transition-colors"
          >
            {dictionary.freeTrialButton}
          </Button>
          <Button size="lg" variant="outline">
            {dictionary.viewPlansButton}
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{dictionary.noCommitment}</p>
      </div>

      {/* Elementos decorativos animados */}
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#FF9422]/30 blur-3xl animate-pulse" />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#FF9422]/20 blur-3xl animate-pulse [animation-delay:1s]" />
    </div>
  )
}
