import * as React from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  hero?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageShell({ children, hero, className, contentClassName }: PageShellProps) {
  return (
    <section className={cn("academy-fade-up container py-6 md:py-8", className)}>
      <div className="page-shell-stage px-4 py-5 md:px-6 md:py-6">
        <div className="page-shell-grid" />
        <div className="relative z-10">
          {hero ? <div className="mb-6 md:mb-7">{hero}</div> : null}
          <div className={cn("space-y-6 md:space-y-7", contentClassName)}>{children}</div>
        </div>
      </div>
    </section>
  );
}
