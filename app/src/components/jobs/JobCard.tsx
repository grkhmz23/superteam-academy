"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { Building2, Clock3, DollarSign, MapPin } from "lucide-react";
import { SkillMatchBadge } from "./SkillMatchBadge";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "freelance" | "internship";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  skills: string[];
  experience: "entry" | "mid" | "senior" | "lead";
  postedAt: string;
  description?: string;
}

interface JobCardProps {
  job: Job;
  userSkills?: string[];
}

const experienceLabels: Record<Job["experience"], string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
  lead: "Lead",
};

const typeLabels: Record<Job["type"], string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

export function JobCard({ job, userSkills = [] }: JobCardProps) {
  const tJobs = useTranslations("jobs");
  const tCommon = useTranslations("common");

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.salaryCurrency || "USD";
    const min = job.salaryMin?.toLocaleString();
    const max = job.salaryMax?.toLocaleString();
    if (min && max) return `${currency} ${min} - ${max}`;
    if (min) return `${currency} ${min}+`;
    if (max) return `${currency} ${max}`;
    return null;
  };

  return (
    <MarketplaceCard interactive className="marketplace-card-shell h-full">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{job.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{job.company}</span>
              </span>
              <SkillMatchBadge jobSkills={job.skills} userSkills={userSkills} />
            </div>
          </div>
          <Badge variant="outline" className="marketplace-pill shrink-0">
            {typeLabels[job.type]}
          </Badge>
        </div>

        <div className="marketplace-meta-row">
          <Badge variant="outline" className="marketplace-pill">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </Badge>
          <Badge variant="outline" className="marketplace-pill">
            {experienceLabels[job.experience]}
          </Badge>
          {formatSalary() ? (
            <Badge variant="outline" className="marketplace-pill">
              <DollarSign className="h-3.5 w-3.5" />
              {formatSalary()}
            </Badge>
          ) : null}
          <Badge variant="outline" className="marketplace-pill">
            <Clock3 className="h-3.5 w-3.5" />
            {job.postedAt}
          </Badge>
        </div>

        {job.description ? (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{job.description}</p>
        ) : null}

        <div className="marketplace-meta-row">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="marketplace-pill">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 ? (
            <Badge variant="outline" className="marketplace-pill">
              +{job.skills.length - 4}
            </Badge>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3 px-5 pb-5 pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{tJobs("experienceLevel")}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{tCommon("active")}</span>
        </div>
        <Button asChild size="sm" className="rounded-xl">
          <Link href={`/jobs/${job.id}`}>{tJobs("applyNow")}</Link>
        </Button>
      </CardFooter>
    </MarketplaceCard>
  );
}
