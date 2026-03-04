"use client";

import React from "react";
import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { WalletContext } from "@solana/wallet-adapter-react";
import { PREVIEW_WALLET_ADDRESS } from "@/components/solana/preview/fixtures";

export type PreviewWalletMode =
  | "disconnected"
  | "connected-mock"
  | "connected-real";

interface PreviewWalletState {
  requestedMode: PreviewWalletMode;
  resolvedMode: PreviewWalletMode;
  connected: boolean;
  address: string | null;
  shortAddress: string | null;
  networkLabel: string;
  isRealWalletAvailable: boolean;
}

const PreviewWalletContext = createContext<PreviewWalletState>({
  requestedMode: "disconnected",
  resolvedMode: "disconnected",
  connected: false,
  address: null,
  shortAddress: null,
  networkLabel: "Preview",
  isRealWalletAvailable: false,
});

function shortenAddress(address: string | null) {
  if (!address) {
    return null;
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function PreviewWalletProvider({
  mode,
  children,
}: PropsWithChildren<{ mode: PreviewWalletMode }>) {
  const walletContext = useContext(WalletContext);
  const realPublicKey = walletContext.connected ? walletContext.publicKey : null;

  const value = useMemo<PreviewWalletState>(() => {
    if (mode === "connected-real" && walletContext.connected) {
      const realAddress = realPublicKey?.toBase58() ?? null;

      if (realAddress) {
        return {
          requestedMode: mode,
          resolvedMode: "connected-real",
          connected: true,
          address: realAddress,
          shortAddress: shortenAddress(realAddress),
          networkLabel: "Live",
          isRealWalletAvailable: true,
        };
      }
    }

    if (mode === "connected-mock") {
      return {
        requestedMode: mode,
        resolvedMode: "connected-mock",
        connected: true,
        address: PREVIEW_WALLET_ADDRESS,
        shortAddress: shortenAddress(PREVIEW_WALLET_ADDRESS),
        networkLabel: "Mock",
        isRealWalletAvailable: false,
      };
    }

    return {
      requestedMode: mode,
      resolvedMode: "disconnected",
      connected: false,
      address: null,
      shortAddress: null,
      networkLabel: "Preview",
      isRealWalletAvailable: Boolean(walletContext.connected),
    };
  }, [mode, realPublicKey, walletContext.connected]);

  return (
    <PreviewWalletContext.Provider value={value}>
      {children}
    </PreviewWalletContext.Provider>
  );
}

export function usePreviewWallet() {
  return useContext(PreviewWalletContext);
}
