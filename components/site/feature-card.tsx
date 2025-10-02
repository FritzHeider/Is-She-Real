"use client";

import dynamicIconImports from "lucide-react/dynamicIconImports";
import { createElement, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGsapHoverLift } from "@/lib/animations";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: keyof typeof dynamicIconImports;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const ref = useGsapHoverLift<HTMLDivElement>();
  const [IconComponent, setIconComponent] = useState<React.ComponentType<{ className?: string }>>();

  useEffect(() => {
    async function loadIcon() {
      const mod = await dynamicIconImports[icon]();
      setIconComponent(() => mod.default);
    }
    loadIcon();
  }, [icon]);

  return (
    <Card ref={ref} className="h-full" data-animate>
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          {IconComponent ? createElement(IconComponent, { className: "h-6 w-6" }) : null}
        </div>
        <div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-px w-full bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
      </CardContent>
    </Card>
  );
}
