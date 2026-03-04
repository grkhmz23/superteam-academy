"use client";

import { ProjectCard, type Project } from "./ProjectCard";

interface ProjectGalleryProps {
  projects: Project[];
  onLike?: (projectId: string) => void;
  likedProjects?: string[];
  columns?: 2 | 3 | 4;
}

export function ProjectGallery({
  projects,
  onLike,
  likedProjects = [],
  columns = 3,
}: ProjectGalleryProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onLike={onLike}
          isLiked={likedProjects.includes(project.id)}
        />
      ))}
    </div>
  );
}
