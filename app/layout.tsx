import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SiteHeader } from "@/components/site/site-header";
import { Footer } from "@/components/site/footer";
import { ToastProviderScoped } from "@/components/ui/use-toast";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://isshereal.ai"),
  title: {
    default: "Is She Real — Synthetic media detection for bold teams",
    template: "%s | Is She Real",
  },
  description:
    "Is She Real is the adaptive trust & safety intelligence platform. Detect deepfakes, orchestrate interventions, and align every analyst.",
  openGraph: {
    title: "Is She Real",
    description:
      "Detect deepfakes and orchestrate adaptive trust & safety workflows with cinematic clarity.",
    url: "https://isshereal.ai",
    siteName: "Is She Real",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Is She Real platform preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Is She Real",
    description:
      "Adaptive trust & safety intelligence to outsmart synthetic media.",
    creator: "@isshereal",
  },
  alternates: {
    canonical: "https://isshereal.ai",
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#101226" }, { color: "#eff6ff" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider>
          <ToastProviderScoped>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ToastProviderScoped>
        </ThemeProvider>
      </body>
    </html>
  );
}
