"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { HubComponent } from "@/lib/component-hub/types";
import { getComponentById } from "@/lib/component-hub/registry";
import { Button } from "@/components/ui/button";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import { Separator } from "@/components/ui/separator";
import {
  ComponentPreviewRuntime,
  getInitialPreviewValues,
} from "@/components/solana/ComponentPreviewRuntime";
import {
  ArrowLeft,
  Copy,
  FileCode,
  Package,
  Play,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ComponentDetailProps {
  component?: HubComponent;
  componentId?: string;
  backHref?: string;
  onBack?: () => void;
}

export function ComponentDetail({
  component: providedComponent,
  componentId,
  backHref = "/components",
  onBack,
}: ComponentDetailProps) {
  const t = useTranslations("components");
  const tc = useTranslations("common");
  const component = providedComponent ?? (componentId ? getComponentById(componentId) : undefined);
  const resolvedComponent = component ?? null;

  if (!resolvedComponent) {
    return null;
  }

  return (
    <ResolvedComponentDetail
      component={resolvedComponent}
      backHref={backHref}
      onBack={onBack}
      t={t}
      tc={tc}
    />
  );
}

interface ResolvedComponentDetailProps {
  component: HubComponent;
  backHref: string;
  onBack?: () => void;
  t: ReturnType<typeof useTranslations<"components">>;
  tc: ReturnType<typeof useTranslations<"common">>;
}

function ResolvedComponentDetail({
  component: resolvedComponent,
  backHref,
  onBack,
  t,
  tc,
}: ResolvedComponentDetailProps) {

  const [selectedFile, setSelectedFile] = useState(resolvedComponent.files[0]?.path ?? "");
  const [activeExampleName, setActiveExampleName] = useState("");
  const [activeProps, setActiveProps] = useState<Record<string, unknown>>(() =>
    getInitialPreviewValues(resolvedComponent)
  );

  const selectedFileContent = useMemo(
    () => resolvedComponent.files.find((file) => file.path === selectedFile)?.content ?? "",
    [resolvedComponent.files, selectedFile]
  );

  const installCommand =
    resolvedComponent.installCommand || `superteam-academy add ${resolvedComponent.id}`;
  const categoryLabel = t(`categories.${resolvedComponent.category}`);
  const activePreviewValueCount = Object.keys(activeProps).filter(
    (key) => !key.startsWith("__")
  ).length;

  const copyCode = async () => {
    await navigator.clipboard.writeText(selectedFileContent);
    toast.success(t("copied"));
  };

  const copyInstallCommand = async () => {
    await navigator.clipboard.writeText(installCommand);
    toast.success(t("copied"));
  };

  const applyExample = (exampleName: string, exampleProps?: Record<string, unknown>) => {
    setActiveExampleName(exampleName);
    setActiveProps(getInitialPreviewValues(resolvedComponent, exampleProps));

    if (resolvedComponent.files.length > 0) {
      setSelectedFile(resolvedComponent.files[0].path);
    }
  };

  const backAction = onBack ? (
    <Button variant="outline" size="sm" onClick={onBack}>
      <ArrowLeft className="h-4 w-4" />
      {t("actions.backToCatalog")}
    </Button>
  ) : (
    <Button asChild variant="outline" size="sm">
      <Link href={backHref} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("actions.backToCatalog")}
      </Link>
    </Button>
  );

  return (
    <PageShell
      hero={
        <PageHeader
          badge={{
            variant: "category",
            icon: Package,
            label: categoryLabel,
          }}
          icon={<Sparkles className="h-5 w-5" />}
          title={resolvedComponent.name}
          description={resolvedComponent.description}
          actions={
            <>
              {backAction}
              <Button variant="outline" size="sm" onClick={copyInstallCommand}>
                <Copy className="h-4 w-4" />
                {t("actions.copyInstall")}
              </Button>
            </>
          }
          illustration={
            <div className="grid w-full gap-3 sm:grid-cols-2">
              <MarketplaceCard className="academy-pop-in rounded-[1.35rem] px-4 py-4">
                <div className="brand-pill w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {t("sections.install")}
                </div>
                <code className="mt-3 block truncate text-sm font-medium text-foreground">{installCommand}</code>
              </MarketplaceCard>
              <MarketplaceCard className="academy-pop-in rounded-[1.35rem] px-4 py-4 [animation-delay:90ms]">
                <div className="brand-pill w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {t("sections.notes")}
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {resolvedComponent.productionNotes.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{resolvedComponent.examples.length}</p>
              </MarketplaceCard>
            </div>
          }
        />
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_22rem]">
        <div className="space-y-6">
          <MarketplaceCard className="rounded-[1.6rem] px-6 py-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="marketplace-pill px-2.5 py-1">{categoryLabel}</span>
              {resolvedComponent.isFeatured ? (
                <span className="marketplace-pill px-2.5 py-1">{t("badges.featured")}</span>
              ) : null}
              {resolvedComponent.isNew ? (
                <span className="marketplace-pill px-2.5 py-1">{t("badges.new")}</span>
              ) : null}
              <span className="marketplace-pill px-2.5 py-1">{resolvedComponent.files.length}</span>
              <span className="marketplace-pill px-2.5 py-1">{resolvedComponent.dependencies.length}</span>
            </div>
            {resolvedComponent.longDescription ? (
              <div className="lesson-prose mt-5">
                <p>{resolvedComponent.longDescription}</p>
              </div>
            ) : null}
          </MarketplaceCard>

          <MarketplaceCard
            data-testid="components-detail-workbench"
            className="rounded-[1.6rem] px-6 py-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("sections.workbench")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeExampleName
                    ? `${t("previewState.examplePresetReady")}: ${activeExampleName}`
                    : t("previewState.propsHint")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="marketplace-pill px-2.5 py-1">
                  {resolvedComponent.files.length} {t("sections.code")}
                </span>
                <span className="marketplace-pill px-2.5 py-1">
                  {resolvedComponent.examples.length} {t("sections.examples")}
                </span>
                <span className="marketplace-pill px-2.5 py-1">
                  {activePreviewValueCount} {t("sections.props")}
                </span>
              </div>
            </div>
          </MarketplaceCard>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div data-testid="components-detail-preview-tab" className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">{t("sections.preview")}</h2>
                <span className="marketplace-pill px-2.5 py-1">{resolvedComponent.name}</span>
              </div>
              <ComponentPreviewRuntime
                component={resolvedComponent}
                values={activeProps}
                onValuesChange={(nextValues) => setActiveProps(nextValues)}
              />
            </div>

            <MarketplaceCard
              data-testid="components-detail-code-panel"
              className="rounded-[1.6rem] px-6 py-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="marketplace-pill px-2.5 py-1">
                    {resolvedComponent.files.length} files
                  </span>
                  <span className="marketplace-pill px-2.5 py-1">
                    {resolvedComponent.dependencies.length} deps
                  </span>
                  {activeExampleName ? (
                    <span className="marketplace-pill border-border bg-card px-2.5 py-1 shadow-sm">
                      {activeExampleName}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{t("sections.code")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile || resolvedComponent.files[0]?.path}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                    {tc("copy")}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {resolvedComponent.files.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelectedFile(file.path)}
                      className={
                        selectedFile === file.path
                          ? "brand-pill border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          : "brand-pill border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      }
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      <span>{file.path}</span>
                    </button>
                  ))}
                </div>
                <div className="lesson-code-panel academy-scrollbar overflow-auto p-5">
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">
                    <code>{selectedFileContent}</code>
                  </pre>
                </div>
              </div>
            </MarketplaceCard>
          </div>

          {resolvedComponent.examples.length > 0 ? (
            <MarketplaceCard className="rounded-[1.6rem] px-6 py-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">{t("sections.examples")}</h2>
                <span className="marketplace-pill px-2.5 py-1">{resolvedComponent.examples.length}</span>
              </div>
              <div className="space-y-4">
                {resolvedComponent.examples.map((example) => (
                  <div
                    key={`${resolvedComponent.id}-${example.name}`}
                    className={
                      activeExampleName === example.name
                        ? "rounded-[1.35rem] border border-border bg-card p-4 shadow-sm"
                        : "rounded-[1.35rem] border border-border/70 bg-muted/20 p-4"
                    }
                  >
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{example.name}</h3>
                        <p className="text-xs text-muted-foreground">{example.description}</p>
                      </div>
                      <Button
                        variant={activeExampleName === example.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => applyExample(example.name, example.props)}
                      >
                        <Play className="h-4 w-4" />
                        {t("actions.useExample")}
                      </Button>
                    </div>
                    <div className="lesson-code-panel academy-scrollbar overflow-auto p-4">
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </MarketplaceCard>
          ) : null}

          {resolvedComponent.productionNotes.length > 0 ? (
            <MarketplaceCard className="rounded-[1.6rem] px-6 py-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">{t("sections.notes")}</h2>
                <span className="marketplace-pill px-2.5 py-1">
                  {resolvedComponent.productionNotes.length}
                </span>
              </div>
              <div className="space-y-3">
                {resolvedComponent.productionNotes.map((note) => (
                  <div
                    key={`${resolvedComponent.id}-${note.title}`}
                    className="rounded-[1.35rem] border border-border/70 bg-muted/25 p-4"
                  >
                    <h3 className="text-sm font-medium text-foreground">{note.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.content}</p>
                  </div>
                ))}
              </div>
            </MarketplaceCard>
          ) : null}
        </div>

        <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <MarketplaceCard data-testid="components-detail-install-panel" className="rounded-[1.6rem] px-5 py-5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">{t("sections.install")}</h2>
            </div>

            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t("sections.install")}
                </p>
                <div className="lesson-code-panel flex items-center gap-2 px-4 py-3">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground md:text-sm">
                    {installCommand}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyInstallCommand}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t("dependencies")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {resolvedComponent.dependencies.map((dependency) => (
                    <span key={dependency.name} className="marketplace-pill px-2.5 py-1">
                      {dependency.name}@{dependency.version}
                    </span>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t("requiredPermissions")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {resolvedComponent.permissions.length > 0 ? (
                    resolvedComponent.permissions.map((permission) => (
                      <span
                        key={`${resolvedComponent.id}-${permission.type}`}
                        className={
                          permission.required
                            ? "marketplace-pill border-border bg-card px-2.5 py-1 shadow-sm"
                            : "marketplace-pill px-2.5 py-1 text-muted-foreground"
                        }
                      >
                        {permission.type}
                        {permission.required ? " *" : ""}
                      </span>
                    ))
                  ) : (
                    <span className="marketplace-pill px-2.5 py-1">0</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t("sections.props")}
                </p>
                {resolvedComponent.props.length > 0 ? (
                  <div className="space-y-2">
                    {resolvedComponent.props.map((prop) => (
                      <div
                        key={`${resolvedComponent.id}-${prop.name}`}
                        className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-foreground">
                            {prop.name}
                            {prop.required ? " *" : ""}
                          </span>
                          <code className="rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[11px] text-foreground">
                            {prop.type}
                          </code>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{prop.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <PremiumEmptyState
                    icon={Package}
                    title={t("noPropsAvailable")}
                    description={t("previewState.propsHint")}
                    className="border-0 bg-transparent px-0 py-0 shadow-none"
                  />
                )}
              </div>

              <Separator />
            </div>
          </MarketplaceCard>
        </div>
      </div>
    </PageShell>
  );
}
