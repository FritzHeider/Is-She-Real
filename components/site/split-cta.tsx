"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGsapReveal } from "@/lib/animations";

export function SplitCTA() {
  const ref = useGsapReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="container py-24" data-animate>
      <div className="grid gap-8 rounded-[32px] border border-border/60 bg-card/80 p-10 shadow-soft lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <Badge className="bg-secondary/10 text-secondary">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Analyst copilots
            </span>
          </Badge>
          <h2 className="text-3xl font-display font-semibold sm:text-4xl">
            Let the system triage so your analysts can focus on judgment calls.
          </h2>
          <p className="text-lg text-muted-foreground">
            Our automation framework deflects 60% of repeat incidents before they hit your queue and enriches the rest with narrative-ready context.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Button asChild size="lg">
            <Link href="/contact" className="inline-flex items-center gap-2">
              Schedule strategy session
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/features" className="inline-flex items-center gap-2 text-primary">
              Download automation guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
