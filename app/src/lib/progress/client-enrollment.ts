"use client";

import {
  Connection,
  PublicKey,
  Transaction,
  type SendOptions,
} from "@solana/web3.js";
import { buildEnrollInstruction } from "@/lib/progress/onchain-enrollment";

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
