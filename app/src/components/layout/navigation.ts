export type NavIconName =
  | "home"
  | "dashboard"
  | "courses"
  | "playground"
  | "devlab"
  | "components"
  | "jobs"
  | "projects"
  | "mentors"
  | "ideas"
  | "hackathons"
  | "leaderboard"
  | "profile"
  | "settings"
  | "sessions";

export interface NavItemDefinition {
  href: string;
  labelKey: string;
  icon: NavIconName;
}

export const primaryNavItems: NavItemDefinition[] = [
  { href: "/", labelKey: "home", icon: "home" },
  { href: "/dashboard", labelKey: "dashboard", icon: "dashboard" },
  { href: "/courses", labelKey: "courses", icon: "courses" },
  { href: "/playground", labelKey: "playground", icon: "playground" },
  { href: "/devlab", labelKey: "devlab", icon: "devlab" },
  { href: "/components", labelKey: "components", icon: "components" },
  { href: "/jobs", labelKey: "jobs", icon: "jobs" },
  { href: "/projects", labelKey: "projects", icon: "projects" },
  { href: "/mentors", labelKey: "mentors", icon: "mentors" },
  { href: "/ideas", labelKey: "ideas", icon: "ideas" },
  { href: "/hackathons", labelKey: "hackathons", icon: "hackathons" },
  { href: "/leaderboard", labelKey: "leaderboard", icon: "leaderboard" },
];

export const secondaryNavItems: NavItemDefinition[] = [
  { href: "/sessions", labelKey: "sessions", icon: "sessions" },
  { href: "/profile", labelKey: "profile", icon: "profile" },
  { href: "/settings", labelKey: "settings", icon: "settings" },
];

const routeLabelMap: Array<{ match: string; key: string }> = [
  { match: "/dashboard", key: "dashboard" },
  { match: "/courses", key: "courses" },
  { match: "/playground", key: "playground" },
  { match: "/devlab", key: "devlab" },
  { match: "/components", key: "components" },
  { match: "/jobs", key: "jobs" },
  { match: "/projects", key: "projects" },
  { match: "/mentors", key: "mentors" },
  { match: "/ideas", key: "ideas" },
  { match: "/hackathons", key: "hackathons" },
  { match: "/leaderboard", key: "leaderboard" },
  { match: "/sessions", key: "sessions" },
  { match: "/settings", key: "settings" },
  { match: "/profile", key: "profile" },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageLabelKey(pathname: string): string {
  const match = routeLabelMap.find((item) => pathname.includes(item.match));
  return match?.key ?? "home";
}
