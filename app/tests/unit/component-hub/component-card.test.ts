import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { ComponentCard } from "@/components/solana/ComponentCard";
import type { HubComponent } from "@/lib/component-hub/types";

const componentMessages = {
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
  sections: {
    preview: "Preview",
    code: "Code",
    props: "Props",
    examples: "Examples",
  },
  actions: {
    viewDetails: "View details",
    resetPreview: "Reset preview",
  },
  previewState: {
    unavailable: "Preview unavailable",
    errorTitle: "Preview crashed",
    errorSubtitle: "Reset and try again.",
  },
};

const previewableComponent: HubComponent = {
  id: "preview-card",
  name: "Preview Card",
  category: "swap",
  description: "Inline preview should render in the catalog card.",
  files: [
    {
      path: "src/PreviewCard.tsx",
      content: "export function PreviewCard() { return <div>Preview</div>; }",
      language: "typescript",
    },
  ],
  dependencies: [{ name: "react", version: "^18.0.0" }],
  props: [],
  examples: [],
  permissions: [],
  productionNotes: [],
  installCommand: "jazzcode add preview-card",
  preview: {
    render: ({ values }) =>
      React.createElement(
        "div",
        { className: "rounded-xl border border-border/70 bg-card px-3 py-2 text-sm text-foreground" },
        String(values.label ?? "Live")
      ),
    controls: [],
    snippet: "<PreviewCard label=\"Live\" />",
    previewMode: "real",
    environment: {
      wallet: false,
      rpc: false,
      network: "none",
    },
  },
};

function renderComponentCard(component: HubComponent) {
  const Provider =
    NextIntlClientProvider as React.ComponentType<
      React.PropsWithChildren<{
        locale: string;
        timeZone: string;
        messages: {
          components: typeof componentMessages;
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
        },
      },
      React.createElement(ComponentCard, {
        component,
      })
    )
  );
}

describe("ComponentCard", () => {
  it("renders an inline preview and code teaser for preview-capable components", () => {
    const html = renderComponentCard(previewableComponent);

    expect(html).toContain("component-card-preview");
    expect(html).toContain("component-card-code-snippet");
    expect(html).toContain("&lt;PreviewCard label=&quot;Live&quot; /&gt;");
    expect(html).not.toContain("bg-zinc-900");
  });
});
