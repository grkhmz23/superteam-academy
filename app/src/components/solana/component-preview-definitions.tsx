import React from "react";
import type { ComponentPreviewDefinition } from "@/lib/component-hub/types";
import { PDADerivationVisualizer } from "@/components/solana/preview/real/PDADerivationVisualizer";
import { BuySellOrderTicket } from "@/components/solana/preview/real/BuySellOrderTicket";
import { SwapExecutionPanel } from "@/components/solana/preview/real/SwapExecutionPanel";
import { TokenBalanceCard } from "@/components/solana/preview/real/TokenBalanceCard";
import { TokenTransferForm } from "@/components/solana/preview/real/TokenTransferForm";
import { WalletConnectButtonPro } from "@/components/solana/preview/real/WalletConnectButtonPro";

function readBoolean(values: Record<string, unknown>, key: string, fallback = false) {
  const value = values[key];
  return typeof value === "boolean" ? value : fallback;
}

function readNumber(values: Record<string, unknown>, key: string, fallback = 0) {
  const value = values[key];
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function readText(values: Record<string, unknown>, key: string, fallback = "") {
  const value = values[key];
  return typeof value === "string" ? value : fallback;
}

function maybeThrow(values: Record<string, unknown>) {
  if (values.__forceCrash) {
    throw new Error("Forced preview crash");
  }
}

function withPreviewGuard(
  render: (values: Record<string, unknown>) => React.ReactElement
) {
  return function PreviewRenderer({ values }: { values: Record<string, unknown> }) {
    maybeThrow(values);
    return render(values);
  };
}

export const walletConnectButtonPreviewDefinition: ComponentPreviewDefinition = {
  render: withPreviewGuard((values) => (
    <WalletConnectButtonPro
      showNetworkBadge={readBoolean(values, "showNetworkBadge", true)}
      requireSigning={readBoolean(values, "requireSigning", false)}
    />
  )),
  snippet: '<WalletConnectButtonPro showNetworkBadge requireSigning={false} />',
  previewMode: "real",
  environment: {
    wallet: true,
    rpc: false,
    network: "none",
  },
  controls: [
    { name: "showNetworkBadge", label: "Show network badge", type: "boolean", defaultValue: true },
    { name: "requireSigning", label: "Require signing", type: "boolean", defaultValue: false },
  ],
};

export const tokenBalanceCardPreviewDefinition: ComponentPreviewDefinition = {
  render: withPreviewGuard((values) => (
    <TokenBalanceCard
      showSOL={readBoolean(values, "showSOL", true)}
      refreshInterval={readNumber(values, "refreshInterval", 30000)}
    />
  )),
  snippet: '<TokenBalanceCard showSOL refreshInterval={30000} />',
  previewMode: "real",
  environment: {
    wallet: true,
    rpc: true,
    network: "devnet-optional",
  },
  controls: [
    { name: "showSOL", label: "Show SOL", type: "boolean", defaultValue: true },
    {
      name: "refreshInterval",
      label: "Refresh interval",
      type: "number",
      defaultValue: 30000,
      min: 5000,
      max: 120000,
      step: 5000,
    },
  ],
};

export const tokenTransferFormPreviewDefinition: ComponentPreviewDefinition = {
  render: withPreviewGuard((values) => (
    <TokenTransferForm
      defaultToken={readText(values, "defaultToken", "SOL")}
      maxAmount={readNumber(values, "maxAmount", 5)}
      simulateOnly={readBoolean(values, "simulateOnly", true)}
    />
  )),
  snippet: '<TokenTransferForm defaultToken="SOL" maxAmount={5} simulateOnly />',
  previewMode: "real",
  environment: {
    wallet: true,
    rpc: true,
    network: "devnet-optional",
  },
  controls: [
    { name: "defaultToken", label: "Default token", type: "text", defaultValue: "SOL" },
    { name: "maxAmount", label: "Max amount", type: "number", defaultValue: 5, min: 1, max: 100, step: 1 },
    { name: "simulateOnly", label: "Simulation mode", type: "boolean", defaultValue: true },
  ],
};

export const pdaVisualizerPreviewDefinition: ComponentPreviewDefinition = {
  render: withPreviewGuard((values) => (
    <PDADerivationVisualizer
      defaultProgramId={readText(values, "defaultProgramId", "")}
      defaultSeeds={readText(values, "defaultSeeds", "vault")}
    />
  )),
  snippet: '<PDADerivationVisualizer defaultProgramId="DemoProgram1111" defaultSeeds={["vault"]} />',
  previewMode: "real",
  environment: {
    wallet: false,
    rpc: false,
    network: "none",
  },
  controls: [
    { name: "defaultProgramId", label: "Program ID", type: "text", defaultValue: "" },
    { name: "defaultSeeds", label: "Seed", type: "text", defaultValue: "vault" },
  ],
};

export const swapExecutionPanelPreviewDefinition: ComponentPreviewDefinition = {
  render: withPreviewGuard((values) => (
    <SwapExecutionPanel
      fromToken={readText(values, "fromToken", "SOL")}
      toToken={readText(values, "toToken", "USDC")}
      amount={readNumber(values, "amount", 1.25)}
      slippageBps={readNumber(values, "slippageBps", 50)}
    />
  )),
  snippet:
    '<SwapExecutionPanel fromToken="SOL" toToken="USDC" amount={1.25} slippageBps={50} />',
  previewMode: "real",
  environment: {
    wallet: true,
    rpc: true,
    network: "devnet-optional",
  },
  controls: [
    { name: "fromToken", label: "From token", type: "text", defaultValue: "SOL" },
    { name: "toToken", label: "To token", type: "text", defaultValue: "USDC" },
    { name: "amount", label: "Amount", type: "number", defaultValue: 1.25, min: 0.1, max: 100, step: 0.05 },
    {
      name: "slippageBps",
      label: "Slippage (bps)",
      type: "number",
      defaultValue: 50,
      min: 5,
      max: 300,
      step: 5,
    },
  ],
};

export const buySellOrderTicketPreviewDefinition: ComponentPreviewDefinition = {
  render: withPreviewGuard((values) => (
    <BuySellOrderTicket
      isBuy={readBoolean(values, "isBuy", true)}
      baseAsset={readText(values, "baseAsset", "SOL")}
      quoteAsset={readText(values, "quoteAsset", "USDC")}
      quantity={readNumber(values, "quantity", 0.75)}
      limitPrice={readNumber(values, "limitPrice", 148.25)}
    />
  )),
  snippet:
    '<BuySellOrderTicket isBuy baseAsset="SOL" quoteAsset="USDC" quantity={0.75} limitPrice={148.25} />',
  previewMode: "real",
  environment: {
    wallet: true,
    rpc: true,
    network: "devnet-optional",
  },
  controls: [
    { name: "isBuy", label: "Buy side", type: "boolean", defaultValue: true },
    { name: "baseAsset", label: "Base asset", type: "text", defaultValue: "SOL" },
    { name: "quoteAsset", label: "Quote asset", type: "text", defaultValue: "USDC" },
    { name: "quantity", label: "Quantity", type: "number", defaultValue: 0.75, min: 0.01, max: 50, step: 0.01 },
    {
      name: "limitPrice",
      label: "Limit price",
      type: "number",
      defaultValue: 148.25,
      min: 1,
      max: 10000,
      step: 0.25,
    },
  ],
};
