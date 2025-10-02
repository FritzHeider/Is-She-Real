"use client";

import * as React from "react";
import gsap from "gsap";
import { Check } from "lucide-react";
import { pricingTiers } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGsapReveal } from "@/lib/animations";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function PricingTable() {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("monthly");
  const containerRef = useGsapReveal<HTMLDivElement>([billingCycle]);
  const cardsRef = React.useRef<Array<HTMLDivElement | null>>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const nodes = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const ctx = gsap.context(() => {
      nodes.forEach((card, index) => {
        const priceNode = card.querySelector<HTMLElement>("[data-price]");
        if (!priceNode) return;
        gsap.to(priceNode, {
          y: prefersReducedMotion ? 0 : -12,
          opacity: 0,
          duration: 0.2,
          ease: "power1.out",
          onComplete: () => {
            const tier = pricingTiers[index];
            const price = billingCycle === "monthly" ? tier.monthly : tier.annual;
            priceNode.textContent = `$${price}`;
          },
        });
        gsap.to(priceNode, {
          y: 0,
          opacity: 1,
          duration: 0.3,
          delay: 0.2,
          ease: "power3.out",
        });
      });
    });

    return () => ctx.revert();
  }, [billingCycle, prefersReducedMotion]);

  return (
    <section id="pricing" ref={containerRef} className="container space-y-10 py-24" data-animate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <h2 className="text-balance text-3xl font-display font-semibold sm:text-4xl">Pricing designed to scale with certainty.</h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Predictable pricing, no overage surprises. Switch between monthly and annual anytime.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/80 p-1 text-sm shadow-soft">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-4 py-2 transition ${billingCycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`rounded-full px-4 py-2 transition ${billingCycle === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Annual
          </button>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        {pricingTiers.map((tier, index) => (
          <Card
            key={tier.name}
            ref={(node) => {
              cardsRef.current[index] = node;
            }}
            className={tier.highlighted ? "border-primary/60 bg-primary/10 shadow-2xl" : "bg-card/70"}
            data-animate
          >
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold">{tier.name}</CardTitle>
              <CardDescription>{tier.tagline}</CardDescription>
              <div className="flex items-baseline gap-2 text-4xl font-display font-semibold" data-price>
                ${billingCycle === "monthly" ? tier.monthly : tier.annual}
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {billingCycle === "monthly" ? "per month" : "per seat billed annually"}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={tier.highlighted ? "secondary" : "default"}>
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
