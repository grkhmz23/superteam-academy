"use client";

import { FormEvent, KeyboardEvent, ReactNode, Ref, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteResult, TerminalEntry } from "@/lib/playground";

interface TerminalPaneProps {
  entries: TerminalEntry[];
  commandHistory: string[];
  onRunCommand: (command: string) => void;
  onAutocomplete: (input: string) => AutocompleteResult;
  onApplySuggestion: (input: string, replacement: string, suggestion: string) => string;
  inputRef?: Ref<HTMLInputElement>;
  topPanel?: ReactNode;
}

export function TerminalPane({
  entries,
  commandHistory,
  onRunCommand,
  onAutocomplete,
  onApplySuggestion,
  inputRef,
  topPanel,
}: TerminalPaneProps) {
  const t = useTranslations("playground");
  const tc = useTranslations("common");
  const [command, setCommand] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const reversedHistory = useMemo(() => [...commandHistory].reverse(), [commandHistory]);
  const autocomplete = useMemo(() => onAutocomplete(command), [onAutocomplete, command]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = command.trim();
    if (!next) {
      return;
    }

    onRunCommand(next);
    setCommand("");
    setHistoryIndex(-1);
    setSuggestionIndex(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = Math.min(historyIndex + 1, reversedHistory.length - 1);
      if (nextIndex >= 0 && reversedHistory[nextIndex]) {
        setHistoryIndex(nextIndex);
        setCommand(reversedHistory[nextIndex]);
        setSuggestionIndex(-1);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0 && reversedHistory[nextIndex]) {
        setHistoryIndex(nextIndex);
        setCommand(reversedHistory[nextIndex]);
        setSuggestionIndex(-1);
        return;
      }

      setHistoryIndex(-1);
      setCommand("");
      return;
    }

    if (event.key === "Tab") {
      if (autocomplete.suggestions.length === 0) {
        return;
      }
      event.preventDefault();
      const nextIndex = (suggestionIndex + 1) % autocomplete.suggestions.length;
      const suggestion = autocomplete.suggestions[nextIndex];
      const nextValue = onApplySuggestion(command, autocomplete.replacement, suggestion);
      setCommand(nextValue);
      setSuggestionIndex(nextIndex);
      return;
    }

    if (event.key === "Enter" && suggestionIndex >= 0 && autocomplete.suggestions[suggestionIndex]) {
      const nextValue = onApplySuggestion(
        command,
        autocomplete.replacement,
        autocomplete.suggestions[suggestionIndex]
      );
      if (nextValue !== command) {
        event.preventDefault();
        setCommand(nextValue);
        setSuggestionIndex(-1);
      }
    }
  };

  return (
    <section className="ide-panel flex h-full min-h-0 flex-col font-mono" aria-label={t("terminalPanelAriaLabel")}>
      <div className="ide-toolbar px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
        {t("terminalPanelAriaLabel")}
      </div>
      {topPanel ? <div className="border-b border-border/70 bg-muted/30 p-3">{topPanel}</div> : null}
      <div className="min-h-0 flex-1 space-y-1 overflow-auto bg-muted/20 p-3 text-xs" role="log" aria-live="polite">
        {entries.map((entry) => (
          <p
            key={entry.id}
            className={
              entry.kind === "input"
                ? "text-primary"
                : entry.kind === "system"
                  ? "text-amber-600 dark:text-amber-300"
                  : entry.kind === "error"
                    ? "text-destructive"
                    : "text-foreground"
            }
          >
            {entry.text}
          </p>
        ))}
      </div>
      <div className="border-t border-border/70 bg-card px-2 pt-1">
        {autocomplete.suggestions.length > 0 ? (
          <p className="truncate pb-1 text-[11px] text-muted-foreground" aria-live="polite">
            {autocomplete.suggestions.slice(0, 6).join("  ")}
          </p>
        ) : null}
      </div>
      <form className="flex items-center gap-2 border-t border-border/70 bg-card p-2" onSubmit={submit}>
        <span className="text-xs text-primary" aria-hidden>
          $
        </span>
        <Input
          ref={inputRef}
          value={command}
          onChange={(event) => {
            setCommand(event.target.value);
            setSuggestionIndex(-1);
          }}
          onKeyDown={onKeyDown}
          aria-label={t("terminalCommandInputAriaLabel")}
          className="h-8 border-border bg-background/70 text-xs text-foreground placeholder:text-muted-foreground"
          placeholder={t("terminalCommandInputPlaceholder")}
        />
        <Button type="submit" size="sm">
          {tc("run")}
        </Button>
      </form>
    </section>
  );
}
