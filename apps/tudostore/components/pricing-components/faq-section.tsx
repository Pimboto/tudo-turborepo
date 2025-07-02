"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, ArrowRight } from "lucide-react";
/* import ContactDialog from "../about/contact-dialog"; */

interface FAQSectionProps {
  dictionary: {
    title: string
    description: string
    questions: {
      howItWorks: {
        question: string
        answer: string
      },
      cancelSubscription: {
        question: string
        answer: string
      },
      creditsExpire: {
        question: string
        answer: string
      },
      changePlan: {
        question: string
        answer: string
      },
      bookClass: {
        question: string
        answer: string
      },
      cancellationPolicy: {
        question: string
        answer: string
      },
      additionalFees: {
        question: string
        answer: string
      },
      shareCredits: {
        question: string
        answer: string
      }
    },
    stillQuestions: {
      title: string
      description: string
      contactButton: string
    }
  }
}

export function FAQSection({ dictionary }: FAQSectionProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <section id="faq" className="mb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {dictionary.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {dictionary.description}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left text-lg font-medium">
              {dictionary.questions.howItWorks.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {dictionary.questions.howItWorks.answer}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left text-lg font-medium">
              {dictionary.questions.cancelSubscription.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {dictionary.questions.cancelSubscription.answer}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left text-lg font-medium">
              {dictionary.questions.creditsExpire.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {dictionary.questions.creditsExpire.answer}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left text-lg font-medium">
              {dictionary.questions.changePlan.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {dictionary.questions.changePlan.answer}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left text-lg font-medium">
              {dictionary.questions.bookClass.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {dictionary.questions.bookClass.answer}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left text-lg font-medium">
              {dictionary.questions.cancellationPolicy.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {dictionary.questions.cancellationPolicy.answer}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-left text-lg font-medium">
              {dictionary.questions.additionalFees.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {dictionary.questions.additionalFees.answer}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-left text-lg font-medium">
              {dictionary.questions.shareCredits.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {dictionary.questions.shareCredits.answer}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 bg-muted p-6 rounded-lg flex items-center justify-between">
          <div className="flex items-start gap-4">
            <MessageCircle className="h-10 w-10 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1">{dictionary.stillQuestions.title}</h3>
              <p className="text-muted-foreground">
                {dictionary.stillQuestions.description}
              </p>
            </div>
          </div>
          <Button
            className="flex-shrink-0"
            onClick={() => setIsContactOpen(true)}
          >
            {dictionary.stillQuestions.contactButton} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
     {/*  <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      /> */}
    </section>
  );
}
