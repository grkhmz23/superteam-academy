import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("border-border/70 bg-card/95 shadow-sm", className)}>
      {title || description ? (
        <CardHeader className="pb-4">
          {title ? <CardTitle className="text-lg text-foreground">{title}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(title || description ? "pt-0" : "", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
