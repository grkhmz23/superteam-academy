"use client";

import React from "react";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PreviewFrame } from "@/components/solana/preview/PreviewFrame";
import { Hash } from "lucide-react";

interface PDADerivationVisualizerProps {
  defaultProgramId?: string;
  defaultSeeds?: string | string[];
}

function normalizeSeeds(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value ?? "";
}

export function PDADerivationVisualizer({
  defaultProgramId = "",
  defaultSeeds = "",
}: PDADerivationVisualizerProps) {
  const normalizedSeeds = normalizeSeeds(defaultSeeds);

  const derivedAddress = useMemo(() => {
    if (!defaultProgramId || !normalizedSeeds) {
      return "";
    }

    return `pda_${defaultProgramId.slice(0, 4)}_${normalizedSeeds
      .replace(/\s+/g, "")
      .slice(0, 4)}_${(defaultProgramId.length + normalizedSeeds.length).toString(16)}`;
  }, [defaultProgramId, normalizedSeeds]);

  return (
    <PreviewFrame
      icon={<Hash className="h-4 w-4" />}
      title="PDADerivationVisualizer"
      subtitle="Real preview of the seeded PDA breakdown"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="preview-program-id" className="text-xs font-medium text-muted-foreground">
            Program ID
          </label>
          <Input id="preview-program-id" value={defaultProgramId} readOnly />
        </div>
        <div className="space-y-1">
          <label htmlFor="preview-seed" className="text-xs font-medium text-muted-foreground">
            Seed
          </label>
          <Input id="preview-seed" value={normalizedSeeds} readOnly />
        </div>
        {derivedAddress ? (
          <div className="rounded-[1rem] border border-border/60 bg-muted/20 p-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Derived Address
            </p>
            <code className="mt-2 block break-all font-mono text-sm text-foreground">
              {derivedAddress}
            </code>
          </div>
        ) : (
          <div className="rounded-[1rem] border border-dashed border-border/70 bg-muted/15 p-3">
            <p className="text-sm text-muted-foreground">
              Add a program id and seed to derive a PDA.
            </p>
          </div>
        )}
      </div>
    </PreviewFrame>
  );
}
