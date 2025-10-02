"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { durations, easings } from "./design-tokens";

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal<T extends HTMLElement>(deps: any[] = []) {
  const targetRef = useRef<T | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!targetRef.current) return;

    const ctx = gsap.context(() => {
      const elements = targetRef.current?.querySelectorAll<HTMLElement>("[data-animate]");
      if (!elements?.length) return;

      gsap.set(elements, { opacity: 0, y: prefersReducedMotion ? 0 : 60 });

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: durations.base,
        ease: easings.out,
        stagger: 0.1,
        scrollTrigger: {
          trigger: targetRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, targetRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, ...deps]);

  return targetRef;
}

export function useGsapCounter(target: number, options: { duration?: number } = {}) {
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!nodeRef.current) return;

    const ctx = gsap.context(() => {
      const obj = { value: 0 };
      const duration = options.duration ?? durations.slow;

      gsap.to(obj, {
        value: target,
        ease: easings.out,
        duration: prefersReducedMotion ? duration / 2 : duration,
        scrollTrigger: {
          trigger: nodeRef.current,
          start: "top 90%",
          once: true,
        },
        onUpdate: () => {
          if (!nodeRef.current) return;
          nodeRef.current.textContent = Math.round(obj.value).toLocaleString();
        },
      });
    }, nodeRef);

    return () => ctx.revert();
  }, [options.duration, prefersReducedMotion, target]);

  return nodeRef;
}

export function useGsapHoverLift<T extends HTMLElement>() {
  const elementRef = useRef<T | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!elementRef.current || prefersReducedMotion) return;

    const el = elementRef.current;
    const quickScale = gsap.quickTo(el, "scale", { duration: durations.fast, ease: "power1.out" });
    const quickY = gsap.quickTo(el, "y", { duration: durations.fast, ease: "power1.out" });

    const enter = () => {
      quickScale(1.04);
      quickY(-8);
    };

    const leave = () => {
      quickScale(1);
      quickY(0);
    };

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);

    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("focus", enter);
      el.removeEventListener("blur", leave);
    };
  }, [prefersReducedMotion]);

  return elementRef;
}

export function buildHeroTimeline(nodes: {
  heading: HTMLElement | null;
  subheading: HTMLElement | null;
  ctas: HTMLElement | null;
  background: HTMLElement | null;
}, prefersReducedMotion: boolean) {
  if (!nodes.heading) return;

  const timeline = gsap.timeline({ defaults: { ease: easings.out, duration: durations.base } });
  timeline
    .fromTo(
      nodes.heading,
      { opacity: 0, y: prefersReducedMotion ? 0 : 60 },
      { opacity: 1, y: 0 }
    )
    .fromTo(
      nodes.subheading,
      { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
      { opacity: 1, y: 0 },
      "-=0.3"
    )
    .fromTo(
      nodes.ctas,
      { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
      { opacity: 1, y: 0 },
      "-=0.4"
    );

  if (nodes.background && !prefersReducedMotion) {
    timeline.fromTo(
      nodes.background,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: durations.slow },
      "<"
    );
  }

  return timeline;
}
