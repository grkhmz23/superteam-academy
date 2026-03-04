// @vitest-environment jsdom

import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { WalletContext, type WalletContextState } from "@solana/wallet-adapter-react";
import { getComponentById } from "@/lib/component-hub/registry";
import { ComponentPreviewRuntime } from "@/components/solana/ComponentPreviewRuntime";

const messages = {
  common: {
    reset: "Reset",
    error: "Something went wrong",
    loading: "Loading...",
    copy: "Copy",
    connectWallet: "Connect wallet",
  },
  components: {
    actions: {
      copyInstall: "Copy install",
      openInPlayground: "Open in Playground",
      backToCatalog: "Back to catalog",
      resetPreview: "Reset preview",
      refreshPreview: "Refresh preview",
      copySnippet: "Copy snippet",
      viewDetails: "View details",
    },
    sections: {
      preview: "Preview",
      props: "Props",
      examples: "Examples",
      notes: "Notes",
      install: "Install",
      code: "Code",
    },
    empty: {
      title: "No matching components",
      subtitle: "Try another search",
      cta: "Clear filters",
    },
    previewState: {
      walletRequired: "Wallet required",
      walletHint: "Connect a wallet to see this preview.",
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
    },
    copied: "Copied!",
  },
};

function renderRuntime(componentId: string, initialValues?: Record<string, unknown>) {
  const component = getComponentById(componentId);

  if (!component) {
    throw new Error(`Missing component: ${componentId}`);
  }

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
      React.createElement(ComponentPreviewRuntime, { component, initialValues })
    )
  );
}

function renderRuntimeWithWallet(
  componentId: string,
  walletState: WalletContextState,
  initialValues?: Record<string, unknown>
) {
  const component = getComponentById(componentId);

  if (!component) {
    throw new Error(`Missing component: ${componentId}`);
  }

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
      React.createElement(
        WalletContext.Provider,
        { value: walletState },
        React.createElement(ComponentPreviewRuntime, { component, initialValues })
      )
    )
  );
}

describe("ComponentPreviewRuntime", () => {
  it("renders a known preview with default props", () => {
    renderRuntime("pda-visualizer");

    expect(screen.getByTestId("component-preview-runtime")).toBeTruthy();
    expect(screen.getAllByText("Program ID").length).toBeGreaterThan(0);
  });

  it("updates the preview when prop controls change", () => {
    renderRuntime("pda-visualizer");

    const input = document.getElementById("preview-control-defaultProgramId") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "DemoProgram1111111111111111111111111111111" } });

    expect(input.value).toContain("DemoProgram");
    expect(screen.getByText("Derived Address")).toBeTruthy();
  });

  it("renders preview environment metadata and runtime toggles for real previews", () => {
    renderRuntime("token-balance-card");

    expect(screen.getByText(/Preview environment/)).toBeTruthy();
    expect(screen.getByRole("tablist", { name: "Wallet mode" })).toBeTruthy();
    expect(screen.getByRole("tablist", { name: "RPC mode" })).toBeTruthy();
    expect(screen.getByText(/Real component/)).toBeTruthy();
  });

  it("renders the new swap execution preview in the runtime", () => {
    renderRuntime("swap-execution-panel");

    expect(screen.getByText("SwapExecutionPanel")).toBeTruthy();
    expect(screen.getByText(/Route preview/)).toBeTruthy();
  });

  it("renders the new buy and sell order ticket preview in the runtime", () => {
    renderRuntime("buy-sell-order-ticket");

    expect(screen.getByText("BuySellOrderTicket")).toBeTruthy();
    expect(screen.getByText(/Execution mode/)).toBeTruthy();
  });

  it("uses deterministic fixture values when the wallet is mock connected", () => {
    renderRuntime("token-balance-card");

    fireEvent.click(screen.getByRole("tab", { name: "Mock connected" }));

    expect(screen.getByText("USDC")).toBeTruthy();
    expect(screen.getByText("182.50")).toBeTruthy();
  });

  it("uses a real wallet context when connected-real is selected and a provider exists", () => {
    renderRuntimeWithWallet(
      "wallet-connect-button-pro",
      {
        autoConnect: false,
        wallets: [],
        wallet: null,
        publicKey: {
          toBase58: () => "RealWallet11111111111111111111111111111111",
        } as never,
        connecting: false,
        connected: true,
        disconnecting: false,
        select: () => undefined,
        connect: async () => undefined,
        disconnect: async () => undefined,
        sendTransaction: async () => {
          throw new Error("not used");
        },
        signTransaction: undefined,
        signAllTransactions: undefined,
        signMessage: undefined,
        signIn: undefined,
      },
      { __walletMode: "connected-real" }
    );

    expect(screen.getByText(/Real\.\.\.1111/)).toBeTruthy();
    expect(screen.getByText("Live")).toBeTruthy();
    expect(screen.queryByText("Real wallet unavailable in this preview.")).toBeNull();
  });

  it("updates the live preview when switching RPC mode to devnet", async () => {
    renderRuntime("token-balance-card");

    fireEvent.click(screen.getByRole("tab", { name: "Mock connected" }));
    fireEvent.click(screen.getByRole("tab", { name: "Devnet (manual)" }));

    expect(await screen.findByText("96.20")).toBeTruthy();
  });

  it("catches preview errors and shows a reset action", () => {
    renderRuntime("pda-visualizer", { __forceCrash: true });

    expect(screen.getByText("Preview crashed")).toBeTruthy();

    const resetButton = screen.getAllByRole("button", { name: "Reset preview" })[0];
    fireEvent.click(resetButton);

    expect(screen.queryByText("Preview crashed")).toBeNull();
  });
});
