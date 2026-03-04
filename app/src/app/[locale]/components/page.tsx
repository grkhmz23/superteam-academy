"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  categories,
  componentRegistry,
  getFeaturedComponents,
  type ComponentCategory,
} from "@/lib/component-hub/registry";
import { ComponentCard } from "@/components/solana/ComponentCard";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import {
  SegmentedFilter,
  type SegmentedFilterOption,
} from "@/components/ui/segmented-filter";
import {
  BarChart3,
  Boxes,
  Coins,
  Image,
  Search,
  Sparkles,
  Wrench,
  ArrowRightLeft,
} from "lucide-react";

type CategoryFilter = ComponentCategory | "all";

const categoryIcons = {
  wallet: Wrench,
  tokens: Coins,
  swap: ArrowRightLeft,
  nfts: Image,
  "dev-tools": Wrench,
  analytics: BarChart3,
} as const;

export default function ComponentsPage() {
  const t = useTranslations("components");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  const featuredComponents = useMemo(() => getFeaturedComponents(), []);

  const filteredComponents = useMemo(() => {
    let filtered = componentRegistry;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((component) => component.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((component) => {
        const haystack = [
          component.name,
          component.description,
          component.id,
          component.category,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      });
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const categoryOptions: SegmentedFilterOption[] = useMemo(
    () => [
      { value: "all", label: t("allCategories") },
      ...categories.map((category) => {
        const Icon = categoryIcons[category.id];

        return {
          value: category.id,
          label: (
            <span className="inline-flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              <span>{t(`categories.${category.id}`)}</span>
            </span>
          ),
        };
      }),
    ],
    [t]
  );

  const searchIconClass =
    locale === "ar"
      ? "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      : "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground";
  const searchInputClass = locale === "ar" ? "pr-10" : "pl-10";

  return (
    <PageShell
      hero={
        <PageHeader
          badge={{ variant: "brand", icon: Boxes, label: t("title") }}
          icon={<Sparkles className="h-5 w-5" />}
          title={t("title")}
          description={t("subtitle")}
          illustration={
            <div className="grid w-full gap-3 sm:grid-cols-2">
              <MarketplaceCard className="academy-pop-in rounded-[1.35rem] px-4 py-4">
                <div className="brand-pill w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {t("featuredComponents")}
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">{featuredComponents.length}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("featuredSubtitle")}</p>
              </MarketplaceCard>
              <MarketplaceCard className="academy-pop-in rounded-[1.35rem] px-4 py-4 [animation-delay:90ms]">
                <div className="brand-pill w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {t("allComponents")}
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">{componentRegistry.length}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("search.placeholder")}</p>
              </MarketplaceCard>
            </div>
          }
        />
      }
    >
      <div data-testid="components-catalog-toolbar">
        <FilterBar
          sticky
          className="catalog-toolbar"
          searchSlot={
            <div className="relative min-w-[min(100%,22rem)] flex-1">
              <Search className={searchIconClass} />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("search.placeholder")}
                aria-label={t("search.placeholder")}
                className={searchInputClass}
              />
            </div>
          }
          resultsSlot={
            <span>{t("resultsCount", { count: filteredComponents.length })}</span>
          }
          segmentsSlot={
            <SegmentedFilter
              ariaLabel={t("allCategories")}
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as CategoryFilter)}
              options={categoryOptions}
              className="w-full"
            />
          }
        />
      </div>

      {selectedCategory === "all" && !searchQuery.trim() ? (
        <section data-testid="components-featured-grid" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("featuredComponents")}</h2>
              <p className="text-sm text-muted-foreground">{t("featuredSubtitle")}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredComponents.map((component, index) => (
              <ComponentCard
                key={component.id}
                component={component}
                className={index === 0 ? "md:col-span-2 xl:col-span-1" : undefined}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section data-testid="components-results-grid" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {selectedCategory === "all"
                ? t("allComponents")
                : t(`categories.${selectedCategory}`)}
            </h2>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        {filteredComponents.length === 0 ? (
          <PremiumEmptyState
            icon={Search}
            title={t("empty.title")}
            description={t("empty.subtitle")}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                {t("empty.cta")}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredComponents.map((component) => (
              <ComponentCard key={component.id} component={component} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
