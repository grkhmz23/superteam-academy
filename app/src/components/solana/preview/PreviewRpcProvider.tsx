"use client";

import React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import {
  DEVNET_TOKEN_BALANCES,
  MOCK_TOKEN_BALANCES,
  type PreviewTokenBalance,
} from "@/components/solana/preview/fixtures";
import { usePreviewWallet } from "@/components/solana/preview/PreviewWalletProvider";

export type PreviewRpcMode = "mock" | "devnet";

interface PreviewRpcState {
  mode: PreviewRpcMode;
  endpointLabel: string;
  balances: PreviewTokenBalance[];
  refreshedAt: number;
  refresh: () => void;
}

const PreviewRpcContext = createContext<PreviewRpcState>({
  mode: "mock",
  endpointLabel: "Mock RPC",
  balances: MOCK_TOKEN_BALANCES,
  refreshedAt: 0,
  refresh: () => undefined,
});

export function PreviewRpcProvider({
  mode,
  refreshToken,
  children,
}: PropsWithChildren<{ mode: PreviewRpcMode; refreshToken: number }>) {
  const wallet = usePreviewWallet();
  const [refreshedAt, setRefreshedAt] = useState(() => Date.now());
  const [balances, setBalances] = useState<PreviewTokenBalance[]>(() =>
    mode === "devnet" ? DEVNET_TOKEN_BALANCES : MOCK_TOKEN_BALANCES
  );

  const refresh = useCallback(() => {
    setRefreshedAt(Date.now());
  }, []);

  const value = useMemo<PreviewRpcState>(() => {
    return {
      mode,
      endpointLabel: mode === "devnet" ? "Devnet" : "Mock RPC",
      balances,
      refreshedAt,
      refresh,
    };
  }, [balances, mode, refreshedAt, refresh]);

  useEffect(() => {
    setRefreshedAt(Date.now());
  }, [refreshToken]);

  useEffect(() => {
    setBalances(mode === "devnet" ? DEVNET_TOKEN_BALANCES : MOCK_TOKEN_BALANCES);
  }, [mode]);

  useEffect(() => {
    const walletAddress = wallet.address;

    if (mode !== "devnet" || refreshToken === 0 || !wallet.connected || !walletAddress) {
      return;
    }

    let cancelled = false;

    async function loadBalance() {
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const publicKey = new PublicKey(walletAddress as string);
        const lamports = await connection.getBalance(publicKey, "confirmed");
        const solBalance = (lamports / 1_000_000_000).toFixed(2);

        if (!cancelled) {
          setBalances([
            { symbol: "SOL", name: "Solana", amount: solBalance },
            ...DEVNET_TOKEN_BALANCES.filter((balance) => balance.symbol !== "SOL"),
          ]);
        }
      } catch {
        if (!cancelled) {
          setBalances(DEVNET_TOKEN_BALANCES);
        }
      }
    }

    void loadBalance();

    return () => {
      cancelled = true;
    };
  }, [mode, refreshToken, wallet.address, wallet.connected]);

  return (
    <PreviewRpcContext.Provider value={value}>
      {children}
    </PreviewRpcContext.Provider>
  );
}

export function usePreviewRpc() {
  return useContext(PreviewRpcContext);
}
