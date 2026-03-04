"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, LuxuryBadge } from "@/components/luxury/primitives";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

interface JobFormData {
  title: string;
  company: string;
  companyDescription: string;
  companyWebsite: string;
  location: string;
  type: string;
  experience: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
}

export default function NewJobPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("common");
  const tJobs = useTranslations("jobs");
  const router = useRouter();

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    companyDescription: "",
    companyWebsite: "",
    location: "",
    type: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    skills: [],
  });

  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const experienceMap: Record<string, "junior" | "mid" | "senior"> = {
        entry: "junior",
        mid: "mid",
        senior: "senior",
        lead: "senior",
      };
      const type = ["full-time", "part-time", "contract"].includes(formData.type)
        ? formData.type
        : "contract";
      const salaryParts = [formData.salaryCurrency];
      if (formData.salaryMin) salaryParts.push(formData.salaryMin);
      if (formData.salaryMax) salaryParts.push(formData.salaryMax);
      const salaryRange = salaryParts.length > 1 ? salaryParts.join(" ") : undefined;

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          company: formData.company,
          companyLogo: formData.companyWebsite || undefined,
          location: formData.location,
          type,
          salaryRange,
          skills: formData.skills,
          experience: experienceMap[formData.experience] ?? "mid",
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to create job (${res.status})`);
      }
      const data = (await res.json()) as { job?: { id: string } };
      router.push(data.job?.id ? `/jobs/${data.job.id}` : "/jobs");
    } catch (error) {
      console.error("Failed to post job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.title &&
    formData.company &&
    formData.location &&
    formData.type &&
    formData.experience &&
    formData.description;

  return (
    <AuthGuard>
      <div className="container py-8 md:py-10">
        {/* Back button */}
        <Link href="/jobs">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-8 md:p-10">
          <LuxuryBadge color="emerald">{tJobs("postJob")}</LuxuryBadge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Post a New Job
          </h1>
          <p className="mt-2 text-muted-foreground">
            Reach thousands of qualified Solana developers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="space-y-6">
            {/* Job Details */}
            <GlassCard glowColor="emerald">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Details
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">
                      Job Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Senior Solana Developer"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="e.g., Acme Inc"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Remote, San Francisco, CA"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">
                      Job Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">
                      Experience Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, experience: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Salary Range (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum</Label>
                    <Input
                      id="salaryMin"
                      name="salaryMin"
                      type="number"
                      placeholder="e.g., 80000"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum</Label>
                    <Input
                      id="salaryMax"
                      name="salaryMax"
                      type="number"
                      placeholder="e.g., 120000"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryCurrency">Currency</Label>
                    <Select
                      value={formData.salaryCurrency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, salaryCurrency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add a skill (e.g., Rust, Anchor)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the role, what the candidate will be working on, and what makes this opportunity exciting..."
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="List the key requirements (one per line)..."
                    rows={4}
                    value={formData.requirements}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    name="responsibilities"
                    placeholder="List the main responsibilities (one per line)..."
                    rows={4}
                    value={formData.responsibilities}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    name="benefits"
                    placeholder="List the benefits and perks (one per line)..."
                    rows={4}
                    value={formData.benefits}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyDescription">About the Company</Label>
                  <Textarea
                    id="companyDescription"
                    name="companyDescription"
                    placeholder="Tell candidates about your company..."
                    rows={3}
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    placeholder="https://your-company.com"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/jobs">
                <Button variant="outline" type="button">
                  {t("cancel")}
                </Button>
              </Link>
              <Button type="submit" disabled={!isFormValid || isSubmitting} variant="solana">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post Job
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}
