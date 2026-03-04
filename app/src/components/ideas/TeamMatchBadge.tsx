"use client";

import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface TeamMatchBadgeProps {
  skillsNeeded: string[];
  userSkills: string[];
}

export function TeamMatchBadge({ skillsNeeded, userSkills }: TeamMatchBadgeProps) {
  if (!userSkills.length || !skillsNeeded.length) return null;

  const matchingSkills = skillsNeeded.filter((skill) =>
    userSkills.some(
      (userSkill) => userSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  const matchPercentage = Math.round((matchingSkills.length / skillsNeeded.length) * 100);

  if (matchPercentage === 0) return null;

  return (
    <Badge variant="outline" className="marketplace-pill">
      <Users className="h-3 w-3" />
      {matchPercentage}% Team Match
    </Badge>
  );
}
