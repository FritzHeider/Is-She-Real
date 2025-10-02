"use client";

import { metrics } from "@/lib/copy";
import { useGsapCounter, useGsapReveal } from "@/lib/animations";

function MetricCard({ label, value }: { label: string; value: number }) {
  const counterRef = useGsapCounter(value);
  return (
    <div className="space-y-3 rounded-3xl border border-border/50 bg-card/70 p-8 shadow-soft" data-animate>
      <span ref={counterRef} className="block text-4xl font-display font-semibold tracking-tight">
        0
      </span>
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}

export function Metrics() {
  const sectionRef = useGsapReveal<HTMLDivElement>();

  return (
    <section ref={sectionRef} className="bg-gradient-to-b from-background to-background/40 py-20" data-animate>
      <div className="container grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </section>
  );
}
