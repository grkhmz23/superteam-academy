"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { AcademyTopBar } from "@/components/layout/academy-topbar";
import { LanguageSelector } from "@/components/layout/language-selector";
import {
  Briefcase,
  BookOpen,
  CalendarClock,
  Code2,
  Compass,
  FolderGit2,
  LayoutGrid,
  LayoutDashboard,
  Lightbulb,
  Medal,
  Settings,
  Trophy,
  UserCog,
  BrainCircuit,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getPageLabelKey,
  isNavItemActive,
  primaryNavItems,
  secondaryNavItems,
  type NavIconName,
  type NavItemDefinition,
} from "@/components/layout/navigation";

const iconMap: Record<NavIconName, LucideIcon> = {
  home: Compass,
  dashboard: LayoutDashboard,
  courses: BookOpen,
  playground: Code2,
  devlab: BrainCircuit,
  components: LayoutGrid,
  jobs: Briefcase,
  projects: FolderGit2,
  mentors: Users,
  ideas: Lightbulb,
  hackathons: Trophy,
  leaderboard: Medal,
  profile: User,
  settings: Settings,
  sessions: CalendarClock,
};

function buildIcon(iconName: NavIconName) {
  const Icon = iconMap[iconName];
  return <Icon className="h-[18px] w-[18px] flex-shrink-0" />;
}

export function AppSidebarShell({ children }: { children: React.ReactNode }) {
  const tNav = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const labelMap: Record<string, string> = {
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
    profile: tNav("profile"),
    settings: tc("settings"),
    sessions: tNav("sessions"),
  };

  const primaryLinks = primaryNavItems.map((item) => ({
    ...item,
    label: labelMap[item.labelKey],
    icon: buildIcon(item.icon),
  }));
  const secondaryLinks = secondaryNavItems.map((item) => ({
    ...item,
    label: labelMap[item.labelKey],
    icon: buildIcon(item.icon),
  }));
  const allLinks = [...primaryLinks, ...secondaryLinks];
  const currentLabel = labelMap[getPageLabelKey(pathname)] ?? tNav("home");

  function renderNavSection(
    items: Array<Omit<NavItemDefinition, "icon"> & { label: string; icon: React.ReactNode }>
  ) {
    return items.map((item) => (
      <SidebarLink
        key={item.href}
        link={item}
        tooltip={item.label}
        className={cn(
          "chrome-nav-item",
          isNavItemActive(pathname, item.href)
            ? "chrome-nav-item-active"
            : "text-muted-foreground"
        )}
      />
    ));
  }

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background text-foreground">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="chrome-sidebar-panel z-20 justify-between gap-4">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="chrome-sidebar-rail px-3 py-3">
              <Link
                href="/"
                className={cn("flex items-center gap-2 py-1", open ? "justify-start" : "justify-center")}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground transition-all duration-200",
                    open ? "w-auto opacity-100" : "w-0 opacity-0"
                  )}
                >
                  SuperTeam Academy
                </span>
                {!open ? <Compass className="h-5 w-5 flex-shrink-0 text-foreground" /> : null}
              </Link>
              {open ? (
                <>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    {currentLabel}
                  </p>
                  <div className="mt-4 h-px bg-gradient-to-r from-border via-border/50 to-transparent" />
                </>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-5">
              <div>
                {open ? <p className="chrome-nav-group-label mb-2 px-2">Explore</p> : null}
                <div className="flex flex-col gap-1.5">
                  {renderNavSection(primaryLinks)}
                </div>
              </div>
              <div>
                {open ? <p className="chrome-nav-group-label mb-2 px-2">Account</p> : null}
                <div className="flex flex-col gap-1.5">
                  {renderNavSection(secondaryLinks)}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {open ? (
              <LanguageSelector
                buttonClassName="chrome-pill chrome-pill-interactive w-full justify-between border-border/70 bg-card/90 px-3 py-2 text-xs"
                panelClassName="rounded-2xl border-border/70 bg-popover/95 shadow-xl backdrop-blur-xl"
              />
            ) : null}
            <div className={cn("chrome-sidebar-rail", open ? "p-2" : "p-1.5")}>
              <SidebarLink
                link={{
                  label: session?.user?.name ?? tc("signIn"),
                  href: session?.user ? "/profile" : "/auth/signin",
                  icon: session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                      alt={session.user.name ?? "User"}
                    />
                  ) : (
                    <UserCog className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  ),
                }}
                tooltip={session?.user?.name ?? tc("signIn")}
                className={open ? "bg-transparent" : "justify-center px-0"}
              />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <AcademyTopBar />
        <div className="academy-scrollbar min-h-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 p-3 backdrop-blur-2xl lg:hidden">
        <div className="academy-scrollbar flex gap-2 overflow-x-auto pb-1">
          {allLinks.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "chrome-pill chrome-pill-interactive flex min-w-max items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.2em]",
                  active
                    ? "chrome-nav-item-active"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
