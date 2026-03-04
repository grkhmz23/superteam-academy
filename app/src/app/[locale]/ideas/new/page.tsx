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
import { X, Plus, Loader2, ArrowLeft, Lightbulb, Target, Rocket } from "lucide-react";
import Link from "next/link";

interface IdeaFormData {
  title: string;
  problem: string;
  solution: string;
  stage: string;
  lookingFor: string[];
  skillsNeeded: string[];
}

const stageOptions = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "MVP" },
  { value: "launched", label: "Launched" },
];

const roleOptions = [
  "Developer",
  "Designer",
  "Product Manager",
  "Marketing",
  "Business Development",
  "Investor",
  "Advisor",
  "Community Manager",
];

const skillOptions = [
  "Rust",
  "Anchor",
  "React",
  "TypeScript",
  "Node.js",
  "Solidity",
  "UI/UX",
  "Product Design",
  "Marketing",
  "DeFi",
  "NFT",
  "Gaming",
];

export default function NewIdeaPage() {
  const t = useTranslations("common");
  const tIdeas = useTranslations("ideas");
  const router = useRouter();

  const [formData, setFormData] = useState<IdeaFormData>({
    title: "",
    problem: "",
    solution: "",
    stage: "",
    lookingFor: [],
    skillsNeeded: [],
  });

  const [newRole, setNewRole] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(role)
        ? prev.lookingFor.filter((r) => r !== role)
        : [...prev.lookingFor, role],
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.includes(skill)
        ? prev.skillsNeeded.filter((s) => s !== skill)
        : [...prev.skillsNeeded, skill],
    }));
  };

  const addCustomRole = () => {
    if (newRole.trim() && !formData.lookingFor.includes(newRole.trim())) {
      setFormData((prev) => ({
        ...prev,
        lookingFor: [...prev.lookingFor, newRole.trim()],
      }));
      setNewRole("");
    }
  };

  const addCustomSkill = () => {
    if (newSkill.trim() && !formData.skillsNeeded.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsNeeded: [...prev.skillsNeeded, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeRole = (roleToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.filter((r) => r !== roleToRemove),
    }));
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const roleMap: Record<string, "developer" | "designer" | "marketer" | "advisor" | "investor"> = {
        Developer: "developer",
        Designer: "designer",
        "Product Manager": "advisor",
        Marketing: "marketer",
        "Business Development": "advisor",
        Investor: "investor",
        Advisor: "advisor",
        "Community Manager": "marketer",
      };
      const lookingFor = formData.lookingFor.slice(0, 5).map((role) => roleMap[role] ?? "developer");

      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: `${formData.problem}\n\n${formData.solution}`,
          problem: formData.problem,
          solution: formData.solution,
          lookingFor,
          stage: formData.stage,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to create idea (${res.status})`);
      }
      const data = (await res.json()) as { idea?: { id: string } };
      router.push(data.idea?.id ? `/ideas/${data.idea.id}` : "/ideas");
    } catch (error) {
      console.error("Failed to submit idea:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.title &&
    formData.problem &&
    formData.solution &&
    formData.stage &&
    formData.lookingFor.length > 0;

  return (
    <AuthGuard>
      <div className="container py-8 md:py-10">
        {/* Back button */}
        <Link href="/ideas">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-8 md:p-10">
          <LuxuryBadge color="blue">{tIdeas("postIdea")}</LuxuryBadge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Share Your Startup Idea
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find collaborators, co-founders, and team members for your project
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="space-y-6">
            {/* Basic Info */}
            <GlassCard glowColor="blue">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Idea Overview
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Decentralized Freelance Platform"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage">
                      Current Stage <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, stage: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select current stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stageOptions.map((option) => (
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

            {/* Problem & Solution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Problem & Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problem" className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-500" />
                    The Problem <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="problem"
                    name="problem"
                    placeholder="What problem are you solving? Who experiences this pain?"
                    rows={4}
                    value={formData.problem}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solution" className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-green-500" />
                    Your Solution <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="solution"
                    name="solution"
                    placeholder="How does your solution solve the problem? What makes it unique?"
                    rows={4}
                    value={formData.solution}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Looking For */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Who You&apos;re Looking For <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((role) => (
                    <Badge
                      key={role}
                      variant={formData.lookingFor.includes(role) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1 px-3"
                      onClick={() => toggleRole(role)}
                    >
                      {formData.lookingFor.includes(role) && (
                        <Plus className="h-3 w-3 mr-1 rotate-45" />
                      )}
                      {role}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom role..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomRole();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCustomRole} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.lookingFor.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.lookingFor
                      .filter((r) => !roleOptions.includes(r))
                      .map((role) => (
                        <Badge key={role} variant="secondary" className="gap-1">
                          {role}
                          <button
                            type="button"
                            onClick={() => removeRole(role)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills Needed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.skillsNeeded.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1 px-3"
                      onClick={() => toggleSkill(skill)}
                    >
                      {formData.skillsNeeded.includes(skill) && (
                        <Plus className="h-3 w-3 mr-1 rotate-45" />
                      )}
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCustomSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.skillsNeeded.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.skillsNeeded
                      .filter((s) => !skillOptions.includes(s))
                      .map((skill) => (
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
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/ideas">
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
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Post Idea
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
