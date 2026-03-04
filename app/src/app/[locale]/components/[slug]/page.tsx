import { notFound } from "next/navigation";
import { ComponentDetail } from "@/components/solana/ComponentDetail";
import { getComponentById } from "@/lib/component-hub/registry";

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = getComponentById(slug);

  if (!component) {
    notFound();
  }

  return <ComponentDetail componentId={slug} />;
}
