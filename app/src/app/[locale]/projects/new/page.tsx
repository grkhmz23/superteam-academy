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
import { X, Plus, Loader2, Upload, ArrowLeft, Github, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProjectFormData {
  title: string;
  description: string;
  fullDescription: string;
  tags: string[];
  demoUrl: string;
  repoUrl: string;
}

export default function NewProjectPage() {
  const t = useTranslations("common");
  const tProjects = useTranslations("projects");
  const router = useRouter();

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    fullDescription: "",
    tags: [],
    demoUrl: "",
    repoUrl: "",
  });

  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const uploadedUrls: string[] = [];
      for (const image of images) {
        const uploadForm = new FormData();
        uploadForm.append("file", image);
        const uploadRes = await fetch("/api/uploads/project-image", {
          method: "POST",
          body: uploadForm,
        });
        if (!uploadRes.ok) {
          continue;
        }
        const uploadData = (await uploadRes.json()) as {
          image?: {
            url: string;
          };
        };
        if (uploadData.image?.url) {
          uploadedUrls.push(uploadData.image.url);
        }
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.fullDescription || formData.description,
          tags: formData.tags,
          thumbnail: uploadedUrls[0],
          demoUrl: formData.demoUrl || undefined,
          githubUrl: formData.repoUrl || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to submit project (${res.status})`);
      }
      const data = (await res.json()) as { project?: { id: string } };
      router.push(data.project?.id ? `/projects/${data.project.id}` : "/projects");
    } catch (error) {
      console.error("Failed to submit project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.title && formData.description && formData.tags.length > 0;

  return (
    <AuthGuard>
      <div className="container py-8 md:py-10">
        {/* Back button */}
        <Link href="/projects">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-8 md:p-10">
          <LuxuryBadge color="purple">{tProjects("submitProject")}</LuxuryBadge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Submit Your Project
          </h1>
          <p className="mt-2 text-muted-foreground">
            Share your work with the Solana developer community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="space-y-6">
            {/* Basic Info */}
            <GlassCard glowColor="purple">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Project Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Project Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Solana DeFi Dashboard"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Short Description <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Brief summary of your project (shown in cards)"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullDescription">Full Description</Label>
                    <Textarea
                      id="fullDescription"
                      name="fullDescription"
                      placeholder="Detailed description of your project, features, and what makes it unique..."
                      rows={6}
                      value={formData.fullDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Tags <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add a tag (e.g., DeFi, NFT, Gaming)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {formData.tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add at least one tag to help others find your project
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="demoUrl" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Live Demo URL
                  </Label>
                  <Input
                    id="demoUrl"
                    name="demoUrl"
                    type="url"
                    placeholder="https://your-demo.com"
                    value={formData.demoUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repoUrl" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    Repository URL
                  </Label>
                  <Input
                    id="repoUrl"
                    name="repoUrl"
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={formData.repoUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop images here, or click to browse
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="image-upload"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      Select Images
                    </Button>
                  </div>
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg border overflow-hidden">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/projects">
                <Button variant="outline" type="button">
                  {t("cancel")}
                </Button>
              </Link>
              <Button type="submit" disabled={!isFormValid || isSubmitting} variant="solana">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Project
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
