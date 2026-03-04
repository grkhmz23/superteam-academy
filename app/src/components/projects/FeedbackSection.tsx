"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "./RatingStars";
import { Star, Send, Loader2 } from "lucide-react";

export interface Feedback {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface FeedbackSectionProps {
  feedbacks: Feedback[];
  onSubmit?: (feedback: { rating: number; comment: string }) => Promise<void>;
  canSubmit?: boolean;
}

export function FeedbackSection({
  feedbacks,
  onSubmit,
  canSubmit = true,
}: FeedbackSectionProps) {
  const t = useTranslations("common");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({ rating, comment });
      setRating(0);
      setComment("");
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="flex-1">
              {canSubmit && !showForm && (
                <Button onClick={() => setShowForm(true)} variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      {showForm && canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <RatingStars rating={rating} onRate={setRating} size="lg" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Comment</label>
                <Textarea
                  placeholder="Share your thoughts about this project..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={rating === 0 || !comment.trim() || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{feedback.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{feedback.author.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <RatingStars rating={feedback.rating} readonly size="sm" />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feedback.createdAt}
                    </span>
                  </div>
                  <p className="mt-3 text-muted-foreground">{feedback.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {feedbacks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet</p>
              {canSubmit && (
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to review this project
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
