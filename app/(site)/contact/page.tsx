import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { Badge } from "@/components/ui/badge";
import { TrustBar } from "@/components/site/trust-bar";

export const metadata: Metadata = {
  title: "Contact",
  description: "Connect with the Is She Real team for demos, pricing, and partnership inquiries.",
};

export default function ContactPage() {
  return (
    <>
      <section className="container space-y-8 py-24">
        <Badge className="bg-primary/10 text-primary">Let’s talk</Badge>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-semibold sm:text-5xl">We’ll help your analysts win.</h1>
            <p className="text-lg text-muted-foreground">
              Share a few details and we’ll tailor a walkthrough to your workflows.
            </p>
            <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-soft">
              <p className="text-sm font-semibold text-foreground">What to expect</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Customized demo based on your threat surface</li>
                <li>• Pricing aligned to signal volume</li>
                <li>• Shared roadmap + security documentation</li>
              </ul>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
      <TrustBar />
    </>
  );
}
