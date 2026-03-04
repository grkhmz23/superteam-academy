/**
 * Skill matching algorithm for Superteam Academy
 * Calculates match percentage between user skills and requirements
 */

// Map course slugs to relevant skill tags
const COURSE_SKILL_MAP: Record<string, string[]> = {
  'solana-fundamentals': ['solana', 'web3', 'blockchain', 'basics'],
  'anchor-development': ['anchor', 'rust', 'solana', 'smart-contracts'],
  'defi-solana': ['defi', 'solana', 'finance', 'tokens'],
  'solana-frontend': ['frontend', 'react', 'typescript', 'web3'],
  'rust-data-layout-borsh': ['rust', 'serialization', 'data-structures'],
  'sign-in-with-solana': ['authentication', 'solana', 'security'],
  'solana-nft-compression': ['nft', 'compression', 'metaplex'],
  'solana-indexing': ['indexing', 'rpc', 'data', 'analytics'],
  'solana-performance': ['performance', 'optimization', 'compute'],
  'solana-governance-multisig': ['governance', 'multisig', 'dao'],
  'solana-payments': ['payments', 'checkout', 'commerce'],
  'solana-mobile-signing': ['mobile', 'react-native', 'signing'],
  'defi-lending-risk': ['defi', 'lending', 'risk', 'liquidation'],
  'defi-swap-aggregator': ['defi', 'dex', 'swaps', 'aggregation'],
  'defi-tx-optimizer': ['optimization', 'transactions', 'compute'],
  'defi-clmm-liquidity': ['defi', 'clmm', 'liquidity', 'concentrated'],
  'defi-perps-risk-console': ['defi', 'perpetuals', 'risk', 'trading'],
  'bundles-atomicity': ['bundles', 'jito', 'mev', 'atomic-transactions'],
  'priority-fees-compute-budget': ['fees', 'compute', 'optimization'],
  'rpc-reliability-latency': ['rpc', 'reliability', 'infrastructure'],
  'indexing-webhooks-pipelines': ['indexing', 'webhooks', 'pipelines'],
  'mempool-ux-defense': ['mempool', 'ux', 'security', 'frontrunning'],
  'rust-errors-invariants': ['rust', 'errors', 'testing', 'safety'],
  'rust-async-indexer-pipeline': ['rust', 'async', 'indexer', 'pipeline'],
  'rust-perf-onchain-thinking': ['rust', 'performance', 'optimization'],
  'rust-proc-macros-codegen-safety': ['rust', 'macros', 'codegen'],
  'anchor-upgrades-migrations': ['anchor', 'upgrades', 'migrations'],
  'security-runtime': ['security', 'runtime', 'vulnerabilities'],
  'security-exploits': ['security', 'exploits', 'attacks'],
  'security-fixed': ['security', 'best-practices', 'hardening'],
};

/**
 * Calculate match score between user skills and required skills
 * Returns percentage (0-100)
 */
export function calculateSkillMatch(
  userSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 100;
  if (userSkills.length === 0) return 0;

  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());
  const normalizedRequiredSkills = requiredSkills.map((s) =>
    s.toLowerCase().trim()
  );

  let matchedCount = 0;
  for (const required of normalizedRequiredSkills) {
    if (normalizedUserSkills.some((userSkill) => userSkill.includes(required))) {
      matchedCount++;
    }
  }

  return Math.round((matchedCount / requiredSkills.length) * 100);
}

/**
 * Get skills from completed course slugs
 */
export function getSkillsFromCourses(courseSlugs: string[]): string[] {
  const skills = new Set<string>();

  for (const slug of courseSlugs) {
    const courseSkills = COURSE_SKILL_MAP[slug] || [];
    for (const skill of courseSkills) {
      skills.add(skill);
    }
  }

  return Array.from(skills);
}

/**
 * Calculate job match score based on user's completed courses
 */
export function calculateJobMatchScore(
  userCourseSlugs: string[],
  jobSkills: string[]
): number {
  const userSkills = getSkillsFromCourses(userCourseSlugs);
  return calculateSkillMatch(userSkills, jobSkills);
}

/**
 * Sort jobs by match score (highest first)
 */
export function sortJobsByMatchScore<T extends { skills: string[] }>(
  jobs: T[],
  userCourseSlugs: string[]
): Array<T & { matchScore: number }> {
  return jobs
    .map((job) => ({
      ...job,
      matchScore: calculateJobMatchScore(userCourseSlugs, job.skills),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get skill category display name
 */
export function getSkillCategory(skill: string): string {
  const categories: Record<string, string> = {
    solana: 'Solana',
    rust: 'Rust',
    anchor: 'Anchor',
    defi: 'DeFi',
    frontend: 'Frontend',
    security: 'Security',
    nft: 'NFT',
    mobile: 'Mobile',
    payments: 'Payments',
    web3: 'Web3',
  };

  return categories[skill.toLowerCase()] || skill;
}
