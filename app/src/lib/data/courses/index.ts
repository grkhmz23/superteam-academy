import type { Course } from '@/types/content';

// Re-export all static course data (for backward compatibility)
export {
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
  solanaCourses10To18,
  solanaCourses43To51,
  courses,
} from './sync-exports';

// Course slugs registry for type safety
export const courseSlugs = [
  'solana-fundamentals',
  'anchor-development',
  'solana-frontend',
  'defi-on-solana',
  'solana-security',
  'token-engineering',
  'solana-mobile',
  'solana-testing',
  'solana-indexing',
  'solana-payments',
  'solana-nft-compression',
  'solana-governance-multisig',
  'solana-performance',
  'defi-swap-aggregator',
  'defi-clmm-liquidity',
  'defi-lending-risk',
  'defi-perps-risk-console',
  'defi-tx-optimizer',
  'solana-mobile-signing',
  'solana-pay-commerce',
  'wallet-ux-engineering',
  'sign-in-with-solana',
  'priority-fees-compute-budget',
  'bundles-atomicity',
  'mempool-ux-defense',
  'indexing-webhooks-pipelines',
  'rpc-reliability-latency',
  'rust-data-layout-borsh',
  'rust-errors-invariants',
  'rust-perf-onchain-thinking',
  'rust-async-indexer-pipeline',
  'rust-proc-macros-codegen-safety',
  'anchor-upgrades-migrations',
] as const;

export type CourseSlug = (typeof courseSlugs)[number];

// Dynamic imports for course data - prevents bundling all content into API routes
// Use these in API routes and server components for smaller bundles
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    switch (slug) {
      case 'solana-fundamentals':
        const { solanaFundamentalsCourse } = await import('./solana-fundamentals');
        return solanaFundamentalsCourse;
      case 'anchor-development':
        const { anchorDevelopmentCourse } = await import('./anchor-development');
        return anchorDevelopmentCourse;
      case 'solana-frontend':
        const { solanaFrontendCourse } = await import('./solana-frontend');
        return solanaFrontendCourse;
      case 'defi-on-solana':
        const { defiSolanaCourse } = await import('./defi-solana');
        return defiSolanaCourse;
      case 'solana-security':
        const { solanaSecurityCourse } = await import('./solana-security');
        return solanaSecurityCourse;
      case 'token-engineering':
        const { tokenEngineeringCourse } = await import('./token-engineering');
        return tokenEngineeringCourse;
      case 'solana-mobile':
        const { solanaMobileCourse } = await import('./solana-mobile');
        return solanaMobileCourse;
      case 'solana-testing':
        const { solanaTestingCourse } = await import('./solana-testing');
        return solanaTestingCourse;
      case 'solana-indexing':
        const { solanaIndexingCourse } = await import('./solana-indexing');
        return solanaIndexingCourse;
      case 'solana-payments':
        const { solanaPaymentsCourse } = await import('./solana-payments');
        return solanaPaymentsCourse;
      case 'solana-nft-compression':
        const { solanaNftCompressionCourse } = await import('./solana-nft-compression');
        return solanaNftCompressionCourse;
      case 'solana-governance-multisig':
        const { solanaGovernanceMultisigCourse } = await import('./solana-governance-multisig');
        return solanaGovernanceMultisigCourse;
      case 'solana-performance':
        const { solanaPerformanceCourse } = await import('./solana-performance');
        return solanaPerformanceCourse;
      case 'defi-swap-aggregator':
        const { defiSwapAggregatorCourse } = await import('./defi-swap-aggregator');
        return defiSwapAggregatorCourse;
      case 'defi-clmm-liquidity':
        const { defiClmmLiquidityCourse } = await import('./defi-clmm-liquidity');
        return defiClmmLiquidityCourse;
      case 'defi-lending-risk':
        const { defiLendingRiskCourse } = await import('./defi-lending-risk');
        return defiLendingRiskCourse;
      case 'defi-perps-risk-console':
        const { defiPerpsRiskConsoleCourse } = await import('./defi-perps-risk-console');
        return defiPerpsRiskConsoleCourse;
      case 'defi-tx-optimizer':
        const { defiTxOptimizerCourse } = await import('./defi-tx-optimizer');
        return defiTxOptimizerCourse;
      case 'solana-mobile-signing':
        const { solanaMobileSigningCourse } = await import('./solana-mobile-signing');
        return solanaMobileSigningCourse;
      case 'solana-pay-commerce':
        const { solanaPayCommerceCourse } = await import('./solana-pay-commerce');
        return solanaPayCommerceCourse;
      case 'wallet-ux-engineering':
        const { walletUxEngineeringCourse } = await import('./wallet-ux-engineering');
        return walletUxEngineeringCourse;
      case 'sign-in-with-solana':
        const { signInWithSolanaCourse } = await import('./sign-in-with-solana');
        return signInWithSolanaCourse;
      case 'priority-fees-compute-budget':
        const { priorityFeesComputeBudgetCourse } = await import('./priority-fees-compute-budget');
        return priorityFeesComputeBudgetCourse;
      case 'bundles-atomicity':
        const { bundlesAtomicityCourse } = await import('./bundles-atomicity');
        return bundlesAtomicityCourse;
      case 'mempool-ux-defense':
        const { mempoolUxDefenseCourse } = await import('./mempool-ux-defense');
        return mempoolUxDefenseCourse;
      case 'indexing-webhooks-pipelines':
        const { indexingWebhooksPipelinesCourse } = await import('./indexing-webhooks-pipelines');
        return indexingWebhooksPipelinesCourse;
      case 'rpc-reliability-latency':
        const { rpcReliabilityLatencyCourse } = await import('./rpc-reliability-latency');
        return rpcReliabilityLatencyCourse;
      case 'rust-data-layout-borsh':
        const { rustDataLayoutBorshCourse } = await import('./rust-data-layout-borsh');
        return rustDataLayoutBorshCourse;
      case 'rust-errors-invariants':
        const { rustErrorsInvariantsCourse } = await import('./rust-errors-invariants');
        return rustErrorsInvariantsCourse;
      case 'rust-perf-onchain-thinking':
        const { rustPerfOnchainThinkingCourse } = await import('./rust-perf-onchain-thinking');
        return rustPerfOnchainThinkingCourse;
      case 'rust-async-indexer-pipeline':
        const { rustAsyncIndexerPipelineCourse } = await import('./rust-async-indexer-pipeline');
        return rustAsyncIndexerPipelineCourse;
      case 'rust-proc-macros-codegen-safety':
        const { rustProcMacrosCodegenSafetyCourse } = await import('./rust-proc-macros-codegen-safety');
        return rustProcMacrosCodegenSafetyCourse;
      case 'anchor-upgrades-migrations':
        const { anchorUpgradesMigrationsCourse } = await import('./anchor-upgrades-migrations');
        return anchorUpgradesMigrationsCourse;
      default:
        // Check bundled courses (10-18, 43-51)
        const { solanaCourses10To18 } = await import('./solana-courses-10-18');
        const courseFrom10to18 = solanaCourses10To18.find(c => c.slug === slug);
        if (courseFrom10to18) return courseFrom10to18;

        const { solanaCourses43To51 } = await import('./solana-courses-43-51');
        const courseFrom43to51 = solanaCourses43To51.find(c => c.slug === slug);
        if (courseFrom43to51) return courseFrom43to51;

        return null;
    }
  } catch (error) {
    console.error(`Failed to load course: ${slug}`, error);
    return null;
  }
}

// Lazy-loaded all courses - use this in API routes to avoid bundling all courses into every function
let coursesCache: Course[] | null = null;

export async function getAllCourses(): Promise<Course[]> {
  if (coursesCache) return coursesCache;

  const [
    { solanaFundamentalsCourse },
    { anchorDevelopmentCourse },
    { solanaFrontendCourse },
    { defiSolanaCourse },
    { solanaSecurityCourse },
    { tokenEngineeringCourse },
    { solanaMobileCourse },
    { solanaTestingCourse },
    { solanaIndexingCourse },
    { solanaPaymentsCourse },
    { solanaNftCompressionCourse },
    { solanaGovernanceMultisigCourse },
    { solanaPerformanceCourse },
    { defiSwapAggregatorCourse },
    { defiClmmLiquidityCourse },
    { defiLendingRiskCourse },
    { defiPerpsRiskConsoleCourse },
    { defiTxOptimizerCourse },
    { solanaMobileSigningCourse },
    { solanaPayCommerceCourse },
    { walletUxEngineeringCourse },
    { signInWithSolanaCourse },
    { priorityFeesComputeBudgetCourse },
    { bundlesAtomicityCourse },
    { mempoolUxDefenseCourse },
    { indexingWebhooksPipelinesCourse },
    { rpcReliabilityLatencyCourse },
    { rustDataLayoutBorshCourse },
    { rustErrorsInvariantsCourse },
    { rustPerfOnchainThinkingCourse },
    { rustAsyncIndexerPipelineCourse },
    { rustProcMacrosCodegenSafetyCourse },
    { anchorUpgradesMigrationsCourse },
    { solanaCourses10To18 },
    { solanaCourses43To51 },
  ] = await Promise.all([
    import('./solana-fundamentals'),
    import('./anchor-development'),
    import('./solana-frontend'),
    import('./defi-solana'),
    import('./solana-security'),
    import('./token-engineering'),
    import('./solana-mobile'),
    import('./solana-testing'),
    import('./solana-indexing'),
    import('./solana-payments'),
    import('./solana-nft-compression'),
    import('./solana-governance-multisig'),
    import('./solana-performance'),
    import('./defi-swap-aggregator'),
    import('./defi-clmm-liquidity'),
    import('./defi-lending-risk'),
    import('./defi-perps-risk-console'),
    import('./defi-tx-optimizer'),
    import('./solana-mobile-signing'),
    import('./solana-pay-commerce'),
    import('./wallet-ux-engineering'),
    import('./sign-in-with-solana'),
    import('./priority-fees-compute-budget'),
    import('./bundles-atomicity'),
    import('./mempool-ux-defense'),
    import('./indexing-webhooks-pipelines'),
    import('./rpc-reliability-latency'),
    import('./rust-data-layout-borsh'),
    import('./rust-errors-invariants'),
    import('./rust-perf-onchain-thinking'),
    import('./rust-async-indexer-pipeline'),
    import('./rust-proc-macros-codegen-safety'),
    import('./anchor-upgrades-migrations'),
    import('./solana-courses-10-18'),
    import('./solana-courses-43-51'),
  ]);

  coursesCache = [
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

  return coursesCache;
}
