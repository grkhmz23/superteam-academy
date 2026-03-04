"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { HubComponent } from "@/lib/component-hub/types";
import { Link } from "@/lib/i18n/navigation";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { ComponentErrorBoundary } from "@/components/solana/ComponentErrorBoundary";
import { getInitialPreviewValues } from "@/components/solana/ComponentPreviewRuntime";
import { PreviewRpcProvider } from "@/components/solana/preview/PreviewRpcProvider";
import { PreviewWalletProvider } from "@/components/solana/preview/PreviewWalletProvider";
import {
  ArrowUpRight,
  BarChart3,
  Coins,
  FileCode,
  Image,
  Shield,
  Sparkles,
  Wrench,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons = {
  wallet: Wrench,
  tokens: Coins,
  swap: ArrowRightLeft,
  nfts: Image,
  "dev-tools": Wrench,
  analytics: BarChart3,
} as const;

interface ComponentCardProps {
  component: HubComponent;
  className?: string;
}

interface ComponentCardPreviewProps {
  component: HubComponent;
  errorTitle: string;
  errorDescription: string;
  resetLabel: string;
}

function ComponentCardPreview({
  component,
  errorTitle,
  errorDescription,
  resetLabel,
}: ComponentCardPreviewProps) {
  if (!component.preview) {
    return null;
  }

  const PreviewComponent = component.preview.render;
  const previewValues = getInitialPreviewValues(component);
  const walletMode = component.preview.environment?.wallet ? "connected-mock" : "disconnected";

  return (
    <div
      data-testid={`component-card-preview-${component.id}`}
      className="component-card-preview overflow-hidden rounded-[1.35rem] border border-border/70 bg-muted/20 p-3"
    >
      <PreviewWalletProvider mode={walletMode}>
        <PreviewRpcProvider mode="mock" refreshToken={0}>
          <ComponentErrorBoundary
            title={errorTitle}
            description={errorDescription}
            resetLabel={resetLabel}
            onReset={() => undefined}
          >
            <div className="max-h-60 overflow-hidden">
              <PreviewComponent values={previewValues} />
            </div>
          </ComponentErrorBoundary>
        </PreviewRpcProvider>
      </PreviewWalletProvider>
    </div>
  );
}

export function ComponentCard({ component, className }: ComponentCardProps) {
  const t = useTranslations("components");
  const Icon = categoryIcons[component.category];
  const categoryLabel = t(`categories.${component.category}`);
  const codeTeaser = component.preview?.snippet || component.files[0]?.path;

  return (
    <MarketplaceCard accent interactive className={cn("marketplace-card-shell h-full px-5 py-5", className)}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              href={`/components/${component.id}`}
              data-testid={`component-card-link-${component.id}`}
              className="flex min-w-0 items-start gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/35 text-foreground shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <h3 className="line-clamp-2 text-base font-semibold text-foreground">{component.name}</h3>
                <p className="line-clamp-1 text-sm text-muted-foreground">{categoryLabel}</p>
              </div>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {component.isNew ? (
              <span className="marketplace-pill border-border bg-card px-2.5 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>{t("badges.new")}</span>
              </span>
            ) : null}
            {component.isFeatured ? (
              <span className="marketplace-pill px-2.5 py-1">
                <Sparkles className="h-3 w-3" />
                <span>{t("badges.featured")}</span>
              </span>
            ) : null}
          </div>
        </div>

        {component.preview ? (
          <ComponentCardPreview
            component={component}
            errorTitle={t("previewState.unavailable")}
            errorDescription={t("previewState.errorSubtitle")}
            resetLabel={t("actions.resetPreview")}
          />
        ) : null}

        {codeTeaser ? (
          <div
            data-testid={`component-card-code-snippet-${component.id}`}
            className="component-card-code-snippet rounded-[1.1rem] border border-border/60 bg-background/80 px-3 py-2"
          >
            <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <FileCode className="h-3 w-3" />
              <span>{t("sections.code")}</span>
            </div>
            <code className="block line-clamp-2 break-all font-mono text-xs text-foreground">{codeTeaser}</code>
          </div>
        ) : null}

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{component.description}</p>

        <div className="marketplace-meta-row">
          {component.dependencies.slice(0, 3).map((dependency) => (
            <span key={dependency.name} className="marketplace-pill px-2.5 py-1">
              {dependency.name.split("/").pop()}
            </span>
          ))}
          <span className="marketplace-pill px-2.5 py-1">
            <FileCode className="h-3 w-3" />
            <span>{component.files.length}</span>
          </span>
          <span className="marketplace-pill px-2.5 py-1">
            <Shield className="h-3 w-3" />
            <span>{component.permissions.length}</span>
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{component.examples.length} {t("sections.examples")}</span>
            <span>{component.props.length} {t("sections.props")}</span>
          </div>
          <Link
            href={`/components/${component.id}`}
            aria-label={t("actions.viewDetails")}
            className="marketplace-pill border-border bg-card px-2.5 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </MarketplaceCard>
  );
}
