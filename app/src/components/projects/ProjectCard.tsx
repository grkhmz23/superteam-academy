"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { Eye, ExternalLink, Github, Heart, Sparkles } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  likes: number;
  views: number;
  author: {
    name: string;
    avatar?: string;
  };
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  createdAt: string;
}

interface ProjectCardProps {
  project: Project;
  onLike?: (projectId: string) => void;
  isLiked?: boolean;
}

export function ProjectCard({ project, onLike, isLiked = false }: ProjectCardProps) {
  const tCommon = useTranslations("common");
  const tProjects = useTranslations("projects");

  return (
    <MarketplaceCard interactive className="marketplace-card-shell group h-full overflow-hidden">
      <div className="course-cover-surface relative aspect-[16/9] border-b border-border/70">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover opacity-95 transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ExternalLink className="h-12 w-12 text-muted-foreground/35" />
          </div>
        )}
      </div>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{project.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{project.author.name}</span>
            </div>
          </div>
          <Badge variant="outline" className="marketplace-pill shrink-0">
            {project.featured ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {tProjects("featured")}
              </>
            ) : (
              tProjects("newest")
            )}
          </Badge>
        </div>

        <div className="marketplace-meta-row">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="marketplace-pill">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 ? (
            <Badge variant="outline" className="marketplace-pill">
              +{project.tags.length - 3}
            </Badge>
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{project.description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 px-5 pb-5 pt-0">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => onLike?.(project.id)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current text-foreground" : ""}`} />
            {project.likes}
          </button>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {project.views}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {project.repoUrl ? (
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={tProjects("viewCode")}>
                <Github className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
          <Button asChild size="sm" className="rounded-xl">
            <Link href={`/projects/${project.id}`}>{tCommon("learnMore")}</Link>
          </Button>
        </div>
      </CardFooter>
    </MarketplaceCard>
  );
}
