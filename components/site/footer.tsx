import Link from "next/link";
import { navItems } from "@/lib/copy";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80">
      <div className="container flex flex-col gap-10 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-semibold text-primary-foreground">
            ISR
          </span>
          <p className="max-w-sm text-sm text-muted-foreground">
            Building the trust & safety co-pilot for the world’s boldest platforms. Designed with intention, secured by default.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Is She Real. All rights reserved.</p>
      </div>
    </footer>
  );
}
