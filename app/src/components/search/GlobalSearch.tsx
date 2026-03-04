"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, Command, Briefcase, FolderGit2, Users, Lightbulb, Trophy, GraduationCap, Component } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: 'job' | 'project' | 'mentor' | 'idea' | 'hackathon' | 'course' | 'component';
  title: string;
  description?: string;
  tags?: string[];
  url: string;
  icon: React.ReactNode;
}

export function GlobalSearch() {
  const t = useTranslations("search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard shortcut to open search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch search results
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchResults(query);
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, fetchResults]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].url);
      setOpen(false);
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'project':
        return <FolderGit2 className="h-4 w-4" />;
      case 'mentor':
        return <Users className="h-4 w-4" />;
      case 'idea':
        return <Lightbulb className="h-4 w-4" />;
      case 'hackathon':
        return <Trophy className="h-4 w-4" />;
      case 'course':
        return <GraduationCap className="h-4 w-4" />;
      case 'component':
        return <Component className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'job':
        return 'bg-blue-500/10 text-blue-500';
      case 'project':
        return 'bg-purple-500/10 text-purple-500';
      case 'mentor':
        return 'bg-green-500/10 text-green-500';
      case 'idea':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'hackathon':
        return 'bg-orange-500/10 text-orange-500';
      case 'course':
        return 'bg-pink-500/10 text-pink-500';
      case 'component':
        return 'bg-cyan-500/10 text-cyan-500';
    }
  };

  // Static suggestions shown when no query
  const suggestions = useMemo(() => [
    { title: t("jobs"), url: "/jobs", icon: <Briefcase className="h-4 w-4" /> },
    { title: t("projects"), url: "/projects", icon: <FolderGit2 className="h-4 w-4" /> },
    { title: t("mentors"), url: "/mentors", icon: <Users className="h-4 w-4" /> },
    { title: t("ideas"), url: "/ideas", icon: <Lightbulb className="h-4 w-4" /> },
    { title: t("hackathons"), url: "/hackathons", icon: <Trophy className="h-4 w-4" /> },
    { title: t("courses"), url: "/courses", icon: <GraduationCap className="h-4 w-4" /> },
  ], [t]);

  return (
    <>
      {/* Search Button */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden md:flex items-center gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">{t("search")}</span>
        <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />
          <span>K</span>
        </kbd>
      </Button>

      {/* Mobile Search Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">{t("searchTitle")}</DialogTitle>
          </DialogHeader>
          
          {/* Search Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("searchPlaceholder")}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                {t("searching")}
              </div>
            ) : query && results.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                {t("noResults")}
              </div>
            ) : query ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    onClick={() => setOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted",
                        selectedIndex === index && "bg-muted"
                      )}
                    >
                      <div className={cn("p-2 rounded", getTypeColor(result.type))}>
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.title}</span>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {result.description}
                          </p>
                        )}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {result.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Quick Links */
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                  {t("quickLinks")}
                </div>
                <div className="grid grid-cols-2 gap-1 px-2">
                  {suggestions.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted cursor-pointer">
                        <div className="p-1.5 rounded bg-muted">
                          {item.icon}
                        </div>
                        <span className="text-sm">{item.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-background">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded border bg-background">↓</kbd>
                <span>{t("navigate")}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-background">↵</kbd>
                <span>{t("select")}</span>
              </span>
            </div>
            <span>{t("escToClose")}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
