"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, LuxuryBadge } from "@/components/luxury/primitives";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2, ArrowLeft, UserPlus, DollarSign, Clock } from "lucide-react";
import Link from "next/link";

interface MentorFormData {
  bio: string;
  expertise: string[];
  hourlyRate: string;
  currency: string;
  languages: string[];
  achievements: string;
}

const expertiseOptions = [
  "Rust",
  "Anchor",
  "Solana",
  "DeFi",
  "NFT",
  "Gaming",
  "Security",
  "Frontend",
  "React",
  "TypeScript",
  "Web3.js",
  "Metaplex",
];

const languageOptions = ["English", "Spanish", "Portuguese", "Chinese", "Japanese", "Korean", "Russian", "German", "French"];

export default function BecomeMentorPage() {
  const t = useTranslations("common");
  const tMentors = useTranslations("mentors");
  const router = useRouter();

  const [formData, setFormData] = useState<MentorFormData>({
    bio: "",
    expertise: [],
    hourlyRate: "",
    currency: "USDC",
    languages: [],
    achievements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpertise = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...prev.expertise, expertise],
    }));
  };

  const toggleLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const availability = {
        monday: [{ start: "09:00", end: "17:00" }],
        tuesday: [{ start: "09:00", end: "17:00" }],
        wednesday: [{ start: "09:00", end: "17:00" }],
        thursday: [{ start: "09:00", end: "17:00" }],
        friday: [{ start: "09:00", end: "17:00" }],
      };
      const composedBio = [
        formData.bio,
        formData.achievements ? `Achievements: ${formData.achievements}` : "",
        formData.languages.length > 0 ? `Languages: ${formData.languages.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: composedBio,
          expertise: formData.expertise,
          hourlyRate: Number.parseInt(formData.hourlyRate, 10),
          availability,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to create mentor profile (${res.status})`);
      }
      router.push("/mentors");
    } catch (error) {
      console.error("Failed to submit application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.bio &&
    formData.expertise.length > 0 &&
    formData.hourlyRate &&
    formData.languages.length > 0;

  return (
    <AuthGuard>
      <div className="container py-8 md:py-10">
        {/* Back button */}
        <Link href="/mentors">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-8 md:p-10">
          <LuxuryBadge color="amber">{tMentors("becomeMentor")}</LuxuryBadge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Become a Mentor
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share your expertise and help others grow in the Solana ecosystem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="space-y-6">
            {/* Bio */}
            <GlassCard glowColor="amber">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Your Profile
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">
                      Bio <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself, your experience, and what you can help others with..."
                      rows={5}
                      value={formData.bio}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievements">Key Achievements</Label>
                    <Textarea
                      id="achievements"
                      name="achievements"
                      placeholder="List your major achievements, projects you've worked on, or notable contributions..."
                      rows={3}
                      value={formData.achievements}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Areas of Expertise <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {expertiseOptions.map((expertise) => (
                    <Badge
                      key={expertise}
                      variant={formData.expertise.includes(expertise) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1 px-3"
                      onClick={() => toggleExpertise(expertise)}
                    >
                      {formData.expertise.includes(expertise) && (
                        <Plus className="h-3 w-3 mr-1 rotate-45" />
                      )}
                      {expertise}
                    </Badge>
                  ))}
                </div>
                {formData.expertise.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Select at least one area of expertise
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Hourly Rate <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Rate</Label>
                    <Input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      min="1"
                      placeholder="e.g., 100"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="USDC">USDC</option>
                      <option value="SOL">SOL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Languages <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((language) => (
                    <Badge
                      key={language}
                      variant={formData.languages.includes(language) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1 px-3"
                      onClick={() => toggleLanguage(language)}
                    >
                      {formData.languages.includes(language) && (
                        <Plus className="h-3 w-3 mr-1 rotate-45" />
                      )}
                      {language}
                    </Badge>
                  ))}
                </div>
                {formData.languages.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Select at least one language you can mentor in
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/mentors">
                <Button variant="outline" type="button">
                  {t("cancel")}
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                variant="solana"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Apply to Become Mentor
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
