"use client";

import { useTranslations } from "next-intl";
import { Eye, EyeOff, RefreshCw, Save, Share2, Download, Upload, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  bottomCollapsed: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  hasTasks: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleBottom: () => void;
  onResetWorkspace: () => void;
  onLoadTemplate: () => void;
  onOpenTemplateGallery: () => void;
  onOpenGithubImport: () => void;
  onExportZip: () => void;
  onShareSnapshot: () => void;
  onCopyShareLink: () => void;
  runnerStatus?: "connected" | "disconnected";
}

export function StatusBar({
  leftCollapsed,
  rightCollapsed,
  bottomCollapsed,
  saveState,
  hasTasks,
  onToggleLeft,
  onToggleRight,
  onToggleBottom,
  onResetWorkspace,
  onLoadTemplate,
  onOpenTemplateGallery,
  onOpenGithubImport,
  onExportZip,
  onShareSnapshot,
  onCopyShareLink,
  runnerStatus = "disconnected",
}: StatusBarProps) {
  const t = useTranslations("playground");
  const tc = useTranslations("common");
  const chromeGroupClass =
    "flex flex-wrap items-center gap-1 rounded-2xl border border-border/70 bg-muted/30 p-1";
  const saveStateLabel =
    saveState === "saving"
      ? tc("loading")
      : saveState === "saved"
        ? tc("success")
        : saveState === "error"
          ? tc("error")
          : tc("inactive");
  const runnerStateLabel = runnerStatus === "connected" ? tc("active") : tc("inactive");

  const statusChipClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]",
      active
        ? "border-border bg-background text-foreground"
        : "border-border bg-muted/50 text-muted-foreground"
    );

  return (
    <Card className="rounded-[1.35rem] border-border bg-card/95 text-foreground shadow-sm">
      <div className="flex min-h-12 flex-col gap-2 p-2 text-xs xl:flex-row xl:items-center xl:justify-between">
        <div className={chromeGroupClass}>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 gap-1 rounded-xl px-2 text-muted-foreground"
            onClick={onToggleLeft}
          >
            {leftCollapsed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {t("fileExplorerAriaLabel")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 gap-1 rounded-xl px-2 text-muted-foreground"
            onClick={onToggleBottom}
          >
            {bottomCollapsed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {t("terminalPanelAriaLabel")}
          </Button>
          {hasTasks ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1 rounded-xl px-2 text-muted-foreground"
              onClick={onToggleRight}
            >
              {rightCollapsed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {t("taskPanelAriaLabel")}
            </Button>
          ) : null}
        </div>

        <div className="hidden xl:block">
          <Separator orientation="vertical" className="h-8" />
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 xl:justify-end">
          <div className={chromeGroupClass}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1 rounded-xl border-border bg-card px-2 text-xs"
              onClick={onOpenTemplateGallery}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              {t("templates")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1 rounded-xl border-border bg-card px-2 text-xs"
              onClick={onOpenGithubImport}
            >
              <Upload className="h-3.5 w-3.5" />
              {t("import")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1 rounded-xl border-border bg-card px-2 text-xs"
              onClick={onExportZip}
            >
              <Download className="h-3.5 w-3.5" />
              {t("exportZip")}
            </Button>
          </div>

          <div className={chromeGroupClass}>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1 rounded-xl px-2 text-muted-foreground"
              onClick={onShareSnapshot}
            >
              <Share2 className="h-3.5 w-3.5" />
              {t("share")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-xl px-2 text-muted-foreground"
              onClick={onCopyShareLink}
            >
              {t("copyLink")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1 rounded-xl px-2 text-muted-foreground"
              onClick={onLoadTemplate}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("loadTemplate")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 gap-1 rounded-xl px-2 text-xs"
              onClick={onResetWorkspace}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {tc("reset")}
            </Button>
          </div>

          <div className={chromeGroupClass}>
            <span className={statusChipClass(saveState !== "idle")}>
              <Save className="h-3.5 w-3.5" />
              {saveStateLabel}
            </span>
            <span className={statusChipClass(runnerStatus === "connected")}>{runnerStateLabel}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
