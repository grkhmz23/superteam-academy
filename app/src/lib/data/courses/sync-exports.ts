// Re-export all courses for backward compatibility
// This file exists to support both static and dynamic imports

export { solanaFundamentalsCourse } from './solana-fundamentals';
export { anchorDevelopmentCourse } from './anchor-development';
export { solanaFrontendCourse } from './solana-frontend';
export { defiSolanaCourse } from './defi-solana';
export { solanaSecurityCourse } from './solana-security';
export { tokenEngineeringCourse } from './token-engineering';
export { solanaMobileCourse } from './solana-mobile';
export { solanaTestingCourse } from './solana-testing';
export { solanaIndexingCourse } from './solana-indexing';
export { solanaPaymentsCourse } from './solana-payments';
export { solanaNftCompressionCourse } from './solana-nft-compression';
export { solanaGovernanceMultisigCourse } from './solana-governance-multisig';
export { solanaPerformanceCourse } from './solana-performance';
export { defiSwapAggregatorCourse } from './defi-swap-aggregator';
export { defiClmmLiquidityCourse } from './defi-clmm-liquidity';
export { defiLendingRiskCourse } from './defi-lending-risk';
export { defiPerpsRiskConsoleCourse } from './defi-perps-risk-console';
export { defiTxOptimizerCourse } from './defi-tx-optimizer';
export { solanaMobileSigningCourse } from './solana-mobile-signing';
export { solanaPayCommerceCourse } from './solana-pay-commerce';
export { walletUxEngineeringCourse } from './wallet-ux-engineering';
export { signInWithSolanaCourse } from './sign-in-with-solana';
export { priorityFeesComputeBudgetCourse } from './priority-fees-compute-budget';
export { bundlesAtomicityCourse } from './bundles-atomicity';
export { mempoolUxDefenseCourse } from './mempool-ux-defense';
export { indexingWebhooksPipelinesCourse } from './indexing-webhooks-pipelines';
export { rpcReliabilityLatencyCourse } from './rpc-reliability-latency';
export { rustDataLayoutBorshCourse } from './rust-data-layout-borsh';
export { rustErrorsInvariantsCourse } from './rust-errors-invariants';
export { rustPerfOnchainThinkingCourse } from './rust-perf-onchain-thinking';
export { rustAsyncIndexerPipelineCourse } from './rust-async-indexer-pipeline';
export { rustProcMacrosCodegenSafetyCourse } from './rust-proc-macros-codegen-safety';
export { anchorUpgradesMigrationsCourse } from './anchor-upgrades-migrations';
export { solanaCourses10To18 } from './solana-courses-10-18';
export { solanaCourses43To51 } from './solana-courses-43-51';

// Static courses array for backward compatibility
import type { Course } from '@/types/content';
import { solanaFundamentalsCourse } from './solana-fundamentals';
import { anchorDevelopmentCourse } from './anchor-development';
import { solanaFrontendCourse } from './solana-frontend';
import { defiSolanaCourse } from './defi-solana';
import { solanaSecurityCourse } from './solana-security';
import { tokenEngineeringCourse } from './token-engineering';
import { solanaMobileCourse } from './solana-mobile';
import { solanaTestingCourse } from './solana-testing';
import { solanaIndexingCourse } from './solana-indexing';
import { solanaPaymentsCourse } from './solana-payments';
import { solanaNftCompressionCourse } from './solana-nft-compression';
import { solanaGovernanceMultisigCourse } from './solana-governance-multisig';
import { solanaPerformanceCourse } from './solana-performance';
import { defiSwapAggregatorCourse } from './defi-swap-aggregator';
import { defiClmmLiquidityCourse } from './defi-clmm-liquidity';
import { defiLendingRiskCourse } from './defi-lending-risk';
import { defiPerpsRiskConsoleCourse } from './defi-perps-risk-console';
import { defiTxOptimizerCourse } from './defi-tx-optimizer';
import { solanaMobileSigningCourse } from './solana-mobile-signing';
import { solanaPayCommerceCourse } from './solana-pay-commerce';
import { walletUxEngineeringCourse } from './wallet-ux-engineering';
import { signInWithSolanaCourse } from './sign-in-with-solana';
import { priorityFeesComputeBudgetCourse } from './priority-fees-compute-budget';
import { bundlesAtomicityCourse } from './bundles-atomicity';
import { mempoolUxDefenseCourse } from './mempool-ux-defense';
import { indexingWebhooksPipelinesCourse } from './indexing-webhooks-pipelines';
import { rpcReliabilityLatencyCourse } from './rpc-reliability-latency';
import { rustDataLayoutBorshCourse } from './rust-data-layout-borsh';
import { rustErrorsInvariantsCourse } from './rust-errors-invariants';
import { rustPerfOnchainThinkingCourse } from './rust-perf-onchain-thinking';
import { rustAsyncIndexerPipelineCourse } from './rust-async-indexer-pipeline';
import { rustProcMacrosCodegenSafetyCourse } from './rust-proc-macros-codegen-safety';
import { anchorUpgradesMigrationsCourse } from './anchor-upgrades-migrations';
import { solanaCourses10To18 } from './solana-courses-10-18';
import { solanaCourses43To51 } from './solana-courses-43-51';

export const courses: Course[] = [
  solanaFundamentalsCourse,
  anchorDevelopmentCourse,
  solanaFrontendCourse,
  defiSolanaCourse,
  solanaSecurityCourse,
  tokenEngineeringCourse,
  solanaMobileCourse,
  solanaTestingCourse,
  solanaIndexingCourse,
  solanaPaymentsCourse,
  solanaNftCompressionCourse,
  solanaGovernanceMultisigCourse,
  solanaPerformanceCourse,
  defiSwapAggregatorCourse,
  defiClmmLiquidityCourse,
  defiLendingRiskCourse,
  defiPerpsRiskConsoleCourse,
  defiTxOptimizerCourse,
  solanaMobileSigningCourse,
  solanaPayCommerceCourse,
  walletUxEngineeringCourse,
  signInWithSolanaCourse,
  priorityFeesComputeBudgetCourse,
  bundlesAtomicityCourse,
  mempoolUxDefenseCourse,
  indexingWebhooksPipelinesCourse,
  rpcReliabilityLatencyCourse,
  rustDataLayoutBorshCourse,
  rustErrorsInvariantsCourse,
  rustPerfOnchainThinkingCourse,
  rustAsyncIndexerPipelineCourse,
  rustProcMacrosCodegenSafetyCourse,
  anchorUpgradesMigrationsCourse,
  ...solanaCourses10To18,
  ...solanaCourses43To51,
];

// Validate course count
if (courses.length !== 51) {
  throw new Error(`Expected 51 courses, received ${courses.length}`);
}
