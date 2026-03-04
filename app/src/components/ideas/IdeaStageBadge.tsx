"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Rocket, Zap } from "lucide-react";

interface IdeaStageBadgeProps {
  stage: "idea" | "mvp" | "launched";
}

const stageConfig = {
  idea: {
    icon: Lightbulb,
  },
  mvp: {
    icon: Zap,
  },
  launched: {
    icon: Rocket,
  },
};

export function IdeaStageBadge({ stage }: IdeaStageBadgeProps) {
  const tIdeas = useTranslations("ideas");
  const config = stageConfig[stage];
  const Icon = config.icon;
  const label =
    stage === "idea" ? tIdeas("ideaStage") : stage === "mvp" ? tIdeas("mvp") : tIdeas("launched");

  return (
    <Badge variant="outline" className="marketplace-pill">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
