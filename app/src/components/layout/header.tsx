"use client";

import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, LogOut, User, Settings, LayoutDashboard, Globe, Terminal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { localeOptions } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/routing";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const navItems = [
    { href: "/courses", label: t("courses") },
    { href: "/components", label: t("components") },
    { href: "/playground", label: t("playground") },
    { href: "/devlab", label: t("devlab") },
    { href: "/leaderboard", label: t("leaderboard") },
  ];

  const expandedNavItems = [
    { href: "/jobs", label: t("jobs") },
    { href: "/projects", label: t("projects") },
    { href: "/mentors", label: t("mentors") },
    { href: "/ideas", label: t("ideas") },
    { href: "/hackathons", label: t("hackathons") },
  ];

  const handleSignOut = () => {
    void signOut({ callbackUrl: "/" });
  };

  const handleLocaleChange = (nextLocale: Locale) => {
    router.replace(pathname, { locale: nextLocale });
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 transition-all duration-300">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center ltr-isolate group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/50 to-purple-500/50 opacity-0 blur transition duration-500 group-hover:opacity-30" />
              <Image
                src="/superteam-academy-mark.svg"
                alt={tc("appName")}
                width={170}
                height={44}
                priority
                className="relative h-9 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-muted-foreground transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-5 w-px bg-border/50 mx-2 skew-x-[-15deg]" />
            {expandedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-muted-foreground/60 transition-all duration-300 hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <nav className="hidden md:flex items-center gap-3">
            <GlobalSearch />
            <NotificationBell />
            <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-background/30 px-2.5 py-1.5 backdrop-blur-md transition-colors hover:border-border">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                aria-label={t("language")}
                className="bg-transparent text-xs font-mono uppercase tracking-wider outline-none cursor-pointer"
                value={locale}
                onChange={(e) => handleLocaleChange(e.target.value as Locale)}
              >
                {localeOptions.map((option) => (
                  <option key={option.code} value={option.code} className="bg-background">
                    {option.flag} {option.code}
                  </option>
                ))}
              </select>
            </div>
            {isAuthenticated && session?.user ? (
              <div className="relative">
                {showUserMenu ? (
                  <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-2 font-mono text-xs">
                        <User className="h-3.5 w-3.5" />
                        {t("profile")}
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2 font-mono text-xs">
                        <Terminal className="h-3.5 w-3.5" />
                        {t("dashboard")}
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" size="sm" className="gap-2 font-mono text-xs">
                        <Settings className="h-3.5 w-3.5" />
                        {tc("settings")}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUserMenu(false)}
                      className="font-mono text-xs text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="gap-2 font-mono text-xs text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border/50 bg-background/30 hover:bg-accent hover:border-accent transition-all duration-300"
                    onClick={() => setShowUserMenu(true)}
                  >
                    <Avatar className="h-6 w-6 ring-1 ring-primary/20">
                      <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={session.user.name ?? "User"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-mono text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span dir="auto" className="bidi-safe max-w-[100px] truncate font-medium">
                      {session.user.name}
                    </span>
                  </Button>
                )}
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-mono uppercase tracking-wider text-xs transition-all duration-300 shadow-[0_0_10px_rgba(var(--primary),0.1)] hover:shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  {tc("signIn")}
                </Button>
              </Link>
            )}
          </nav>
          <div className="flex md:hidden items-center gap-2">
            <button
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container py-4 space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-background/50 px-3 py-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select
                aria-label={t("language")}
                className="w-full bg-transparent text-sm font-mono outline-none"
                value={locale}
                onChange={(e) => handleLocaleChange(e.target.value as Locale)}
              >
                {localeOptions.map((option) => (
                  <option key={option.code} value={option.code} className="bg-background">
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm font-medium tracking-wide py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-border/40 my-3" />
            {expandedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="pt-4 mt-4 border-t border-border/40 space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 py-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Avatar className="h-8 w-8 ring-1 ring-primary/30">
                    <AvatarImage
                      src={session?.user?.image ?? undefined}
                      alt={session?.user?.name ?? "User"}
                    />
                    <AvatarFallback className="font-mono text-xs bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span dir="auto" className="bidi-safe truncate font-mono">
                    {session?.user?.name}
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 py-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  {t("dashboard")}
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 py-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  {tc("settings")}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-red-500 hover:text-red-400"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {tc("signOut")}
                </Button>
              </div>
            ) : (
              <Link href="/auth/signin" className="block pt-4">
                <Button className="w-full justify-center font-mono uppercase tracking-widest text-xs">
                  {tc("signIn")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
