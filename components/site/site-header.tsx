"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { navItems } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { useGsapReveal } from "@/lib/animations";

export function SiteHeader() {
  const revealRef = useGsapReveal();

  return (
    <header
      ref={revealRef}
      className="sticky top-0 z-[40] border-b border-border/50 bg-background/80 backdrop-blur"
      data-animate
    >
      <div className="container flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-base text-primary-foreground shadow-soft">
            ISR
          </span>
          <span className="hidden sm:inline">Is She Real</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <Button asChild variant="outline">
            <Link href="/contact">Request demo</Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="max-w-xs">
              <div className="mt-16 flex flex-col gap-6 text-lg font-semibold">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-foreground" data-animate>
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-3">
                <Button asChild>
                  <Link href="/contact">Request demo</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
