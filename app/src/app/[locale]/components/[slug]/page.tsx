import { notFound } from "next/navigation";
import { ComponentDetail } from "@/components/solana/ComponentDetail";
import { getComponentById } from "@/lib/component-hub/registry";

export default function ComponentDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const component = getComponentById(params.slug);

  if (!component) {
    notFound();
  }

  return <ComponentDetail componentId={params.slug} />;
}
