"use client";

import * as React from "react";
import Image from "next/image";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { testimonials } from "@/lib/copy";
import { useGsapReveal } from "@/lib/animations";

export function Testimonials() {
  const ref = useGsapReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="container space-y-8 py-24" data-animate>
      <div className="space-y-3">
        <h2 className="text-balance text-3xl font-display font-semibold sm:text-4xl">
          Teams ship faster when clarity feels cinematic.
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Trusted by the world’s most forward-thinking trust & safety organizations.
        </p>
      </div>
      <ScrollAreaPrimitive.Root className="overflow-hidden">
        <ScrollAreaPrimitive.Viewport className="w-full">
          <div className="flex gap-6 pb-4">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.author}
                className="relative min-w-[280px] max-w-sm flex-1 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-soft"
                data-animate
              >
                <p className="text-base leading-relaxed text-foreground">“{testimonial.quote}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar orientation="horizontal" className="flex h-2 rounded-full bg-muted">
          <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-primary/60" />
        </ScrollAreaPrimitive.Scrollbar>
      </ScrollAreaPrimitive.Root>
    </section>
  );
}
