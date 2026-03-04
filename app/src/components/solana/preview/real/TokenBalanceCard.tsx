"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "@/components/solana/preview/PreviewFrame";
import { usePreviewRpc } from "@/components/solana/preview/PreviewRpcProvider";
import { usePreviewWallet } from "@/components/solana/preview/PreviewWalletProvider";
import { Coins, RefreshCw } from "lucide-react";

interface TokenBalanceCardProps {
  showSOL?: boolean;
  refreshInterval?: number;
}

export function TokenBalanceCard({
  showSOL = true,
  refreshInterval = 30_000,
}: TokenBalanceCardProps) {
  const wallet = usePreviewWallet();
  const rpc = usePreviewRpc();

  if (!wallet.connected) {
    return (
      <PreviewFrame
        icon={<Coins className="h-4 w-4" />}
        title="TokenBalanceCard"
        subtitle="Real preview backed by preview RPC fixtures"
      >
        <div className="rounded-[1.2rem] border border-dashed border-border/70 bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">Wallet required</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Switch the wallet mode to load deterministic preview balances.
          </p>
        </div>
      </PreviewFrame>
    );
  }

  const balances = rpc.balances.filter((balance) => showSOL || balance.symbol !== "SOL");

  return (
    <PreviewFrame
      icon={<Coins className="h-4 w-4" />}
      title="TokenBalanceCard"
      subtitle={`${rpc.endpointLabel} · ${refreshInterval}ms`}
    >
      <div className="space-y-2">
        {balances.map((balance) => (
          <div
            key={balance.symbol}
            className="flex items-center justify-between rounded-[1rem] border border-border/60 bg-muted/20 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card text-[10px] font-semibold text-foreground">
                {balance.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{balance.symbol}</p>
                <p className="text-[11px] text-muted-foreground">{balance.name}</p>
              </div>
            </div>
            <span className="font-mono text-sm text-foreground">{balance.amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end">
        <Button type="button" variant="ghost" size="icon" onClick={rpc.refresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </PreviewFrame>
  );
}
