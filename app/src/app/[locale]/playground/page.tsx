import { PlaygroundShell } from "@/components/playground/PlaygroundShell";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { useTranslations } from "next-intl";
import { Terminal } from "lucide-react";

export default function PlaygroundPage() {
  const t = useTranslations("playground");

  return (
    <PageShell
      className="academy-pop-in"
      hero={
        <PageHeader
          icon={<Terminal className="h-5 w-5" />}
          title={t("title")}
          description={t("subtitle")}
        />
      }
    >
      <div className="rounded-[2rem] border border-border/70 bg-background/70 p-2 shadow-inner md:p-3">
        <PlaygroundShell />
      </div>
    </PageShell>
  );
}
