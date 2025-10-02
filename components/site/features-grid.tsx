"use client";

import { featureCards } from "@/lib/copy";
import { useGsapReveal } from "@/lib/animations";
import { FeatureCard } from "./feature-card";

export function FeaturesGrid() {
  const ref = useGsapReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="container space-y-10 py-24" data-animate>
      <div className="space-y-4">
        <h2 className="text-balance text-3xl font-display font-semibold sm:text-4xl">
          Build trust at the speed of your imagination.
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every interaction across your ecosystem is observed, enriched, and orchestrated through one unified intelligence layer.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
