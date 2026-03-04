"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { HubComponent } from "@/lib/component-hub/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import { ComponentErrorBoundary } from "@/components/solana/ComponentErrorBoundary";
import { PreviewRpcProvider, type PreviewRpcMode } from "@/components/solana/preview/PreviewRpcProvider";
import {
  PreviewWalletProvider,
  usePreviewWallet,
  type PreviewWalletMode,
} from "@/components/solana/preview/PreviewWalletProvider";
import {
  SegmentedFilter,
  type SegmentedFilterOption,
} from "@/components/ui/segmented-filter";
import { Copy, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function getDefaultValues(component: HubComponent, overrides?: Record<string, unknown>) {
  const defaults: Record<string, unknown> = {};

  for (const prop of component.props) {
    if (prop.defaultValue !== undefined) {
      defaults[prop.name] = prop.defaultValue;
    }
  }

  for (const control of component.preview?.controls ?? []) {
    if (control.defaultValue !== undefined) {
      defaults[control.name] = control.defaultValue;
    }
  }

  return {
    ...defaults,
    ...overrides,
  };
}

interface ComponentPreviewRuntimeProps {
  component: HubComponent;
  values?: Record<string, unknown>;
  onValuesChange?: (values: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
}

function PreviewWalletStatusNote({ message }: { message: string }) {
  const wallet = usePreviewWallet();

  if (wallet.requestedMode !== "connected-real" || wallet.resolvedMode === "connected-real") {
    return null;
  }

  return <p className="text-xs text-muted-foreground">{message}</p>;
}

export function ComponentPreviewRuntime({
  component,
  values,
  onValuesChange,
  initialValues,
}: ComponentPreviewRuntimeProps) {
  const t = useTranslations("components");
  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(() =>
    getDefaultValues(component, initialValues)
  );
  const [walletMode, setWalletMode] = useState<PreviewWalletMode>(
    (initialValues?.__walletMode as PreviewWalletMode | undefined) ?? "disconnected"
  );
  const [rpcMode, setRpcMode] = useState<PreviewRpcMode>(
    (initialValues?.__rpcMode as PreviewRpcMode | undefined) ?? "mock"
  );
  const [refreshToken, setRefreshToken] = useState(0);
  const [boundaryKey, setBoundaryKey] = useState(0);

  const preview = component.preview;
  const activeValues = values ?? internalValues;
  const setActiveValues = onValuesChange ?? setInternalValues;
  const previewValues = useMemo(
    () => ({
      ...activeValues,
      __walletMode: walletMode,
      __rpcMode: rpcMode,
    }),
    [activeValues, rpcMode, walletMode]
  );
  const walletOptions: SegmentedFilterOption[] = [
    { value: "disconnected", label: t("previewState.walletModeDisconnected") },
    { value: "connected-mock", label: t("previewState.walletModeMock") },
    { value: "connected-real", label: t("previewState.walletModeReal") },
  ];
  const rpcOptions: SegmentedFilterOption[] = [
    { value: "mock", label: t("previewState.rpcModeMock") },
    { value: "devnet", label: t("previewState.rpcModeDevnet") },
  ];

  const updateValue = (name: string, value: unknown) => {
    setActiveValues({
      ...activeValues,
      [name]: value,
    });
  };

  const resetPreview = () => {
    setActiveValues(getDefaultValues(component));
    setWalletMode("disconnected");
    setRpcMode("mock");
    setRefreshToken(0);
    setBoundaryKey((current) => current + 1);
  };

  const refreshPreviewData = () => {
    setRefreshToken((current) => current + 1);
  };

  const copySnippet = async () => {
    if (!preview?.snippet) {
      return;
    }

    await navigator.clipboard.writeText(preview.snippet);
    toast.success(t("copied"));
  };

  if (!preview) {
    return (
      <PremiumEmptyState
        icon={Play}
        title={t("previewState.unavailable")}
        description={t("empty.subtitle")}
      />
    );
  }

  const PreviewComponent = preview.render;
  const environmentParts = [
    preview.previewMode === "real"
      ? t("previewState.realComponent")
      : t("previewState.mockComponent"),
    preview.environment?.rpc
      ? `${t("previewState.rpcControl")}: ${
          rpcMode === "devnet"
            ? t("previewState.rpcModeDevnet")
            : t("previewState.rpcModeMock")
        }`
      : null,
    preview.environment?.wallet
      ? `${t("previewState.walletControl")}: ${
          walletMode === "connected-mock"
            ? t("previewState.walletModeMock")
            : walletMode === "connected-real"
              ? t("previewState.walletModeReal")
              : t("previewState.walletModeDisconnected")
        }`
      : null,
  ].filter(Boolean);

  return (
    <div data-testid="component-preview-runtime" className="space-y-4">
      <MarketplaceCard className="rounded-[1.6rem] px-5 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t("sections.preview")}</h2>
            <p className="text-sm text-muted-foreground">{component.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("previewState.environment")}: {environmentParts.join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {preview.environment?.rpc ? (
              <Button type="button" variant="outline" size="sm" onClick={refreshPreviewData}>
                <RefreshCw className="h-4 w-4" />
                {t("actions.refreshPreview")}
              </Button>
            ) : null}
            {preview.snippet ? (
              <Button type="button" variant="outline" size="sm" onClick={copySnippet}>
                <Copy className="h-4 w-4" />
                {t("actions.copySnippet")}
              </Button>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={resetPreview}>
              <RefreshCw className="h-4 w-4" />
              {t("actions.resetPreview")}
            </Button>
          </div>
        </div>
      </MarketplaceCard>

      <PreviewWalletProvider mode={walletMode}>
        {preview.environment?.wallet || preview.environment?.rpc ? (
          <MarketplaceCard className="rounded-[1.6rem] px-6 py-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {preview.environment?.wallet ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{t("previewState.walletControl")}</p>
                  <SegmentedFilter
                    ariaLabel={t("previewState.walletControl")}
                    value={walletMode}
                    onValueChange={(nextValue) => setWalletMode(nextValue as PreviewWalletMode)}
                    options={walletOptions}
                  />
                  <PreviewWalletStatusNote message={t("previewState.realWalletUnavailable")} />
                </div>
              ) : (
                <div className="hidden lg:block" />
              )}

              {preview.environment?.rpc ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{t("previewState.rpcControl")}</p>
                  <SegmentedFilter
                    ariaLabel={t("previewState.rpcControl")}
                    value={rpcMode}
                    onValueChange={(nextValue) => setRpcMode(nextValue as PreviewRpcMode)}
                    options={rpcOptions}
                  />
                </div>
              ) : null}
            </div>
          </MarketplaceCard>
        ) : null}

        <PreviewRpcProvider mode={rpcMode} refreshToken={refreshToken}>
          <ComponentErrorBoundary
            key={boundaryKey}
            title={t("previewState.errorTitle")}
            description={t("previewState.errorSubtitle")}
            resetLabel={t("actions.resetPreview")}
            onReset={resetPreview}
          >
            <PreviewComponent values={previewValues} />
          </ComponentErrorBoundary>
        </PreviewRpcProvider>
      </PreviewWalletProvider>

      {preview.controls.length > 0 ? (
        <ComponentErrorBoundary
          key={`preview-props-${boundaryKey}`}
          title={t("previewState.errorTitle")}
          description={t("previewState.errorSubtitle")}
          resetLabel={t("actions.resetPreview")}
          onReset={resetPreview}
        >
          <MarketplaceCard className="rounded-[1.6rem] px-5 py-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">{t("sections.props")}</h3>
              <p className="text-sm text-muted-foreground">{t("previewState.propsHint")}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {preview.controls.map((control) => (
                <div key={`${component.id}-${control.name}`} className="space-y-2">
                  <label
                    htmlFor={`preview-control-${control.name}`}
                    className="text-sm font-medium text-foreground"
                  >
                    {control.label}
                  </label>
                  {control.type === "boolean" ? (
                    <button
                      id={`preview-control-${control.name}`}
                      type="button"
                      onClick={() => updateValue(control.name, !Boolean(activeValues[control.name]))}
                      className={
                        Boolean(activeValues[control.name])
                          ? "brand-pill border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          : "brand-pill border-border/60 bg-muted/30 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      }
                    >
                      {String(Boolean(activeValues[control.name]))}
                    </button>
                  ) : control.type === "number" ? (
                    <Input
                      id={`preview-control-${control.name}`}
                      type="number"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={String(activeValues[control.name] ?? control.defaultValue ?? 0)}
                      onChange={(event) => updateValue(control.name, Number(event.target.value))}
                    />
                  ) : (
                    <Input
                      id={`preview-control-${control.name}`}
                      type="text"
                      value={String(activeValues[control.name] ?? control.defaultValue ?? "")}
                      onChange={(event) => updateValue(control.name, event.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </MarketplaceCard>
        </ComponentErrorBoundary>
      ) : null}
    </div>
  );
}

export function getInitialPreviewValues(component: HubComponent, overrides?: Record<string, unknown>) {
  return getDefaultValues(component, overrides);
}
