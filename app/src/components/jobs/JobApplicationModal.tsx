"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Send, CheckCircle } from "lucide-react";

interface JobApplicationModalProps {
  jobId: string;
  jobTitle: string;
  company: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (application: {
    jobId: string;
    coverLetter: string;
    portfolioUrl?: string;
  }) => Promise<void>;
}

export function JobApplicationModal({
  jobId,
  jobTitle,
  company,
  isOpen,
  onClose,
  onSubmit,
}: JobApplicationModalProps) {
  const t = useTranslations("common");
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          jobId,
          coverLetter,
          portfolioUrl: portfolioUrl || undefined,
        });
      }
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCoverLetter("");
    setPortfolioUrl("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Submit your application to {company}. Include a cover letter to stand out.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Application Submitted!</h3>
            <p className="text-muted-foreground mt-2">
              Good luck with your application.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cover-letter">Cover Letter *</Label>
              <Textarea
                id="cover-letter"
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                {coverLetter.length}/2000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL (optional)</Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://your-portfolio.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting || !coverLetter.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
