import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, BookOpen, Briefcase, Code2, Medal, Sparkles, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { FeatureCard } from "@/components/ui/feature-card";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

export const revalidate = 3600;

export default function LandingPage() {
  const t = useTranslations("landing");
  const tc = useTranslations("common");
  const tNav = useTranslations("nav");
  const tDashboard = useTranslations("dashboard");
  const tLeaderboard = useTranslations("leaderboard");

  return (
    <PageShell
      hero={
        <PageHeader
          badge={{ variant: "brand", icon: Sparkles, label: t("heroBadge") }}
          title={t("heroTitle")}
          description={t("heroSubtitle")}
          actions={
            <>
              <Link href="/courses">
                <Button className="gap-2 rounded-xl">
                  {t("heroCTA")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/playground">
                <Button variant="outline" className="rounded-xl">
                  {t("heroSecondaryCTA")}
                </Button>
              </Link>
            </>
          }
        />
      }
    >
      <section className="hero-grid">
        <MarketplaceCard accent className="h-full">
          <CardContent className="space-y-5 p-6 md:p-7">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("featuresTitle")}</p>
              <p className="text-sm leading-6 text-muted-foreground">{t("featureCommunityDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                {tNav("courses")}
              </Badge>
              <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                {tNav("playground")}
              </Badge>
              <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                {tNav("devlab")}
              </Badge>
              <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                {tNav("leaderboard")}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("statsStudents")}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">2,500+</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("statsCourses")}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">15+</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("statsCredentials")}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">800+</p>
              </div>
            </div>
          </CardContent>
        </MarketplaceCard>

        <MarketplaceCard accent className="h-full">
          <CardContent className="flex h-full flex-col gap-5 p-6 md:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{tDashboard("welcomeDefault")}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{tDashboard("recommendations")}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{tNav("courses")}</span>
                <span className="text-sm font-medium text-foreground">3 {tc("lessons")}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-foreground/70" />
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link href="/courses">
                <Button className="rounded-xl">{tc("continue")}</Button>
              </Link>
              <Link href="/playground">
                <Button variant="outline" className="rounded-xl">{tNav("playground")}</Button>
              </Link>
            </div>
          </CardContent>
        </MarketplaceCard>
      </section>

      <section className="home-section">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">{t("featuresTitle")}</h2>
          <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
            {tNav("devlab")}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            href="/courses"
            icon={BookOpen}
            title={tNav("courses")}
            description={t("featureEditorDesc")}
            meta={tc("lessons")}
          />
          <FeatureCard
            href="/playground"
            icon={Code2}
            title={tNav("playground")}
            description={t("playgroundSubtitle")}
            meta={t("playgroundCTA")}
          />
          <FeatureCard
            href="/devlab"
            icon={Sparkles}
            title={tNav("devlab")}
            description={t("devlabSubtitle")}
            meta={t("devlabCTA")}
          />
        </div>
      </section>

      <section className="home-section">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">{t("featureCommunity")}</h2>
          <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
            {t("statsCommunity")}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            href="/jobs"
            icon={Briefcase}
            title={tNav("jobs")}
            description={t("featureCommunityDesc")}
            meta={tNav("jobs")}
          />
          <FeatureCard
            href="/projects"
            icon={Code2}
            title={tNav("projects")}
            description={t("componentHubSubtitle")}
            meta={tNav("projects")}
          />
          <FeatureCard
            href="/mentors"
            icon={Users}
            title={tNav("mentors")}
            description={t("featureXPDesc")}
            meta={tNav("mentors")}
          />
        </div>
      </section>

      <section className="home-section">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">{tLeaderboard("title")}</h2>
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm" className="gap-1 rounded-xl">
              {tc("viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <MarketplaceCard accent className="h-full">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{tNav("leaderboard")}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{tLeaderboard("subtitle")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                  {t("statsStudents")}
                </Badge>
                <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground">
                  {t("featureXP")}
                </Badge>
              </div>
            </CardContent>
          </MarketplaceCard>

          <MarketplaceCard accent className="h-full">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-foreground">
                <Medal className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{t("featureCredentials")}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{t("featureCredentialsDesc")}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/35 px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">{t("statsCredentials")}</p>
                  <p className="text-sm font-semibold text-foreground">800+</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/35 px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">{t("featureXP")}</p>
                  <p className="text-sm font-semibold text-foreground">XP</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/35 px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">{tc("level")}</p>
                  <p className="text-sm font-semibold text-foreground">L12</p>
                </div>
              </div>
            </CardContent>
          </MarketplaceCard>
        </div>
      </section>
    </PageShell>
  );
}
