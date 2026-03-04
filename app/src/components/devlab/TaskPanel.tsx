"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, Lightbulb, Pencil, TerminalSquare } from "lucide-react";
import { getQuestByTrack } from "@/lib/data/devlab-quests";
import { evaluateMission } from "@/lib/devlab/quest-engine";
import { useDevLabStore } from "@/lib/devlab/store";

function difficultyColor(value: "easy" | "medium" | "hard") {
  if (value === "easy") return "bg-emerald-400";
  if (value === "medium") return "bg-amber-300";
  return "bg-red-400";
}

export function TaskPanel() {
  const t = useTranslations("devlab");
  const currentTrack = useDevLabStore((state) => state.currentTrack);
  const missionIndex = useDevLabStore((state) => state.currentMissionIndex);
  const objectiveStatus = useDevLabStore((state) => state.objectiveStatus);
  const missionStats = useDevLabStore((state) => state.missionStats);
  const revealHint = useDevLabStore((state) => state.useHint);
  const nextMission = useDevLabStore((state) => state.nextMission);
  const completedMissions = useDevLabStore((state) => state.completedMissions);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  const quest = getQuestByTrack(currentTrack);
  const mission = quest.missions[missionIndex];
  const completion = evaluateMission(mission, objectiveStatus, missionStats);

  const revealed = useMemo(() => new Set(revealedHints), [revealedHints]);

  const completeCount = mission.objectives.filter((objective) => objectiveStatus[objective.id]).length;
  const progress = Math.floor((completeCount / mission.objectives.length) * 100);

  return (
    <div className="flex h-full flex-col bg-card text-foreground">
      <div className="border-b border-border/70 p-3">
        <p className="text-xs uppercase text-muted-foreground">{quest.title}</p>
        <p className="mt-1 text-sm font-semibold">
          Mission {missionIndex + 1} of {quest.missions.length}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-3">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold">{mission.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase text-black ${difficultyColor(mission.difficulty)}`}>
              {mission.difficulty}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{mission.description}</p>

          <div className="mt-3 space-y-2">
            {mission.objectives.map((objective) => {
              const done = objectiveStatus[objective.id];
              return (
                <div key={objective.id} className="flex items-start gap-2 text-xs">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {objective.type === "command" ? (
                    <TerminalSquare className="mt-0.5 h-3 w-3 text-sky-500" />
                  ) : (
                    <Pencil className="mt-0.5 h-3 w-3 text-amber-500" />
                  )}
                  <span className={done ? "text-emerald-500 line-through" : "text-foreground"}>{objective.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase">Hints</h4>
            <span className="text-[11px] text-muted-foreground">
              Hint {revealedHints.length}/{mission.hints.length}
            </span>
          </div>
          <button
            type="button"
            className="mb-2 flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent/50"
            onClick={() => {
              const hint = revealHint();
              if (hint) setRevealedHints((prev) => [...prev, hint]);
            }}
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            {t("showHint")}
          </button>

          <div className="space-y-1">
            {mission.hints.map((hint, idx) =>
              revealed.has(hint) ? (
                <div key={hint} className="rounded-lg border border-border/70 bg-card px-2 py-1 text-xs text-foreground">
                  {idx + 1}. {hint}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/70 bg-muted/20 p-3">
        <div className="mb-2 h-1.5 overflow-hidden rounded bg-muted">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
          <span>Time: {Math.floor((Date.now() - missionStats.startedAt) / 1000)}s</span>
          <span>Commands: {missionStats.commandsUsed}</span>
          <span>Hints: {missionStats.hintsUsed}</span>
          <span>Errors: {missionStats.errorsEncountered}</span>
        </div>
        <div className="mb-2 text-xs text-primary">Reward: {mission.xpReward} XP</div>
        <button
          type="button"
          disabled={!completion.complete}
          className="w-full rounded-lg border border-border bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => nextMission()}
        >
          {completion.complete ? "Next Mission" : "Complete objectives to continue"}
        </button>
        {completedMissions[mission.id] ? (
          <p className="mt-2 text-xs text-emerald-500">{mission.successMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
