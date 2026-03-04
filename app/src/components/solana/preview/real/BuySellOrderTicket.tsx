"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "@/components/solana/preview/PreviewFrame";
import { usePreviewRpc } from "@/components/solana/preview/PreviewRpcProvider";
import { usePreviewWallet } from "@/components/solana/preview/PreviewWalletProvider";
import { BadgeDollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface BuySellOrderTicketProps {
  isBuy?: boolean;
  baseAsset?: string;
  quoteAsset?: string;
  quantity?: number;
  limitPrice?: number;
}

export function BuySellOrderTicket({
  isBuy = true,
  baseAsset = "SOL",
  quoteAsset = "USDC",
  quantity = 0.75,
  limitPrice = 148.25,
}: BuySellOrderTicketProps) {
  const wallet = usePreviewWallet();
  const rpc = usePreviewRpc();
  const Icon = isBuy ? TrendingUp : TrendingDown;
  const sideLabel = isBuy ? "Buy" : "Sell";
  const notional = (quantity * limitPrice).toFixed(2);

  return (
    <PreviewFrame
      icon={<BadgeDollarSign className="h-4 w-4" />}
      title="BuySellOrderTicket"
      subtitle={`${rpc.endpointLabel} · ${sideLabel} ${baseAsset}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-[1rem] border border-border/60 bg-muted/20 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{sideLabel}</span>
          </div>
          <span className="marketplace-pill px-2.5 py-1">
            {baseAsset}/{quoteAsset}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1rem] border border-border/60 bg-muted/15 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Size
            </p>
            <p className="mt-2 font-mono text-sm text-foreground">{quantity}</p>
          </div>
          <div className="rounded-[1rem] border border-border/60 bg-muted/15 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Limit price
            </p>
            <p className="mt-2 font-mono text-sm text-foreground">{limitPrice}</p>
          </div>
        </div>

        <div className="rounded-[1rem] border border-border/60 bg-muted/15 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Execution mode
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="marketplace-pill px-2.5 py-1">
              {wallet.connected ? "Signed submit" : "Preview only"}
            </span>
            <span className="marketplace-pill px-2.5 py-1">Notional {notional}</span>
            <span className="marketplace-pill px-2.5 py-1">
              {rpc.mode === "devnet" ? "Live market context" : "Mock market context"}
            </span>
          </div>
        </div>

        <Button type="button" className="w-full">
          Confirm {sideLabel}
        </Button>
      </div>
    </PreviewFrame>
  );
}
