"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, FolderUp, Github, Upload, FileDown, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { parseZipFile, mergeImportedFiles, sanitizeZipPath, ConflictResolution, ZipImportEntry } from "@/lib/playground/import-zip";
import { WorkspaceFile } from "@/lib/playground/types";
import { cn } from "@/lib/utils";
import { inferLanguageFromPath } from "@/lib/playground/workspace";

interface PlaygroundTopBarProps {
  workspaceName: string;
  workspaceFiles: Record<string, WorkspaceFile>;
  activeFile: string | null;
  onImportFiles: (files: Record<string, WorkspaceFile>) => void;
  onExportZip: () => void;
  onExportCurrentFile: () => void;
  onOpenGithubImport: () => void;
  onResetWorkspace: () => void;
  gitBranch?: string | null;
}

export function PlaygroundTopBar({
  workspaceName,
  workspaceFiles,
  activeFile,
  onImportFiles,
  onExportZip,
  onExportCurrentFile,
  onOpenGithubImport,
  onResetWorkspace,
  gitBranch,
}: PlaygroundTopBarProps) {
  const t = useTranslations("playground");
  const tc = useTranslations("common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [importDropdownOpen, setImportDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [pendingEntries, setPendingEntries] = useState<ZipImportEntry[]>([]);
  const [conflictPaths, setConflictPaths] = useState<string[]>([]);
  const toolbarGroupClass =
    "flex flex-wrap items-center gap-1 rounded-2xl border border-border/70 bg-muted/30 p-1";
  const dropdownPanelClass =
    "absolute left-0 top-full z-50 mt-2 w-48 rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-lg";
  const dropdownItemClass =
    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

  const processFiles = useCallback(
    (entries: ZipImportEntry[]) => {
      const conflicts = entries.filter((e) => Boolean(workspaceFiles[e.path]));
      if (conflicts.length > 0) {
        setPendingEntries(entries);
        setConflictPaths(conflicts.map((c) => c.path));
        setConflictDialogOpen(true);
      } else {
        const now = Date.now();
        const files: Record<string, WorkspaceFile> = {};
        for (const entry of entries) {
          files[entry.path] = {
            path: entry.path,
            language: inferLanguageFromPath(entry.path),
            content: entry.content,
            updatedAt: now,
          };
        }
        onImportFiles(files);
      }
    },
    [workspaceFiles, onImportFiles]
  );

  const handleResolveConflict = useCallback(
    (resolution: ConflictResolution) => {
      const merged = mergeImportedFiles(workspaceFiles, pendingEntries, resolution);
      // Only send the new/changed files
      const diff: Record<string, WorkspaceFile> = {};
      for (const [path, file] of Object.entries(merged)) {
        if (!workspaceFiles[path] || workspaceFiles[path].content !== file.content) {
          diff[path] = file;
        }
      }
      onImportFiles(diff);
      setConflictDialogOpen(false);
      setPendingEntries([]);
      setConflictPaths([]);
    },
    [workspaceFiles, pendingEntries, onImportFiles]
  );

  const handleFileUpload = useCallback(
    async (fileList: FileList) => {
      const entries: ZipImportEntry[] = [];
      const errors: string[] = [];
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.name.endsWith(".zip")) {
          try {
            const buffer = await file.arrayBuffer();
            const result = parseZipFile(buffer);
            entries.push(...result.entries);
            if (result.skipped.length > 0) {
              console.warn(`Skipped ${result.skipped.length} files in ${file.name}:`, result.skipped);
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            errors.push(`Failed to parse ${file.name}: ${message}`);
          }
        } else {
          const sanitized = sanitizeZipPath(file.name);
          if (sanitized) {
            try {
              const content = await file.text();
              entries.push({ path: sanitized, content, sizeBytes: file.size });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unknown error";
              errors.push(`Failed to read ${file.name}: ${message}`);
            }
          } else {
            errors.push(`Invalid file path: ${file.name}`);
          }
        }
      }
      
      if (errors.length > 0) {
        toast.error(`${errors.slice(0, 3).join(" | ")}${errors.length > 3 ? ` | +${errors.length - 3} more` : ""}`);
      }
      
      if (entries.length > 0) {
        processFiles(entries);
      }
    },
    [processFiles]
  );

  const handleFolderUpload = useCallback(
    async (fileList: FileList) => {
      const entries: ZipImportEntry[] = [];
      const errors: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
        const sanitized = sanitizeZipPath(relativePath);
        if (sanitized) {
          try {
            const content = await file.text();
            entries.push({ path: sanitized, content, sizeBytes: file.size });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            errors.push(`Failed to read ${relativePath}: ${message}`);
          }
        } else {
          errors.push(`Invalid file path: ${relativePath}`);
        }
      }

      if (errors.length > 0) {
        toast.error(`${errors.slice(0, 3).join(" | ")}${errors.length > 3 ? ` | +${errors.length - 3} more` : ""}`);
      }

      if (entries.length > 0) {
        processFiles(entries);
      }
    },
    [processFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files.length > 0) {
        void handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  return (
    <>
      <Card
        className={cn(
          "rounded-[1.35rem] border-border bg-card/95 text-foreground shadow-sm",
          dragActive && "border-primary bg-muted/30"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex min-h-14 flex-wrap items-center gap-3 p-2 sm:p-3">
          <div className="min-w-0 flex-1 sm:flex-none">
            <p className="truncate text-sm font-semibold text-foreground">{workspaceName}</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
          </div>

          <Separator orientation="vertical" className="hidden h-8 md:block" />

          <div className={toolbarGroupClass}>
            <div className="relative">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1 rounded-xl border-border bg-card text-xs"
                onClick={() => {
                  setImportDropdownOpen((p) => !p);
                  setExportDropdownOpen(false);
                }}
              >
                <Upload className="h-3.5 w-3.5" />
                {t("import")}
                <ChevronDown className="h-3 w-3" />
              </Button>
              {importDropdownOpen && (
                <div className={dropdownPanelClass}>
                  <button
                    type="button"
                    className={dropdownItemClass}
                    onClick={() => {
                      fileInputRef.current?.click();
                      setImportDropdownOpen(false);
                    }}
                  >
                    <FolderUp className="h-3.5 w-3.5" />
                    {t("uploadFiles")}
                  </button>
                  <button
                    type="button"
                    className={dropdownItemClass}
                    onClick={() => {
                      folderInputRef.current?.click();
                      setImportDropdownOpen(false);
                    }}
                  >
                    <FolderUp className="h-3.5 w-3.5" />
                    {t("uploadFolder")}
                  </button>
                  <button
                    type="button"
                    className={dropdownItemClass}
                    onClick={() => {
                      zipInputRef.current?.click();
                      setImportDropdownOpen(false);
                    }}
                  >
                    <FolderUp className="h-3.5 w-3.5" />
                    {t("importZip")}
                  </button>
                  <button
                    type="button"
                    className={dropdownItemClass}
                    onClick={() => {
                      onOpenGithubImport();
                      setImportDropdownOpen(false);
                    }}
                  >
                    <Github className="h-3.5 w-3.5" />
                    {t("githubImport")}
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1 rounded-xl border-border bg-card text-xs"
                onClick={() => {
                  setExportDropdownOpen((p) => !p);
                  setImportDropdownOpen(false);
                }}
              >
                <Download className="h-3.5 w-3.5" />
                {t("export")}
                <ChevronDown className="h-3 w-3" />
              </Button>
              {exportDropdownOpen && (
                <div className={dropdownPanelClass}>
                  <button
                    type="button"
                    className={dropdownItemClass}
                    onClick={() => {
                      onExportZip();
                      setExportDropdownOpen(false);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t("exportAsZip")}
                  </button>
                  <button
                    type="button"
                    className={dropdownItemClass}
                    onClick={() => {
                      onExportCurrentFile();
                      setExportDropdownOpen(false);
                    }}
                    disabled={!activeFile}
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    {t("exportCurrentFile")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {gitBranch ? (
            <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {gitBranch}
            </span>
          ) : null}

          <div className="flex-1" />

          <div className={toolbarGroupClass}>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-xl px-3 text-xs"
              onClick={onResetWorkspace}
            >
              {tc("reset")}
            </Button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              void handleFileUpload(e.target.files);
            }
            e.target.value = "";
          }}
        />
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              void handleFileUpload(e.target.files);
            }
            e.target.value = "";
          }}
        />
        <input
          ref={(el) => {
            (folderInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            if (el) el.setAttribute("webkitdirectory", "");
          }}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              void handleFolderUpload(e.target.files);
            }
            e.target.value = "";
          }}
        />
      </Card>

      {/* Conflict resolution dialog */}
      <Dialog open={conflictDialogOpen} onOpenChange={(open) => { if (!open) { setConflictDialogOpen(false); setPendingEntries([]); setConflictPaths([]); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("importConflictsTitle")}</DialogTitle>
            <DialogDescription>
              {t("importConflictsDescription", { count: conflictPaths.length })}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-40 overflow-auto rounded-xl border border-border bg-muted/30 p-2 font-mono text-xs text-foreground">
            {conflictPaths.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => handleResolveConflict("skip")}>
              {t("skipAll")}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleResolveConflict("keep_both")}>
              {t("keepBoth")}
            </Button>
            <Button type="button" onClick={() => handleResolveConflict("overwrite")}>
              {t("overwriteAll")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
