"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SaveMoneySectionProps {
  onTryNowClick: () => void
  dictionary: {
    title: string
    description: string
    tryNowButton: string
    yogaClass: string
    day: string
    time: string
    instructor: string
    credits: string
    saveLabel: string
    reserveButton: string
  }
}

export function SaveMoneySection({ onTryNowClick, dictionary }: SaveMoneySectionProps) {
  return (
    <section id="save-money" className="mb-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">{dictionary.title}</h2>
          <p className="text-lg text-muted-foreground mb-6">
            {dictionary.description}
          </p>
          <Button size="lg" onClick={onTryNowClick}>
            {dictionary.tryNowButton}
          </Button>
        </div>
        <div className="bg-muted rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">{dictionary.yogaClass}</h3>
              <span className="text-sm text-muted-foreground">{dictionary.day}, {dictionary.time}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">{dictionary.instructor}</span>
              <div className="flex items-center">
                <span className="line-through text-sm text-muted-foreground mr-2">8 {dictionary.credits}</span>
                <Badge variant="outline" className="bg-primary/10">
                  4 {dictionary.credits}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Badge className="bg-primary/20 text-primary border-primary">{dictionary.saveLabel}</Badge>
              <Button size="sm">{dictionary.reserveButton}</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
