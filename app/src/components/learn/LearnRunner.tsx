"use client";

import dynamic from "next/dynamic";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { get, set } from "idb-keyval";
import { LessonHeader } from "@/components/lessons/LessonHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { lessonMdxComponents } from "@/components/learn/mdx-components";
import {
  LearnRuntimeProvider,
  type LearnRuntimeContextValue,
} from "@/components/learn/runtime-context";
import { CourseManifest, Lesson } from "@/lib/courses/manifest";
import {
  computeObjectiveStatuses,
  ObjectiveDefinition,
} from "@/lib/objectives";
import {
  createInitialTerminalState,
  runTerminalCommand,
  TerminalSimState,
} from "@/lib/terminal-sim";
import {
  applyPatch,
  createSnapshot,
  listFiles,
  loadWorkspace,
  readFile,
  replaceWorkspace,
  WorkspaceDocument,
} from "@/lib/workspace";

import { configureMonacoLoader } from "@/lib/monaco-loader";

const MonacoEditor = dynamic(
  () => {
    configureMonacoLoader();
    return import("@monaco-editor/react");
  },
  { ssr: false }
);

type LearnProgress = {
  currentLessonId: string;
  quizResults: Record<string, boolean>;
  checkpointSeen: Record<string, boolean>;
};

function progressKey(userId: string, courseId: string): string {
  return `learn-progress:${userId}:${courseId}`;
}

function objectivesForLesson(lesson: Lesson): ObjectiveDefinition[] {
  const terminalObjectives = lesson.objectives
    .filter((objective) => objective.type === "terminal")
    .map((objective, index) => ({
      id: objective.id,
      type: "TerminalCommandExecuted" as const,
      commandPattern: new RegExp(
        `^${(lesson.terminalScript?.[index]?.command ?? "").replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}`
      ),
    }));

  const fileObjectives = lesson.objectives
    .filter((objective) => objective.type === "file")
    .map((objective) => ({
      id: objective.id,
      type: "FileContains" as const,
      path: "src/main.ts",
      pattern: /\S+/,
    }));

  const quizObjectives = lesson.objectives
    .filter((objective) => objective.type === "quiz")
    .map((objective) => ({
      id: objective.id,
      type: "QuizPassed" as const,
      quizId: lesson.id,
    }));

  return [...terminalObjectives, ...fileObjectives, ...quizObjectives];
}

function languageFromPath(path: string): string {
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".toml")) return "ini";
  return "plaintext";
}

export function LearnRunner({
  manifest,
  mdxByLesson,
}: {
  manifest: CourseManifest;
  mdxByLesson: Record<string, MDXRemoteSerializeResult>;
}) {
  const t = useTranslations("lesson");
  const tp = useTranslations("playground");
  const { data: session } = useSession();
  const userId = session?.user?.email ?? "anonymous";
  const [workspace, setWorkspace] = useState<WorkspaceDocument | null>(null);
  const [activeFile, setActiveFile] = useState<string>("src/main.ts");
  const [currentLessonId, setCurrentLessonId] = useState<string>(manifest.lessons[0]?.id ?? "");
  const [terminalState, setTerminalState] = useState<TerminalSimState>(createInitialTerminalState());
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "Solana terminal simulator ready.",
  ]);
  const [lastCommand, setLastCommand] = useState<string>("");
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [runnerJobResults, setRunnerJobResults] = useState<Record<string, boolean>>({});
  const [confirmedSignatures, setConfirmedSignatures] = useState<string[]>([]);
  const [deployedProgramIds, setDeployedProgramIds] = useState<string[]>([]);
  const [checkpointBanner, setCheckpointBanner] = useState<string | null>(null);
  const [checkpointSeen, setCheckpointSeen] = useState<Record<string, boolean>>({});
  const [importUrl, setImportUrl] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string>("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const doc = await loadWorkspace(userId, manifest.slug);
      if (!mounted) return;
      setWorkspace(doc);

      const progress = await get<LearnProgress>(progressKey(userId, manifest.slug));
      if (!progress) return;
      if (progress.currentLessonId) {
        setCurrentLessonId(progress.currentLessonId);
      }
      setQuizResults(progress.quizResults ?? {});
      setCheckpointSeen(progress.checkpointSeen ?? {});
    };

    void boot();
    return () => {
      mounted = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [manifest.slug, userId]);

  useEffect(() => {
    const persist = async () => {
      const progress: LearnProgress = {
        currentLessonId,
        quizResults,
        checkpointSeen,
      };
      await set(progressKey(userId, manifest.slug), progress);
    };

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      void persist();
    }, 200);
  }, [currentLessonId, quizResults, checkpointSeen, userId, manifest.slug]);

  const lesson =
    manifest.lessons.find((item) => item.id === currentLessonId) ??
    manifest.lessons[0];

  const fileList = useMemo(() => {
    if (!workspace) return [];
    return listFiles(workspace.root).sort((a, b) => a.localeCompare(b));
  }, [workspace]);

  const filesMap = useMemo(() => {
    if (!workspace) return {};
    const map: Record<string, string> = {};
    fileList.forEach((filePath) => {
      map[filePath] = readFile(workspace.root, filePath) ?? "";
    });
    return map;
  }, [workspace, fileList]);

  const objectiveDefs = useMemo(() => objectivesForLesson(lesson), [lesson]);

  const objectiveStatuses = useMemo(
    () =>
      computeObjectiveStatuses(objectiveDefs, {
        lastCommand,
        terminalState,
        files: filesMap,
        quizResults,
        runnerJobResults,
        confirmedSignatures,
        deployedProgramIds,
      }),
    [
      objectiveDefs,
      lastCommand,
      terminalState,
      filesMap,
      quizResults,
      runnerJobResults,
      confirmedSignatures,
      deployedProgramIds,
    ]
  );

  const allObjectivesComplete =
    objectiveStatuses.length > 0 && objectiveStatuses.every((status) => status.complete);

  useEffect(() => {
    const notifyCheckpoint = async () => {
      if (!lesson.checkpointId || !allObjectivesComplete || checkpointSeen[lesson.checkpointId]) {
        return;
      }
      await createSnapshot(userId, manifest.slug, lesson.checkpointId);
      setCheckpointSeen((prev) => ({ ...prev, [lesson.checkpointId as string]: true }));
      setCheckpointBanner(`Checkpoint achieved: ${lesson.title}`);
      setTimeout(() => setCheckpointBanner(null), 2500);
    };

    void notifyCheckpoint();
  }, [allObjectivesComplete, checkpointSeen, lesson, manifest.slug, userId]);

  const updateWorkspaceFile = (path: string, content: string) => {
    if (!workspace) return;
    void applyPatch(userId, manifest.slug, [{ path, content }]).then((doc) => {
      setWorkspace(doc);
    });
  };

  const runtimeContext: LearnRuntimeContextValue = {
    getFileContent: (path) => filesMap[path] ?? "",
    updateFileContent: (path, content) => updateWorkspaceFile(path, content),
    runSnippet: (_path, code) => {
      setTerminalLines((prev) => [...prev, `snippet> executed (${code.length} chars)`]);
    },
    submitQuizResult: (quizId, passed) => {
      setQuizResults((prev) => ({ ...prev, [quizId]: passed }));
    },
    terminalState,
  };

  const currentLessonIndex = manifest.lessons.findIndex((item) => item.id === lesson.id);
  const nextLessonIndex = currentLessonIndex + 1;
  const previousLesson = currentLessonIndex > 0 ? manifest.lessons[currentLessonIndex - 1] : null;
  const nextLesson = nextLessonIndex < manifest.lessons.length ? manifest.lessons[nextLessonIndex] : null;

  return (
    <LearnRuntimeProvider value={runtimeContext}>
      <PageShell
        className="min-h-[calc(100vh-5rem)]"
        hero={
          <LessonHeader
            courseTitle={manifest.title}
            title={lesson.title}
            progressLabel={t("lessonProgress", {
              current: Math.max(1, currentLessonIndex + 1),
              total: manifest.lessons.length,
            })}
            progressValue={
              manifest.lessons.length > 0
                ? Math.round((Math.max(1, currentLessonIndex + 1) / manifest.lessons.length) * 100)
                : 0
            }
            meta={
              <Badge variant="outline" className="border-border/70 bg-background/80 text-muted-foreground">
                {lesson.type}
              </Badge>
            }
            actions={
              <div className="flex flex-wrap items-center gap-2">
                {previousLesson ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setCurrentLessonId(previousLesson.id)}>
                    {t("previousLesson")}
                  </Button>
                ) : null}
                {nextLesson ? (
                  <Button type="button" size="sm" onClick={() => setCurrentLessonId(nextLesson.id)}>
                    {t("nextLesson")}
                  </Button>
                ) : null}
              </div>
            }
          />
        }
        contentClassName="space-y-4"
      >
        {checkpointBanner ? (
          <div className="lesson-stage-panel rounded-[1.25rem] px-4 py-3 text-sm text-foreground">
            {checkpointBanner}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[16rem_minmax(0,1fr)_18rem]">
          <aside className="lesson-stage-panel rounded-[1.5rem] p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Files</p>
            <div className="mb-2 space-y-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  void replaceWorkspace(userId, manifest.slug, {
                    "src/main.ts": "console.log('hello solana');\n",
                    "Anchor.toml": "[provider]\ncluster = \"devnet\"\n",
                    "README.md": `# ${manifest.slug}\n\nStart your exercises in src/main.ts\n`,
                  }).then((doc) => {
                    setWorkspace(doc);
                    setImportStatus("Template loaded");
                  });
                }}
              >
                {t("startFromTemplate")}
              </Button>
              <input
                value={importUrl}
                onChange={(event) => setImportUrl(event.target.value)}
                className="w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                placeholder="https://github.com/owner/repo"
              />
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={() => {
                  void fetch("/api/runner/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ repoUrl: importUrl }),
                  })
                    .then(async (response) => {
                      const payload = (await response.json()) as {
                        files?: Record<string, string>;
                        error?: string;
                      };
                      if (!response.ok || !payload.files) {
                        throw new Error(payload.error ?? "Import failed");
                      }
                      return replaceWorkspace(userId, manifest.slug, payload.files);
                    })
                    .then((doc) => {
                      setWorkspace(doc);
                      setImportStatus("GitHub repository imported");
                    })
                    .catch((error: unknown) => {
                      setImportStatus(error instanceof Error ? error.message : "Import failed");
                    });
                }}
              >
                {t("importFromGithub")}
              </Button>
              {importStatus ? (
                <p className="text-[11px] text-muted-foreground">{importStatus}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              {fileList.map((path) => (
                <button
                  key={path}
                  type="button"
                  className={`block w-full rounded-2xl border px-3 py-2 text-start text-xs transition-colors ${
                    activeFile === path
                      ? "lesson-current-pill border-border/80"
                      : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/35 hover:text-foreground"
                  }`}
                  onClick={() => setActiveFile(path)}
                >
                  {path}
                </button>
              ))}
            </div>
          </aside>

          <main className="space-y-4">
            <div className="ide-surface overflow-hidden">
              <MonacoEditor
                path={activeFile}
                language={languageFromPath(activeFile)}
                theme="vs-dark"
                value={filesMap[activeFile] ?? ""}
                onChange={(value) => updateWorkspaceFile(activeFile, value ?? "")}
                options={{ automaticLayout: true, minimap: { enabled: false }, fontSize: 13 }}
              />
            </div>
            <SectionCard className="rounded-[1.5rem]" contentClassName="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-border/70 bg-muted/30 text-muted-foreground">
                  {manifest.lessons.length} {t("courseContent")}
                </Badge>
                <Badge variant="outline" className="border-border/70 bg-background/80 text-muted-foreground">
                  {t("autosaveEnabled")}
                </Badge>
              </div>
              <div className="max-h-[26rem] overflow-auto">
                <h2 className="mb-3 text-sm font-semibold text-foreground">{lesson.title}</h2>
                <article className="lesson-prose text-sm">
                  <MDXRemote {...mdxByLesson[lesson.id]} components={lessonMdxComponents} />
                </article>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {previousLesson ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setCurrentLessonId(previousLesson.id)}>
                    {t("previousLesson")}
                  </Button>
                ) : null}
                {nextLesson ? (
                  <Button type="button" size="sm" onClick={() => setCurrentLessonId(nextLesson.id)}>
                    {t("nextLesson")}
                  </Button>
                ) : null}
              </div>
            </SectionCard>
          </main>

          <aside className="lesson-stage-panel rounded-[1.5rem] p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Objectives</p>
            {(lesson.type === "multi-file-challenge" || lesson.type === "devnet-challenge") && (
              <div className="mb-3 space-y-2">
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    void fetch("/api/runner/job", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId,
                        courseId: manifest.slug,
                        jobType: "anchor_build",
                        files: filesMap,
                      }),
                    })
                      .then((response) => response.json())
                      .then((payload: { result?: { exitCode: number; stdout: string; stderr: string } }) => {
                        const passed = payload.result?.exitCode === 0;
                        setRunnerJobResults((prev) => ({ ...prev, anchor_build: passed }));
                        setTerminalLines((prev) => [
                          ...prev,
                          "[runner] anchor build",
                          payload.result?.stdout ?? "",
                          payload.result?.stderr ?? "",
                        ]);
                      });
                  }}
                >
                  {t("runAnchorBuild")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    void fetch("/api/runner/job", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId,
                        courseId: manifest.slug,
                        jobType: "anchor_test",
                        files: filesMap,
                      }),
                    })
                      .then((response) => response.json())
                      .then((payload: { result?: { exitCode: number; stdout: string; stderr: string; artifacts?: { txSignature?: string; programId?: string } } }) => {
                        const passed = payload.result?.exitCode === 0;
                        setRunnerJobResults((prev) => ({ ...prev, anchor_test: passed }));
                        const signature = payload.result?.artifacts?.txSignature;
                        const programId = payload.result?.artifacts?.programId;
                        if (signature) setConfirmedSignatures((prev) => [...prev, signature]);
                        if (programId) setDeployedProgramIds((prev) => [...prev, programId]);
                        setTerminalLines((prev) => [
                          ...prev,
                          "[runner] anchor test",
                          payload.result?.stdout ?? "",
                          payload.result?.stderr ?? "",
                        ]);
                      });
                  }}
                >
                  {t("runAnchorTest")}
                </Button>
              </div>
            )}
            <div className="space-y-2">
              {lesson.objectives.map((objective) => {
                const done = objectiveStatuses.find((status) => status.id === objective.id)?.complete ?? false;
                return (
                  <div
                    key={objective.id}
                    className={`rounded-2xl border p-3 text-xs ${
                      done
                        ? "border-border/80 bg-muted/40 text-foreground shadow-sm"
                        : "border-border/70 bg-background/70 text-muted-foreground"
                    }`}
                  >
                    <p>{objective.text}</p>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="xl:col-span-2">
            <div className="lesson-code-panel p-3">
              <div className="mb-3 h-[145px] overflow-auto rounded-2xl border border-border/70 bg-background/80 p-3 font-mono text-xs text-foreground">
                {terminalLines.map((line, idx) => (
                  <div key={`${line}-${idx}`}>{line}</div>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const command = terminalInput.trim();
                  if (!command) return;
                  const result = runTerminalCommand(terminalState, command);
                  setTerminalState(result.state);
                  setLastCommand(command);
                  setTerminalLines((prev) => [
                    ...prev,
                    `$ ${command}`,
                    ...(result.stdout ? [result.stdout] : []),
                    ...(result.stderr ? [result.stderr] : []),
                  ]);
                  setTerminalInput("");
                }}
              >
                <input
                  value={terminalInput}
                  onChange={(event) => setTerminalInput(event.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                  placeholder={t("runSimulatedCommands")}
                />
                <Button type="submit" size="sm">
                  {tp("run")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </PageShell>
    </LearnRuntimeProvider>
  );
}
