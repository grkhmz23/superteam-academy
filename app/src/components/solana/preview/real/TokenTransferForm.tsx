"use client";

import React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PreviewFrame } from "@/components/solana/preview/PreviewFrame";
import { usePreviewRpc } from "@/components/solana/preview/PreviewRpcProvider";
import { usePreviewWallet } from "@/components/solana/preview/PreviewWalletProvider";
import { ArrowRightLeft, Shield } from "lucide-react";

interface TokenTransferFormProps {
  defaultToken?: string;
  maxAmount?: number;
  simulateOnly?: boolean;
}

export function TokenTransferForm({
  defaultToken = "SOL",
  maxAmount = 5,
  simulateOnly = true,
}: TokenTransferFormProps) {
  const wallet = usePreviewWallet();
  const rpc = usePreviewRpc();
  const [recipient, setRecipient] = useState("7Y8Jk2Q4nP");
  const [amount, setAmount] = useState("1.5");

  const safeAmount = useMemo(() => {
    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount)) {
      return "0";
    }

    return String(Math.min(parsedAmount, maxAmount));
  }, [amount, maxAmount]);

  return (
    <PreviewFrame
      icon={<ArrowRightLeft className="h-4 w-4" />}
      title="TokenTransferForm"
      subtitle={`${rpc.endpointLabel} · ${wallet.connected ? "Wallet ready" : "Wallet optional"}`}
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="preview-transfer-recipient" className="text-xs font-medium text-muted-foreground">
              Recipient
            </label>
            <Input
              id="preview-transfer-recipient"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="preview-transfer-amount" className="text-xs font-medium text-muted-foreground">
              Amount
            </label>
            <Input
              id="preview-transfer-amount"
              value={safeAmount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="marketplace-pill px-2.5 py-1">{defaultToken}</span>
          <span className="marketplace-pill px-2.5 py-1">Max {maxAmount}</span>
          <span className="marketplace-pill px-2.5 py-1">
            {simulateOnly ? "Simulation" : "Signed transfer"}
          </span>
        </div>
        <div className="rounded-[1rem] border border-border/60 bg-muted/20 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {simulateOnly
              ? "Simulation checks run against preview fixtures before submit."
              : "Signed transfer remains disabled inside preview mode."}
          </p>
        </div>
        <Button type="button" className="w-full gap-2">
          <Shield className="h-4 w-4" />
          {simulateOnly ? "Run Simulation" : "Send Tokens"}
        </Button>
      </div>
    </PreviewFrame>
  );
}
