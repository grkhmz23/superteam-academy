"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/lib/i18n/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AchievementBadge } from "@/components/achievements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { useAllProgress } from "@/lib/hooks/use-progress";
import { useStreak } from "@/lib/hooks/use-streak";
import { useXP } from "@/lib/hooks/use-xp";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Loader2,
  Medal,
  Sparkles,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import type { AchievementWithStatus } from "@/types/achievements";

interface ActivityItem {
  id: string;
  courseSlug: string;
  lessonId: string;
  xpAwarded: number;
  completedAt: string;
}

interface OnChainXPData {
  onChainAvailable: boolean;
  balance?: number;
  mintAddress?: string;
  tokenAccount?: string | null;
  message?: string;
}

function DashboardContent() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const { data: session } = useSession();

  const { xp, level, levelProgress, isLoading: isLoadingXP } = useXP();
  const { streak, isLoading: isLoadingStreak } = useStreak();
  const { progressList, isLoading: isLoadingProgress } = useAllProgress();
  const { userRank, isLoading: isLoadingRank } = useLeaderboard(50);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [onChainXP, setOnChainXP] = useState<OnChainXPData | null>(null);
  const [isLoadingOnChain, setIsLoadingOnChain] = useState(true);

  const walletAddress = session?.user?.walletAddress ?? null;

  useEffect(() => {
    async function fetchOnChainXP() {
      if (!walletAddress) {
        setIsLoadingOnChain(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/onchain/xp?wallet=${encodeURIComponent(walletAddress)}`
        );
        if (response.ok) {
          const data = (await response.json()) as { data: OnChainXPData };
          setOnChainXP(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch on-chain XP:", err);
      } finally {
        setIsLoadingOnChain(false);
      }
    }

    void fetchOnChainXP();
  }, [walletAddress]);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch("/api/progress/activity?limit=10");
        if (response.ok) {
          const data = (await response.json()) as { activity: ActivityItem[] };
          setActivity(data.activity ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      } finally {
        setIsLoadingActivity(false);
      }
    }

    void fetchActivity();
  }, []);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const response = await fetch("/api/achievements");
        if (response.ok) {
          const data = (await response.json()) as {
            achievements: AchievementWithStatus[];
          };
          setAchievements(data.achievements ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setIsLoadingAchievements(false);
      }
    }

    void fetchAchievements();
  }, []);

  const isLoading =
    isLoadingXP ||
    isLoadingStreak ||
    isLoadingProgress ||
    isLoadingActivity ||
    isLoadingAchievements;

  const userName = session?.user?.name;
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);

  if (isLoading) {
    return (
      <PageShell
        hero={
          <PageHeader
            badge={{ variant: "brand", icon: Zap, label: t("xpBalance") }}
            title={userName ? t("welcome", { name: userName }) : t("welcomeDefault")}
            description={t("recommendations")}
          />
        }
      >
        <div className="marketplace-panel flex min-h-[24rem] items-center justify-center rounded-[1.5rem]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      hero={
        <PageHeader
          badge={{ variant: "brand", icon: Zap, label: t("xpBalance") }}
          title={userName ? t("welcome", { name: userName }) : t("welcomeDefault")}
          description={t("recommendations")}
          actions={
            <Link href="/courses">
              <Button variant="outline" className="gap-2 rounded-xl">
                {tc("viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Zap}
          label={t("xpBalance")}
          value={xp.toLocaleString()}
          detail={!isLoadingOnChain && walletAddress && onChainXP?.onChainAvailable
            ? `${t("onChainXP")}: ${(onChainXP.balance ?? 0).toLocaleString()} ${tc("xp")}`
            : walletAddress
              ? t("onChainPending")
              : t("linkWalletForXP")}
        />
        <StatCard
          icon={Sparkles}
          label={tc("level")}
          value={level}
          detail={`${t("xpToNext")}: ${Math.max(levelProgress.required - Math.round(levelProgress.current), 0)}`}
        />
        <StatCard
          icon={Flame}
          label={t("currentStreak")}
          value={`${streak.currentStreak} ${tc("days")}`}
          detail={t("longestStreak", { days: streak.longestStreak })}
        />
        <StatCard
          icon={Trophy}
          label={t("yourRank")}
          value={isLoadingRank ? "—" : userRank ? `#${userRank}` : "—"}
          detail={t("recommendations")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.85fr)]">
        <div className="space-y-6">
          <MarketplaceCard accent>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t("currentCourses")}</h2>
                  <p className="text-sm text-muted-foreground">{t("recommendations")}</p>
                </div>
                <Link href="/courses">
                  <Button variant="ghost" size="sm" className="gap-1 rounded-xl">
                    {tc("viewAll")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
              {progressList.length === 0 ? (
                <PremiumEmptyState
                  icon={BookOpen}
                  title={t("noCourses")}
                  description={t("startLearning")}
                  action={
                    <Link href="/courses">
                      <Button className="rounded-xl">{t("startLearning")}</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {progressList.map((progress) => (
                    <Link key={progress.courseSlug} href={`/courses/${progress.courseSlug}`} className="block">
                      <div className="premium-card-hover flex items-center gap-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-foreground">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{progress.courseSlug}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <Progress value={progress.completionPercent} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground">{progress.completionPercent}%</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </MarketplaceCard>

          <MarketplaceCard accent>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t("achievements")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {unlockedAchievements.length} / {achievements.length} {tc("unlocked").toLowerCase()}
                  </p>
                </div>
                <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                  {t("achievements")}
                </Badge>
              </div>
              {unlockedAchievements.length === 0 ? (
                <PremiumEmptyState
                  icon={Medal}
                  title={t("noAchievements")}
                  description={t("recommendations")}
                />
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {unlockedAchievements.slice(0, 12).map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </MarketplaceCard>
        </div>

        <div className="space-y-6">
          <MarketplaceCard accent>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">{t("xpBalance")}</h2>
                <p className="text-sm text-muted-foreground">{t("xpToNext")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                <p className="text-3xl font-semibold tracking-tight text-foreground">{xp.toLocaleString()}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tc("xp")}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{tc("level")} {level}</span>
                  <span className="text-muted-foreground">{levelProgress.percent}%</span>
                </div>
                <Progress value={levelProgress.percent} className="h-2" />
              </div>
              {!isLoadingOnChain ? (
                walletAddress ? (
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                    {onChainXP?.onChainAvailable
                      ? `${t("onChainXP")}: ${(onChainXP.balance ?? 0).toLocaleString()} ${tc("xp")}`
                      : t("onChainPending")}
                  </div>
                ) : (
                  <Link href="/settings" className="block">
                    <div className="premium-card-hover flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                      <Wallet className="h-4 w-4 flex-shrink-0" />
                      <span>{t("linkWalletForXP")}</span>
                    </div>
                  </Link>
                )
              ) : null}
            </CardContent>
          </MarketplaceCard>

          <MarketplaceCard accent>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">{t("recentActivity")}</h2>
                <p className="text-sm text-muted-foreground">{t("recommendations")}</p>
              </div>
              {activity.length === 0 ? (
                <PremiumEmptyState
                  icon={Zap}
                  title={t("noActivity")}
                  description={t("recommendations")}
                />
              ) : (
                <div className="space-y-3">
                  {activity.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="premium-card-hover flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-foreground">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {t("activityCompletedIn", { course: item.courseSlug })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                        +{item.xpAwarded} {tc("xp")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </MarketplaceCard>
        </div>
      </div>
    </PageShell>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
