import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about the mission and team behind Is She Real.",
};

export default function AboutPage() {
  return (
    <section className="container grid gap-12 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div className="space-y-6">
        <h1 className="text-4xl font-display font-semibold sm:text-5xl">We build clarity for the internet’s boldest teams.</h1>
        <p className="text-lg text-muted-foreground">
          Is She Real is a distributed team of researchers, designers, and operators. We’ve led trust & safety programs at scale and know the burden analysts carry when context is fragmented.
        </p>
        <p className="text-muted-foreground">
          Our mission is to build adaptive systems that amplify human judgment. We believe synthetic media should never outpace the truth—and we’re equipping teams with tooling that feels cinematic.
        </p>
        <Button size="lg">Meet the team</Button>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-border/60 bg-card/80 shadow-soft">
        <Image
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
          alt="Team working together"
          fill
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30" />
      </div>
    </section>
  );
}
