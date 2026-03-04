import * as React from "react";
import { cn } from "@/lib/utils";

interface CourseGridProps {
  children: React.ReactNode;
  className?: string;
}

export function CourseGrid({ children, className }: CourseGridProps) {
  return <div className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>;
}
