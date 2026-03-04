"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/lib/playground/types";
import { cn } from "@/lib/utils";

interface EditorPaneProps {
  workspace: Workspace;
  onChangeContent: (path: string, content: string) => void;
  onActivateFile: (path: string) => void;
  onCloseFile: (path: string) => void;
}

export function EditorPane({ workspace, onChangeContent, onActivateFile, onCloseFile }: EditorPaneProps) {
  const t = useTranslations("playground");
  const file = workspace.files[workspace.activeFile];

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
        {t("noActiveFile")}
      </div>
    );
  }

  return (
    <section className="ide-panel flex h-full min-h-0 flex-col" aria-label={t("editorPaneAriaLabel")}>
      <div className="ide-toolbar flex min-h-11 items-center overflow-x-auto px-2">
        {workspace.openFiles.map((path) => {
          const isActive = path === workspace.activeFile;
          const name = path.split("/").pop() ?? path;
          return (
            <div
              key={path}
              className={cn(
                "mr-1 flex items-center rounded-t-lg px-2 py-1 text-xs",
                isActive ? "ide-tab-active" : "ide-tab hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <button
                type="button"
                className="max-w-44 truncate text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => onActivateFile(path)}
                aria-current={isActive ? "page" : undefined}
              >
                {name}
                {workspace.files[path]?.readOnly ? " (ro)" : ""}
              </button>
              {workspace.openFiles.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-5 w-5 text-muted-foreground hover:text-foreground"
                  aria-label={`Close ${name}`}
                  onClick={() => onCloseFile(path)}
                >
                  <X className="h-3 w-3" />
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="min-h-0 flex-1">
        <CodeEditor
          language={file.language}
          defaultValue={file.content}
          value={file.content}
          onChange={(value) => onChangeContent(file.path, value)}
          theme="vs-dark"
          readOnly={Boolean(file.readOnly)}
        />
      </div>
    </section>
  );
}
