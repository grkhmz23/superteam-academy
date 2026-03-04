"use client";

import { MouseEvent as ReactMouseEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Shield, TerminalSquare, Wrench, Coins, BookOpen, Key, Monitor } from "lucide-react";
import { devlabQuests } from "@/lib/data/devlab-quests";
import { useDevLabStore } from "@/lib/devlab/store";
import { DevLabEditor } from "@/components/devlab/DevLabEditor";
import { FileExplorer } from "@/components/devlab/FileExplorer";
import { MenuBar } from "@/components/devlab/MenuBar";
import { SimulatedTerminal } from "@/components/devlab/SimulatedTerminal";
import { TaskPanel } from "@/components/devlab/TaskPanel";

function TrackIcon({ track }: { track: string }) {
  if (track === "foundation") return <BookOpen className="h-10 w-10 text-amber-500" />;
  if (track === "builder") return <Wrench className="h-10 w-10 text-sky-500" />;
  if (track === "token") return <Coins className="h-10 w-10 text-yellow-500" />;
  if (track === "ops") return <TerminalSquare className="h-10 w-10 text-emerald-500" />;
  if (track === "pda") return <Key className="h-10 w-10 text-violet-500" />;
  if (track === "client") return <Monitor className="h-10 w-10 text-lime-500" />;
  return <Shield className="h-10 w-10 text-destructive" />;
}

export function DevLabLayout() {
  const t = useTranslations("playground");
  const panelSizes = useDevLabStore((state) => state.panelSizes);
  const setPanelSize = useDevLabStore((state) => state.setPanelSize);
  const selectTrack = useDevLabStore((state) => state.selectTrack);
  const trackSelected = useDevLabStore((state) => state.trackSelected);
  const completedMissions = useDevLabStore((state) => state.completedMissions);
  const [showTasksOnTablet, setShowTasksOnTablet] = useState(false);

  const builderComplete = useMemo(() => {
    return devlabQuests
      .find((quest) => quest.track === "builder")
      ?.missions.every((mission) => Boolean(completedMissions[mission.id]));
  }, [completedMissions]);

  const onResize = (
    event: ReactMouseEvent<HTMLDivElement>,
    key: "left" | "right" | "bottom",
    mode: "x" | "y"
  ) => {
    event.preventDefault();
    const start = mode === "x" ? event.clientX : event.clientY;
    const startValue = panelSizes[key];

    const onMove = (move: MouseEvent) => {
      const delta = (mode === "x" ? move.clientX : move.clientY) - start;
      const next = key === "right" ? startValue - delta : startValue + delta;
      const clamped = Math.max(key === "bottom" ? 180 : 180, Math.min(next, key === "bottom" ? 460 : 420));
      setPanelSize(key, clamped);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!trackSelected) {
    return (
      <div className="ide-shell h-full overflow-auto p-6">
        <h1 className="mb-2 text-2xl font-bold">{t("chooseYourTrack")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t("guidedMissionsSubtitle")}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {devlabQuests.map((quest) => {
            const locked = quest.track === "security" && !builderComplete;
            return (
              <button
                key={quest.id}
                type="button"
                disabled={locked}
                onClick={() => selectTrack(quest.track)}
                className="relative rounded-2xl border border-border bg-card/90 p-4 text-left text-foreground transition hover:border-primary/40 hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <TrackIcon track={quest.track} />
                  {locked ? <Lock className="h-4 w-4 text-destructive" /> : null}
                </div>
                <h2 className="text-lg font-semibold">{quest.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{quest.description}</p>
                <p className="mt-3 text-xs text-primary">{quest.missions.length} missions</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="ide-shell h-full">
      <div
        className="hidden h-full lg:grid"
        style={{
          gridTemplateColumns: `${panelSizes.left}px 4px 1fr 4px ${panelSizes.right}px`,
          gridTemplateRows: "36px 1fr 4px 250px",
        }}
      >
        <div style={{ gridColumn: "1 / 6", gridRow: "1" }}>
          <MenuBar />
        </div>

        <div style={{ gridColumn: "1", gridRow: "2" }}>
          <FileExplorer />
        </div>
        <div
          className="cursor-col-resize bg-border/70 transition-colors hover:bg-primary/40"
          style={{ gridColumn: "2", gridRow: "2 / 5" }}
          onMouseDown={(event) => onResize(event, "left", "x")}
        />
        <div style={{ gridColumn: "3", gridRow: "2" }}>
          <DevLabEditor />
        </div>
        <div
          className="cursor-col-resize bg-border/70 transition-colors hover:bg-primary/40"
          style={{ gridColumn: "4", gridRow: "1 / 5" }}
          onMouseDown={(event) => onResize(event, "right", "x")}
        />
        <div style={{ gridColumn: "5", gridRow: "2 / 5" }}>
          <TaskPanel />
        </div>

        <div
          className="cursor-row-resize bg-border/70 transition-colors hover:bg-primary/40"
          style={{ gridColumn: "1 / 4", gridRow: "3" }}
          onMouseDown={(event) => onResize(event, "bottom", "y")}
        />
        <div style={{ gridColumn: "1 / 4", gridRow: "4", height: `${panelSizes.bottom}px` }}>
          <SimulatedTerminal />
        </div>
      </div>

      <div className="hidden h-full md:flex lg:hidden flex-col">
        <MenuBar />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-border/70">
            <FileExplorer />
          </div>
          <div className="flex-1">
            <DevLabEditor />
          </div>
        </div>
        <div className="h-60 border-t border-border/70">
          <SimulatedTerminal />
        </div>
        <button
          type="button"
          className="absolute right-4 top-12 z-20 rounded-lg border border-border bg-card px-3 py-1 text-xs text-foreground shadow-sm"
          onClick={() => setShowTasksOnTablet(true)}
        >
          Tasks
        </button>
        {showTasksOnTablet ? (
          <div className="absolute inset-y-0 right-0 z-30 w-80 border-l border-border/70 bg-card shadow-2xl">
            <button
              type="button"
              className="absolute right-2 top-2 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              onClick={() => setShowTasksOnTablet(false)}
            >
              Close
            </button>
            <TaskPanel />
          </div>
        ) : null}
      </div>

      <div className="flex h-full flex-col md:hidden">
        <MenuBar />
        <div className="grid flex-1 grid-rows-3">
          <div className="border-b border-border/70"><DevLabEditor /></div>
          <div className="border-b border-border/70"><SimulatedTerminal /></div>
          <TaskPanel />
        </div>
      </div>
    </div>
  );
}
