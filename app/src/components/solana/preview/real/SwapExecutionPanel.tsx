"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "@/components/solana/preview/PreviewFrame";
import { usePreviewRpc } from "@/components/solana/preview/PreviewRpcProvider";
import { usePreviewWallet } from "@/components/solana/preview/PreviewWalletProvider";
import { ArrowRightLeft, Route, Wallet } from "lucide-react";

interface SwapExecutionPanelProps {
  fromToken?: string;
  toToken?: string;
  amount?: number;
  slippageBps?: number;
}

export function SwapExecutionPanel({
  fromToken = "SOL",
  toToken = "USDC",
  amount = 1.25,
  slippageBps = 50,
}: SwapExecutionPanelProps) {
  const wallet = usePreviewWallet();
  const rpc = usePreviewRpc();
  const priceImpact = rpc.mode === "devnet" ? "0.42%" : "0.18%";
  const routeLabel = rpc.mode === "devnet" ? "Live route estimate" : "Fixture route estimate";
  const expectedReceive = (amount * (fromToken === "SOL" && toToken === "USDC" ? 146.2 : 1.04)).toFixed(2);

  return (
    <PreviewFrame
      icon={<ArrowRightLeft className="h-4 w-4" />}
      title="SwapExecutionPanel"
      subtitle={`${rpc.endpointLabel} · ${wallet.connected ? "Wallet ready" : "Wallet optional"}`}
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="rounded-[1rem] border border-border/60 bg-muted/20 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Pay
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">{fromToken}</span>
              <span className="font-mono text-sm text-foreground">{amount}</span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="rounded-[1rem] border border-border/60 bg-muted/20 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Receive
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">{toToken}</span>
              <span className="font-mono text-sm text-foreground">~{expectedReceive}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[1rem] border border-border/60 bg-muted/15 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Route className="h-4 w-4 text-muted-foreground" />
            <span>Route preview</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {`${routeLabel}: Jupiter -> Orca -> Token account settle.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="marketplace-pill px-2.5 py-1">Slippage {slippageBps} bps</span>
            <span className="marketplace-pill px-2.5 py-1">Price impact {priceImpact}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[1rem] border border-border/60 bg-muted/15 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            <span>{wallet.connected ? "Ready for signature" : "Connect wallet to sign"}</span>
          </div>
          <Button type="button" size="sm">
            Review Swap
          </Button>
        </div>
      </div>
    </PreviewFrame>
  );
}
