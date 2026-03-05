"use client";

import {
  Connection,
  PublicKey,
  Transaction,
  type SendOptions,
} from "@solana/web3.js";
import { buildEnrollInstruction } from "@/lib/progress/onchain-enrollment";

function normalizeErrorText(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  const maybe = error as { message?: unknown };
  if (typeof maybe.message === "string") return maybe.message;
  return "";
}

export function getEnrollmentErrorDescription(error: unknown): string {
  const message = normalizeErrorText(error).toLowerCase();
  const maybeCode = (error as { code?: unknown })?.code;

  if (
    maybeCode === 4001 ||
    message.includes("user rejected") ||
    message.includes("rejected the request")
  ) {
    return "Transaction was rejected in your wallet.";
  }

  if (message.includes("insufficient funds")) {
    return "Wallet has insufficient SOL for devnet transaction fees.";
  }

  if (message.includes("blockhash not found") || message.includes("node is behind")) {
    return "Network is out of sync. Retry in a few seconds on Solana devnet.";
  }

  if (message.includes("unexpected error") || message.includes("walletsendtransactionerror")) {
    return "Wallet could not send the enrollment transaction. Ensure wallet network is Solana Devnet and retry.";
  }

  return "Approve the devnet enrollment transaction in your wallet.";
}

export interface EnrollOnchainInput {
  courseId: string;
  courseSlug: string;
  connection: Connection;
  learner: PublicKey;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions
  ) => Promise<string>;
}

export async function enrollWithOnchainTransaction(
  input: EnrollOnchainInput
): Promise<string> {
  const { courseId, courseSlug, connection, learner, sendTransaction } = input;
  const instruction = buildEnrollInstruction({
    courseId,
    learner,
  });
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  const transaction = new Transaction({
    feePayer: learner,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }).add(instruction);

  const transactionSignature = await sendTransaction(transaction, connection, {
    preflightCommitment: "confirmed",
  });

  const confirmation = await connection.confirmTransaction(
    {
      signature: transactionSignature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "confirmed"
  );

  if (confirmation.value.err) {
    throw new Error("Enrollment transaction failed on devnet.");
  }

  const syncResponse = await fetch("/api/progress/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseSlug,
      courseId,
      walletAddress: learner.toBase58(),
      transactionSignature,
    }),
  });

  if (!syncResponse.ok) {
    throw new Error("Could not sync on-chain enrollment.");
  }

  return transactionSignature;
}
