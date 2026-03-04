"use client";

export interface PreviewTokenBalance {
  symbol: string;
  name: string;
  amount: string;
}

export const PREVIEW_WALLET_ADDRESS = "8XwYk3Lf9Pq2Ns7Tc4kLmJ5vHd2Rz6Ua1BnQp4xW7mJ";

export const MOCK_TOKEN_BALANCES: PreviewTokenBalance[] = [
  { symbol: "SOL", name: "Solana", amount: "4.28" },
  { symbol: "USDC", name: "USD Coin", amount: "182.50" },
  { symbol: "BONK", name: "Bonk", amount: "420,000" },
];

export const DEVNET_TOKEN_BALANCES: PreviewTokenBalance[] = [
  { symbol: "SOL", name: "Solana", amount: "2.14" },
  { symbol: "USDC", name: "USD Coin", amount: "96.20" },
  { symbol: "JAZZ", name: "Jazz Credits", amount: "12,480" },
];
