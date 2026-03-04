import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { ComponentDetail } from "@/components/solana/ComponentDetail";
import type { HubComponent } from "@/lib/component-hub/types";

const componentMessages = {
  copyInstall: "Copy install",
  openInPlayground: "Open in Playground",
  noPropsAvailable: "No props available",
  interactivePreviewSoon: "Interactive preview soon",
  openInPlaygroundForLivePreview: "Open in Playground for live preview",
  copied: "Copied",
  exampleLabel: "Examples",
  installTitle: "Install",
  cliInstall: "CLI install",
  dependencies: "Dependencies",
  requiredPermissions: "Required permissions",
  productionNotes: "Production notes",
  resultsCount: "{count} components",
  categories: {
    wallet: "Wallet",
    tokens: "Tokens",
    swap: "Swap",
    nfts: "NFTs",
    "dev-tools": "Dev Tools",
    analytics: "Analytics",
  },
  badges: {
    featured: "Featured",
    new: "New",
  },
  actions: {
    openInPlayground: "Open in Playground",
    copyInstall: "Copy install",
    backToCatalog: "Back to catalog",
    resetPreview: "Reset preview",
    refreshPreview: "Refresh preview",
    copySnippet: "Copy snippet",
    viewDetails: "View details",
  },
  sections: {
    preview: "Preview",
    code: "Code",
    install: "Install",
    props: "Props",
    examples: "Examples",
    notes: "Notes",
  },
  empty: {
    title: "No matching components",
    subtitle: "Try another search",
    cta: "Clear filters",
  },
  previewState: {
    walletRequired: "Wallet required",
    walletHint: "Connect a wallet to unlock this preview.",
    unavailable: "Preview unavailable",
    errorTitle: "Preview crashed",
    errorSubtitle: "Reset the preview and try again.",
    propsHint: "Adjust the preview controls to inspect the component state.",
    environment: "Preview environment",
    realComponent: "Real component",
    mockComponent: "Mock component",
    walletControl: "Wallet mode",
    rpcControl: "RPC mode",
    walletModeDisconnected: "Disconnected",
    walletModeMock: "Mock connected",
    walletModeReal: "Real wallet",
    rpcModeMock: "Mock RPC",
    rpcModeDevnet: "Devnet (manual)",
    realWalletUnavailable: "A live wallet is not connected, so this preview stays in safe mode.",
  },
};

const commonMessages = {
  back: "Back",
  copy: "Copy",
};

const sampleComponent: HubComponent = {
  id: "sample-component",
  name: "Sample Component",
  category: "wallet",
  description: "A semantic detail page test.",
  files: [
    {
      path: "src/Sample.tsx",
      content: "export function Sample() { return <button>Go</button>; }",
      language: "typescript",
    },
  ],
  dependencies: [{ name: "react", version: "^18.0.0" }],
  props: [
    {
      name: "label",
      type: "string",
      required: false,
      defaultValue: "Go",
      description: "CTA label",
    },
  ],
  examples: [
    {
      name: "Default",
      description: "Basic usage",
      code: "<Sample />",
    },
  ],
  permissions: [{ type: "wallet", required: true, description: "Wallet required" }],
  productionNotes: [
    {
      type: "security",
      title: "Security",
      content: "Validate inputs.",
    },
  ],
  installCommand: "jazzcode add sample-component",
  isNew: true,
  isFeatured: true,
};

function renderComponentDetail() {
  const Provider =
    NextIntlClientProvider as React.ComponentType<
      React.PropsWithChildren<{
        locale: string;
        timeZone: string;
        messages: {
          components: typeof componentMessages;
          common: typeof commonMessages;
        };
      }>
    >;

  return renderToStaticMarkup(
    React.createElement(
      Provider,
      {
        locale: "en",
        timeZone: "UTC",
        messages: {
          components: componentMessages,
          common: commonMessages,
        },
      },
      React.createElement(ComponentDetail, {
        component: sampleComponent,
        onBack: () => undefined,
      })
    )
  );
}

describe("ComponentDetail", () => {
  it("renders semantic theme surfaces for the detail experience", () => {
    const html = renderComponentDetail();

    expect(html).toContain("text-foreground");
    expect(html).toContain("border-border");
    expect(html).toContain("bg-card");
    expect(html).not.toContain("bg-zinc-900");
  });

  it("renders preview and code surfaces together so the component is inspectable without tab switching", () => {
    const html = renderComponentDetail();

    expect(html).toContain("components-detail-preview-tab");
    expect(html).toContain("components-detail-code-panel");
    expect(html).toContain(componentMessages.sections.preview);
    expect(html).toContain(componentMessages.sections.code);
  });
});
