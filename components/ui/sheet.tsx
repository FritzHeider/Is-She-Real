"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn("fixed inset-0 z-[49] bg-black/50 backdrop-blur-sm", className)}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, side = "right", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[50] flex h-full w-full max-w-sm flex-col gap-6 border-l border-border/60 bg-background p-6 shadow-2xl data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in",
        side === "left" ? "left-0" : "right-0",
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-5 top-5 rounded-full bg-foreground/5 p-2 text-muted-foreground transition hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetOverlay, SheetPortal, SheetTrigger };
