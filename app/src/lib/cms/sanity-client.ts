import { createClient } from "next-sanity";

const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const sanityApiVersion = process.env.SANITY_API_VERSION ?? "2024-01-01";

export function isSanityConfigured(): boolean {
  return Boolean(sanityProjectId);
}

export function getSanityClient() {
  if (!sanityProjectId) {
    throw new Error(
      "Sanity CMS is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID (or SANITY_PROJECT_ID)."
    );
  }

  return createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    useCdn: process.env.NODE_ENV === "production",
    token: process.env.SANITY_API_TOKEN,
  });
}
