"use client";

import { useMemo } from "react";
import { Command, Flame, Hexagon, Orbit, Sparkles, Wallet } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { useStreak } from "@/lib/hooks/use-streak";
import { useXP } from "@/lib/hooks/use-xp";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { LanguageSelector } from "./language-selector";
import { getPageLabelKey } from "@/components/layout/navigation";

function resolvePageLabel(
  pathname: string,
  labels: Record<string, string>,
  fallback: string
): string {
  return labels[getPageLabelKey(pathname)] ?? fallback;
}

function TopBarPill({
  children,
  className,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div className={cn("chrome-pill", interactive && "chrome-pill-interactive", className)}>
      {children}
    </div>
  );
}

export function AcademyTopBar() {
  const tNav = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const { data: session } = useSession();
  const { streak } = useStreak();
  const { level } = useXP();

  const labels = useMemo(
    () => ({
      home: tNav("home"),
      dashboard: tNav("dashboard"),
      courses: tNav("courses"),
      playground: tNav("playground"),
      devlab: tNav("devlab"),
      components: tNav("components"),
      jobs: tNav("jobs"),
      projects: tNav("projects"),
      mentors: tNav("mentors"),
      ideas: tNav("ideas"),
      hackathons: tNav("hackathons"),
      leaderboard: tNav("leaderboard"),
      sessions: tNav("sessions"),
      settings: tc("settings"),
      profile: tNav("profile"),
    }),
    [tNav, tc]
  );
  const title = useMemo(
    () => resolvePageLabel(pathname, labels, tNav("home")),
    [labels, pathname, tNav]
  );
  const wallet = session?.user?.walletAddress;

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/60 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/45 md:px-6 lg:px-8">
      <div className="chrome-topbar-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <TopBarPill className="hidden h-11 w-11 justify-center px-0 md:inline-flex">
            <Hexagon className="h-[18px] w-[18px] text-primary/80" />
          </TopBarPill>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Active Workspace
            </p>
            <h2 className="truncate text-lg font-semibold uppercase tracking-[0.18em] text-foreground md:text-xl">
              {title}
            </h2>
          </div>
        </div>

        <div className="hidden flex-wrap items-center justify-end gap-2 md:flex">
          <LanguageSelector
            buttonClassName="chrome-pill chrome-pill-interactive min-w-[7.5rem] justify-between border-border/70 bg-card/90 px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring/70"
            panelClassName="rounded-2xl border-border/70 bg-popover/95 shadow-xl backdrop-blur-xl"
          />

          <TopBarPill className="gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <Orbit className="h-3.5 w-3.5 text-primary" />
            <span>Live Build</span>
            <Command className="h-3.5 w-3.5" />
          </TopBarPill>

          <TopBarPill className="gap-3 px-3.5">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Flame className="h-4 w-4 text-primary" />
              <span className="font-medium">{streak.currentStreak}</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {tc("days")}
              </span>
            </div>
            <Separator orientation="vertical" className="h-5 bg-border/70" />
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {tc("lvl")}
              </span>
              <span className="font-medium">{level}</span>
            </div>
          </TopBarPill>

          <Link
            href="/settings"
            className="chrome-pill chrome-pill-interactive inline-flex items-center gap-2 px-3.5 py-2 font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <Wallet className="h-4 w-4 text-primary" />
            <span className="bidi-safe">
              {wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : tc("connectWallet")}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
