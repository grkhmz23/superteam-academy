"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "@/components/solana/preview/PreviewFrame";
import { usePreviewWallet } from "@/components/solana/preview/PreviewWalletProvider";
import { ChevronDown, Copy, ExternalLink, LogOut, Wallet } from "lucide-react";

interface WalletConnectButtonProProps {
  showNetworkBadge?: boolean;
  requireSigning?: boolean;
}

export function WalletConnectButtonPro({
  showNetworkBadge = true,
  requireSigning = false,
}: WalletConnectButtonProProps) {
  const [open, setOpen] = useState(false);
  const wallet = usePreviewWallet();

  if (!wallet.connected || !wallet.shortAddress) {
    return (
      <PreviewFrame
        icon={<Wallet className="h-4 w-4" />}
        title="WalletConnectButton Pro"
        subtitle="Real preview with wallet adapter states"
      >
        <div className="space-y-3 rounded-[1.2rem] border border-border/70 bg-muted/25 p-4">
          <Button type="button" size="sm" className="gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
          {requireSigning ? (
            <p className="text-xs text-muted-foreground">Signing required</p>
          ) : null}
        </div>
      </PreviewFrame>
    );
  }

  return (
    <PreviewFrame
      icon={<Wallet className="h-4 w-4" />}
      title="WalletConnectButton Pro"
      subtitle="Real preview with wallet adapter states"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full flex-wrap items-center gap-2 rounded-[1.1rem] border border-border/70 bg-card px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span>{wallet.shortAddress}</span>
          {showNetworkBadge ? (
            <span className="marketplace-pill px-2.5 py-1">{wallet.networkLabel}</span>
          ) : null}
          {requireSigning ? (
            <span className="marketplace-pill px-2.5 py-1">Sign</span>
          ) : null}
          <ChevronDown className="ms-auto h-4 w-4 text-muted-foreground" />
        </button>

        {open ? (
          <div className="mt-3 rounded-[1rem] border border-border/70 bg-card p-2 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
              Copy address
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              View on explorer
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Disconnect
            </button>
          </div>
        ) : null}
      </div>
    </PreviewFrame>
  );
}
