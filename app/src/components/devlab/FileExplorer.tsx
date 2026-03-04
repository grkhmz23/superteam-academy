"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, FileCode2, FileJson, FileText, Folder, FolderOpen } from "lucide-react";
import { useDevLabStore } from "@/lib/devlab/store";
import { VFSNode } from "@/lib/devlab/types";

function iconFor(path: string) {
  if (path.endsWith(".rs")) return <FileCode2 className="h-3.5 w-3.5 text-[#CE422B]" />;
  if (path.endsWith(".toml")) return <FileText className="h-3.5 w-3.5 text-[#a0a0a0]" />;
  if (path.endsWith(".ts")) return <FileCode2 className="h-3.5 w-3.5 text-[#3178C6]" />;
  if (path.endsWith(".json")) return <FileJson className="h-3.5 w-3.5 text-[#F5C518]" />;
  if (path.endsWith(".md")) return <FileText className="h-3.5 w-3.5 text-[#ffffff]" />;
  return <FileText className="h-3.5 w-3.5 text-[#cccccc]" />;
}

type MenuState = {
  x: number;
  y: number;
  path: string;
} | null;

function getNode(root: VFSNode, path: string): VFSNode | null {
  const parts = path.split("/").filter(Boolean);
  let current: VFSNode = root;
  for (const part of parts) {
    if (current.type !== "directory") return null;
    const next = current.children?.[part];
    if (!next) return null;
    current = next;
  }
  return current;
}

export function FileExplorer() {
  const t = useTranslations("playground");
  const vfs = useDevLabStore((state) => state.vfs);
  const openFile = useDevLabStore((state) => state.openFile);
  const createVfsFile = useDevLabStore((state) => state.createVfsFile);
  const createVfsDir = useDevLabStore((state) => state.createVfsDir);
  const deleteVfsNode = useDevLabStore((state) => state.deleteVfsNode);
  const activeFile = useDevLabStore((state) => state.activeFile);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState<MenuState>(null);

  const root = useMemo(() => getNode(vfs, "/my-solana-project"), [vfs]);

  if (!root || root.type !== "directory") {
    return <div className="h-full bg-muted/30 p-3 text-xs text-muted-foreground">{t("noFilesLoaded")}</div>;
  }

  const toggle = (path: string) => {
    setCollapsed((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const createPath = (dirPath: string, name: string, isDir: boolean) => {
    const target = `${dirPath}/${name}`.replace(/^\//, "");
    if (isDir) {
      createVfsDir(target);
    } else {
      createVfsFile(target);
      openFile(target);
    }
  };

  const renderNode = (node: VFSNode, parentPath: string) => {
    if (node.type !== "directory") return null;
    const entries = Object.values(node.children ?? {}).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });

    return entries.map((child) => {
      const path = `${parentPath}/${child.name}`;
      if (child.type === "directory") {
        const isCollapsed = collapsed[path] ?? false;
        return (
          <div key={path}>
            <button
              type="button"
              className="flex w-full items-center gap-1 rounded-lg px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              onClick={() => toggle(path)}
              onContextMenu={(event) => {
                event.preventDefault();
                setMenu({ x: event.clientX, y: event.clientY, path });
              }}
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {isCollapsed ? <Folder className="h-3.5 w-3.5 text-[#dcb67a]" /> : <FolderOpen className="h-3.5 w-3.5 text-[#dcb67a]" />}
              <span className="truncate">{child.name}</span>
            </button>
            {!isCollapsed && <div className="pl-4">{renderNode(child, path)}</div>}
          </div>
        );
      }

      const selected = activeFile === path.replace(/^\//, "");
      return (
        <button
          type="button"
          key={path}
          className={`flex w-full items-center gap-1 rounded-lg px-2 py-1 text-left text-xs transition-colors hover:bg-accent/60 ${
            selected ? "bg-accent/70" : ""
          } ${child.modified ? "font-semibold" : "font-normal"}`}
          onClick={() => openFile(path.replace(/^\//, ""))}
          onContextMenu={(event) => {
            event.preventDefault();
            setMenu({ x: event.clientX, y: event.clientY, path });
          }}
        >
          <span>{iconFor(path)}</span>
          <span className="truncate text-foreground">{child.name}</span>
        </button>
      );
    });
  };

  return (
    <div className="relative h-full overflow-auto bg-muted/30 py-2" onClick={() => setMenu(null)}>
      <div className="px-3 pb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Explorer</div>
      {renderNode(root, "/my-solana-project")}

      {menu && (
        <div
          className="fixed z-50 w-40 rounded-xl border border-border bg-popover p-1 text-xs text-popover-foreground shadow-lg"
          style={{ left: menu.x, top: menu.y }}
        >
          <button
            type="button"
            className="block w-full rounded-lg px-2 py-1 text-left hover:bg-accent"
            onClick={() => {
              const name = window.prompt("New file name");
              if (name) createPath(menu.path, name, false);
              setMenu(null);
            }}
          >
            {t("newFile")}
          </button>
          <button
            type="button"
            className="block w-full rounded-lg px-2 py-1 text-left hover:bg-accent"
            onClick={() => {
              const name = window.prompt("New folder name");
              if (name) createPath(menu.path, name, true);
              setMenu(null);
            }}
          >
            {t("newFolder")}
          </button>
          <button
            type="button"
            className="block w-full rounded-lg px-2 py-1 text-left text-destructive hover:bg-accent"
            onClick={() => {
              deleteVfsNode(menu.path.replace(/^\//, ""));
              setMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
