"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useGsapReveal } from "@/lib/animations";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

export function EmailCapture() {
  const { push } = useToast();
  const ref = useGsapReveal<HTMLDivElement>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = React.useCallback(
    async (values: z.infer<typeof schema>) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      push({
        title: "Subscribed",
        description: `We’ll keep you posted at ${values.email}.`,
      });
      reset();
    },
    [push, reset]
  );

  return (
    <section ref={ref} className="container py-24" data-animate>
      <div className="rounded-[32px] border border-border/60 bg-gradient-to-r from-primary/15 via-secondary/15 to-foreground/5 p-10 shadow-soft">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-semibold sm:text-4xl">Stay in the intelligence loop.</h2>
            <p className="text-muted-foreground">
              Research drops, roadmap previews, and operator playbooks delivered twice per month.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-2 text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="shrink-0" disabled={isSubmitting}>
              {isSubmitting ? "Joining…" : "Join waitlist"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
