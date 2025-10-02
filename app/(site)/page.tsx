import { Hero } from "@/components/site/hero";
import { TrustBar } from "@/components/site/trust-bar";
import { FeaturesGrid } from "@/components/site/features-grid";
import { Metrics } from "@/components/site/metrics";
import { SplitCTA } from "@/components/site/split-cta";
import { Testimonials } from "@/components/site/testimonials";
import { PricingTable } from "@/components/site/pricing-table";
import { FAQ } from "@/components/site/faq";
import { BlogPreview } from "@/components/site/blog-preview";
import { EmailCapture } from "@/components/site/email-capture";

export default function Page() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturesGrid />
      <Metrics />
      <SplitCTA />
      <Testimonials />
      <PricingTable />
      <FAQ />
      <BlogPreview />
      <EmailCapture />
    </>
  );
}
