"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, Star, Zap, Shield, Trophy, Flame } from "lucide-react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: "award" | "star" | "zap" | "shield" | "trophy" | "flame";
  color: "default" | "gold" | "silver" | "bronze" | "purple";
  earnedAt: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
  size?: "sm" | "md" | "lg";
}

const iconComponents = {
  award: Award,
  star: Star,
  zap: Zap,
  shield: Shield,
  trophy: Trophy,
  flame: Flame,
};

const colorClasses = {
  default: "bg-primary/10 text-primary",
  gold: "bg-amber-500/10 text-amber-500",
  silver: "bg-slate-400/10 text-slate-400",
  bronze: "bg-orange-600/10 text-orange-600",
  purple: "bg-purple-500/10 text-purple-500",
};

export function BadgeDisplay({ badges, size = "md" }: BadgeDisplayProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const Icon = iconComponents[badge.icon];
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div
                  className={`${sizeClasses[size]} rounded-full ${colorClasses[badge.color]} flex items-center justify-center cursor-help`}
                >
                  <Icon className={iconSizes[size]} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
