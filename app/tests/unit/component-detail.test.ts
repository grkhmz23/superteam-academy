// @vitest-environment jsdom

import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ComponentDetail } from "@/components/solana/ComponentDetail";

const messages = {
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    copy: "Copy",
  },
  components: {
    copied: "Copied!",
    noPropsAvailable: "No props available",
    dependencies: "Dependencies",
    requiredPermissions: "Required Permissions",
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
      useExample: "Use example",
      resetPreview: "Reset preview",
      refreshPreview: "Refresh preview",
      copySnippet: "Copy snippet",
      viewDetails: "View details",
    },
    sections: {
      preview: "Preview",
      code: "Code",
      workbench: "Workbench",
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
      unavailable: "Preview unavailable",
      errorTitle: "Preview crashed",
      errorSubtitle: "Reset the preview and try again.",
      propsHint: "Adjust the preview controls.",
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
      realWalletUnavailable: "Real wallet unavailable in this preview.",
      examplePresetReady: "Preset loaded",
    },
  },
};

function renderDetail(componentId: string) {
  return render(
    React.createElement(
      NextIntlClientProvider as React.ComponentType<
        React.PropsWithChildren<{
          locale: string;
          timeZone: string;
          messages: typeof messages;
        }>
      >,
      { locale: "en", timeZone: "UTC", messages },
      React.createElement(ComponentDetail, {
        componentId,
        onBack: () => undefined,
      })
    )
  );
}

describe("ComponentDetail", () => {
  it("does not render the unavailable open in playground action", () => {
    renderDetail("buy-sell-order-ticket");

    expect(screen.queryByRole("button", { name: "Open in Playground" })).toBeNull();
  });

  it("can transition from an unresolved component to a resolved component without hook order errors", () => {
    const view = renderDetail("missing-component");

    expect(view.container.firstChild).toBeNull();

    expect(() => {
      view.rerender(
        React.createElement(
          NextIntlClientProvider as React.ComponentType<
            React.PropsWithChildren<{
              locale: string;
              timeZone: string;
              messages: typeof messages;
            }>
          >,
          { locale: "en", timeZone: "UTC", messages },
          React.createElement(ComponentDetail, {
            componentId: "buy-sell-order-ticket",
            onBack: () => undefined,
          })
        )
      );
    }).not.toThrow();

    expect(screen.getByTestId("components-detail-workbench")).toBeTruthy();
  });

  it("uses example presets to drive the preview from a client-side component lookup", () => {
    renderDetail("buy-sell-order-ticket");

    expect(screen.getByTestId("components-detail-workbench")).toBeTruthy();
    expect(screen.queryByText(/Preset loaded:/)).toBeNull();

    const exampleButtons = screen.getAllByRole("button", { name: "Use example" });
    fireEvent.click(exampleButtons[1]);

    expect(screen.getByText("Preset loaded: Sell ticket")).toBeTruthy();
    expect(screen.getByText("Confirm Sell")).toBeTruthy();
  });
});
