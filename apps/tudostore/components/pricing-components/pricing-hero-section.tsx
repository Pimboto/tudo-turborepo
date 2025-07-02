import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  dictionary: {
    title: string
    description: string
    monthlyButton: string
    annualButton: string
  }
}

export function HeroSection({ dictionary }: HeroSectionProps) {
  return (
    <section className="min-h-96 flex flex-col justify-center items-center mb-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-6 md:text-5xl">{dictionary.title}</h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
        {dictionary.description}
      </p>
      <div className="flex space-x-4">
        <Button variant="outline">
          {dictionary.monthlyButton}
        </Button>
        <Button>
          {dictionary.annualButton}
        </Button>
      </div>
    </section>
  )
}
