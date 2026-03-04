"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MarketplaceCard } from "@/components/ui/marketplace-card";

interface ComponentErrorBoundaryProps {
  title: string;
  description: string;
  resetLabel: string;
  onReset?: () => void;
  children: React.ReactNode;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
}

export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  state: ComponentErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <MarketplaceCard className="rounded-[1.5rem] border-border/70 bg-card/95 p-6">
          <div className="space-y-3 text-center">
            <h3 className="text-base font-semibold text-foreground">{this.props.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{this.props.description}</p>
            <div className="flex items-center justify-center">
              <Button type="button" variant="outline" onClick={this.handleReset}>
                {this.props.resetLabel}
              </Button>
            </div>
          </div>
        </MarketplaceCard>
      );
    }

    return this.props.children;
  }
}
