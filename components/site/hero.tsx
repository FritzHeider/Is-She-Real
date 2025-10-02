"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildHeroTimeline } from "@/lib/animations";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Hero() {
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);
  const subheadingRef = React.useRef<HTMLParagraphElement | null>(null);
  const ctaRef = React.useRef<HTMLDivElement | null>(null);
  const bgRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const timeline = buildHeroTimeline(
      {
        heading: headingRef.current,
        subheading: subheadingRef.current,
        ctas: ctaRef.current,
        background: bgRef.current,
      },
      prefersReducedMotion
    );

    return () => {
      timeline?.kill();
    };
  }, [prefersReducedMotion]);

  useIsomorphicLayoutEffect(() => {
    if (!bgRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: bgRef.current,
          start: "top top",
          scrub: true,
        },
      });
    }, bgRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section className="relative overflow-hidden pb-24 pt-20 sm:pb-32 sm:pt-28">
      <div
        ref={bgRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] hero-gradient opacity-80 blur-3xl"
      />
      <div className="container relative grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="space-y-8">
          <Badge className="w-fit bg-foreground/10 text-foreground">
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Trust & safety intelligence, reimagined
            </span>
          </Badge>
          <h1 ref={headingRef} className="text-balance text-4xl font-display font-bold tracking-tight sm:text-6xl">
            Detect every fake with adaptive intelligence built for the real world.
          </h1>
          <p ref={subheadingRef} className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Is She Real gives your team the clarity to move faster. Train bespoke models, orchestrate automated playbooks, and align the entire trust org with insights that feel cinematic.
          </p>
          <div ref={ctaRef} className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/contact" className="inline-flex items-center gap-2">
                Request a live tour
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/features" className="inline-flex items-center gap-2">
                Explore features
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[28px] border border-border/50 bg-card/80 shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80"
              alt="Analyst dashboard"
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10" />
            <div className="absolute bottom-6 left-6 right-6 space-y-3 rounded-2xl border border-border/40 bg-background/80 p-4 shadow-soft">
              <p className="text-sm font-semibold">Live detection feed</p>
              <p className="text-xs text-muted-foreground">
                Synthetic media, bot networks, and anomalous behavior are surfaced in real time so your analysts can intervene instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
