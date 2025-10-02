"use client";

import Image from "next/image";
import { trustLogos } from "@/lib/copy";
import { useGsapReveal } from "@/lib/animations";
import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function TrustBar() {
  const ref = useGsapReveal<HTMLDivElement>();
  const prefersReducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current?.querySelectorAll("img"),
        { filter: "grayscale(100%)", opacity: 0.4 },
        {
          filter: "grayscale(0%)",
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power2.out",
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion, ref]);

  return (
    <section ref={ref} className="border-y border-border/50 bg-background/80 py-10" data-animate>
      <div className="container flex flex-wrap items-center justify-center gap-8 opacity-90">
        {trustLogos.map((logo, index) => (
          <Image
            key={logo}
            src={logo}
            alt={`Trusted partner ${index + 1}`}
            width={120}
            height={36}
            className="h-10 w-auto opacity-80"
          />
        ))}
      </div>
    </section>
  );
}
