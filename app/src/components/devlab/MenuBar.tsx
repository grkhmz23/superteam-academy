"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { getQuestByTrack } from "@/lib/data/devlab-quests";
import { useDevLabStore } from "@/lib/devlab/store";

export function MenuBar() {
  const t = useTranslations("devlab");
  const currentTrack = useDevLabStore((state) => state.currentTrack);
  const missionIndex = useDevLabStore((state) => state.currentMissionIndex);
  const totalXP = useDevLabStore((state) => state.totalXP);
  const sessionStartTime = useDevLabStore((state) => state.sessionStartTime);

  const quest = getQuestByTrack(currentTrack);
  const mission = quest.missions[missionIndex];
  const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");

  const menus = useMemo(() => ["File", "Edit", "View", "Terminal", "Help"], []);

  return (
    <div className="ide-toolbar flex h-11 items-center px-3 text-xs">
      <div className="flex items-center gap-4">
        {menus.map((menu) => (
          <button key={menu} className="rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground">
            {menu}
          </button>
        ))}
      </div>
      <div className="flex-1 text-center font-medium text-foreground">{t("title")}</div>
      <div className="flex items-center gap-4 text-[11px]">
        <span className="max-w-[220px] truncate text-primary">{mission?.title ?? t("title")}</span>
        <span className="text-emerald-600 dark:text-emerald-300">{totalXP} XP</span>
        <span className="text-amber-600 dark:text-amber-300">
          {minutes}:{seconds}
        </span>
      </div>
    </div>
  );
}
