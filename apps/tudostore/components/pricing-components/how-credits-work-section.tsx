import { Badge } from "@/components/ui/badge"

interface HowCreditsWorkSectionProps {
  dictionary: {
    title: string
    description: string
    yoga: string
    pilates: string
    hiit: string
    spa: string
    example: {
      title: string
      description: string
      hotYoga: string
      strengthTraining: string
      meditation: string
      pilates: string
      total: string
    }
  }
}

export function HowCreditsWorkSection({ dictionary }: HowCreditsWorkSectionProps) {
  return (
    <section id="how-credits-work" className="mb-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">{dictionary.title}</h2>
          <p className="text-lg text-muted-foreground mb-6">
            {dictionary.description}
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-1/3 font-medium">{dictionary.yoga}</div>
              <div className="w-2/3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-1/4"></div>
              </div>
              <div className="ml-4 text-sm">4-6 credits</div>
            </div>
            <div className="flex items-center">
              <div className="w-1/3 font-medium">{dictionary.pilates}</div>
              <div className="w-2/3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-2/5"></div>
              </div>
              <div className="ml-4 text-sm">6-8 credits</div>
            </div>
            <div className="flex items-center">
              <div className="w-1/3 font-medium">{dictionary.hiit}</div>
              <div className="w-2/3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-1/2"></div>
              </div>
              <div className="ml-4 text-sm">7-9 credits</div>
            </div>
            <div className="flex items-center">
              <div className="w-1/3 font-medium">{dictionary.spa}</div>
              <div className="w-2/3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-3/4"></div>
              </div>
              <div className="ml-4 text-sm">10-15 credits</div>
            </div>
          </div>
        </div>
        <div className="bg-muted p-8 rounded-lg">
          <h3 className="text-xl font-bold mb-4">{dictionary.example.title}</h3>
          <p className="text-muted-foreground mb-6">
            {dictionary.example.description}
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  x2
                </Badge>
                <span>{dictionary.example.hotYoga}</span>
              </div>
              <div>12 credits</div>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  x3
                </Badge>
                <span>{dictionary.example.strengthTraining}</span>
              </div>
              <div>18 credits</div>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  x1
                </Badge>
                <span>{dictionary.example.meditation}</span>
              </div>
              <div>4 credits</div>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  x2
                </Badge>
                <span>{dictionary.example.pilates}</span>
              </div>
              <div>14 credits</div>
            </div>
            <div className="flex justify-between font-bold">
              <div>{dictionary.example.total}</div>
              <div>48 credits</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
