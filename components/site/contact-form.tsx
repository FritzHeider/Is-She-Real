"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  name: z.string().min(2, "Share your name"),
  email: z.string().email("Add a valid email"),
  company: z.string().optional(),
  message: z.string().min(10, "How can we help?"),
});

export function ContactForm() {
  const { push } = useToast();
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      push({
        title: "Message received",
        description: "Our team will get back to you within 24 hours.",
      });
      reset();
    },
    [push, reset]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">Name</label>
          <Input {...register("name")} placeholder="Ada Lovelace" aria-invalid={!!errors.name} />
          {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input type="email" {...register("email")} placeholder="team@isshereal.ai" aria-invalid={!!errors.email} />
          {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Company</label>
        <Input {...register("company")} placeholder="Arcadia Systems" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Message</label>
        <textarea
          {...register("message")}
          rows={5}
          aria-invalid={!!errors.message}
          className="w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.message ? <p className="mt-1 text-xs text-destructive">{errors.message.message}</p> : null}
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
