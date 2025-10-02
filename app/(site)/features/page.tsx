import { Metadata } from "next";
import { FeaturesGrid } from "@/components/site/features-grid";
import { SplitCTA } from "@/components/site/split-cta";
import { TrustBar } from "@/components/site/trust-bar";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore the Is She Real platform capabilities across detection, automation, and analytics.",
};

export default function FeaturesPage() {
  return (
    <>
      <section className="container space-y-6 py-24">
        <h1 className="text-4xl font-display font-semibold sm:text-5xl">Platform capabilities</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          From adaptive detection to automated incident resolution, Is She Real equips trust teams with a cinematic command center.
        </p>
      </section>
      <TrustBar />
      <FeaturesGrid />
      <SplitCTA />
    </>
  );
}
