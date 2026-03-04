"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface SkillMatchBadgeProps {
  jobSkills: string[];
  userSkills: string[];
}

export function SkillMatchBadge({ jobSkills, userSkills }: SkillMatchBadgeProps) {
  if (!userSkills.length || !jobSkills.length) return null;

  const matchingSkills = jobSkills.filter((skill) =>
    userSkills.some(
      (userSkill) => userSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  const matchPercentage = Math.round((matchingSkills.length / jobSkills.length) * 100);

  if (matchPercentage === 0) return null;

  const getIcon = () => {
    if (matchPercentage >= 80) return <CheckCircle2 className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  return (
    <Badge variant="outline" className="marketplace-pill">
      {getIcon()}
      {matchPercentage}% Match
    </Badge>
  );
}
