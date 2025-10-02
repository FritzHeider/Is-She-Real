"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/copy";
import { useGsapReveal } from "@/lib/animations";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function FAQ() {
  const sectionRef = useGsapReveal<HTMLDivElement>();
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleValueChange = React.useCallback(
    (value: string) => {
      if (!value || prefersReducedMotion) return;
      const content = document.querySelector<HTMLElement>(`#faq-${value}`);
      if (!content) return;
      gsap.fromTo(
        content,
        { height: 0, opacity: prefersReducedMotion ? 1 : 0.6 },
        {
          height: "auto",
          opacity: 1,
          duration: prefersReducedMotion ? 0.2 : 0.4,
          ease: "power2.out",
        }
      );
    },
    [prefersReducedMotion]
  );

  return (
    <section ref={sectionRef} className="container space-y-10 py-24" data-animate>
      <div className="space-y-3">
        <h2 className="text-balance text-3xl font-display font-semibold sm:text-4xl">FAQ</h2>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Everything you need to know about rolling out Is She Real across your organization.
        </p>
      </div>
      <AccordionPrimitive.Root type="single" collapsible onValueChange={handleValueChange} className="space-y-4">
        {faqs.map((faq) => {
          const slug = faq.question.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
          <AccordionPrimitive.Item
            key={faq.question}
            value={slug}
            className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-soft"
          >
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-foreground">
                {faq.question}
                <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              id={`faq-${slug}`}
              className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground"
            >
              {faq.answer}
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        );
        })}
      </AccordionPrimitive.Root>
    </section>
  );
}
