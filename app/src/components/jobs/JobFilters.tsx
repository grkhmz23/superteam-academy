"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FilterCard } from "@/components/ui/filter-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getLocaleDirection } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/request";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export interface JobFiltersState {
  search: string;
  skills: string[];
  experience: string[];
  location: string[];
  type: string[];
}

interface JobFiltersProps {
  filters: JobFiltersState;
  onChange: (filters: JobFiltersState) => void;
  availableSkills?: string[];
  availableLocations?: string[];
}

const experienceOptions = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const typeOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

export function JobFilters({
  filters,
  onChange,
  availableSkills = [],
  availableLocations = [],
}: JobFiltersProps) {
  const tc = useTranslations("common");
  const tJobs = useTranslations("jobs");
  const locale = useLocale();
  const isRtl = getLocaleDirection(locale as Locale) === "rtl";
  const searchIconClass = isRtl ? "right-3" : "left-3";
  const searchInputClass = isRtl ? "pr-9" : "pl-9";
  const [localSearch, setLocalSearch] = useState(filters.search);

  const optionRowClass = (active: boolean) =>
    cn(
      "flex items-center gap-2 rounded-xl px-1 py-1 transition-colors",
      active ? "bg-muted/40 text-foreground" : "hover:bg-muted/30"
    );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...filters, search: localSearch });
  };

  const toggleFilter = (category: keyof JobFiltersState, value: string) => {
    const current = filters[category] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [category]: updated });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onChange({
      search: "",
      skills: [],
      experience: [],
      location: [],
      type: [],
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.skills.length > 0 ||
    filters.experience.length > 0 ||
    filters.location.length > 0 ||
    filters.type.length > 0;

  return (
    <FilterCard
      title={tJobs("filters")}
      footer={
        hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full justify-center gap-1">
            <X className="h-4 w-4" />
            {tJobs("clearFilters")}
          </Button>
        ) : null
      }
    >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <Label htmlFor="job-search" className="text-sm font-medium text-foreground">{tc("search")}</Label>
          <div className="relative">
            <Search
              className={cn(
                "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                searchIconClass
              )}
            />
            <Input
              id="job-search"
              placeholder={tJobs("searchPlaceholder")}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={searchInputClass}
            />
          </div>
        </form>

        {/* Experience */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">{tJobs("experienceLevel")}</Label>
          <div className="space-y-2">
            {experienceOptions.map((option) => (
              <div
                key={option.value}
                className={optionRowClass(filters.experience.includes(option.value))}
              >
                <Checkbox
                  id={`exp-${option.value}`}
                  checked={filters.experience.includes(option.value)}
                  onCheckedChange={() => toggleFilter("experience", option.value)}
                />
                <Label
                  htmlFor={`exp-${option.value}`}
                  className="cursor-pointer text-sm font-normal text-muted-foreground"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">{tJobs("jobType")}</Label>
          <div className="space-y-2">
            {typeOptions.map((option) => (
              <div
                key={option.value}
                className={optionRowClass(filters.type.includes(option.value))}
              >
                <Checkbox
                  id={`type-${option.value}`}
                  checked={filters.type.includes(option.value)}
                  onCheckedChange={() => toggleFilter("type", option.value)}
                />
                <Label
                  htmlFor={`type-${option.value}`}
                  className="cursor-pointer text-sm font-normal text-muted-foreground"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        {availableSkills.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">{tJobs("skills")}</Label>
            <div className="academy-scrollbar max-h-40 space-y-2 overflow-y-auto pe-1">
              {availableSkills.map((skill) => (
                <div
                  key={skill}
                  className={optionRowClass(filters.skills.includes(skill))}
                >
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={filters.skills.includes(skill)}
                    onCheckedChange={() => toggleFilter("skills", skill)}
                  />
                  <Label
                    htmlFor={`skill-${skill}`}
                    className="cursor-pointer text-sm font-normal text-muted-foreground"
                  >
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {availableLocations.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">{tJobs("location")}</Label>
            <div className="academy-scrollbar max-h-40 space-y-2 overflow-y-auto pe-1">
              {availableLocations.map((location) => (
                <div
                  key={location}
                  className={optionRowClass(filters.location.includes(location))}
                >
                  <Checkbox
                    id={`loc-${location}`}
                    checked={filters.location.includes(location)}
                    onCheckedChange={() => toggleFilter("location", location)}
                  />
                  <Label
                    htmlFor={`loc-${location}`}
                    className="cursor-pointer text-sm font-normal text-muted-foreground"
                  >
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
    </FilterCard>
  );
}
