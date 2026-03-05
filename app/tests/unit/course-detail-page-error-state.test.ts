// @vitest-environment jsdom

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CourseDetailPage from "@/app/[locale]/courses/[slug]/page";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "solana-fundamentals" }),
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null }),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: (namespace: string) => {
    return (key: string, values?: Record<string, string | number>) => {
      const dictionary: Record<string, Record<string, string>> = {
        common: {
          error: "Something went wrong",
          retry: "Try again",
          noResults: "No results found",
          connectWallet: "Connect Wallet",
          back: "Back",
          free: "Free",
        },
        courses: {
          title: "Course Catalog",
          subtitle: "Course subtitle",
          searchPlaceholder: "Search courses...",
          signInToTrack: "Sign in to track progress",
          continue: "Continue",
          startCourse: "Start Course",
          enrolled: "Enrolled",
          enrollCTA: "Enroll",
        },
      };
      const value = dictionary[namespace]?.[key];
      if (!value) return key;
      if (!values) return value;
      return Object.entries(values).reduce(
        (acc, entry) => acc.replace(`{${entry[0]}}`, String(entry[1])),
        value
      );
    };
  },
}));

vi.mock("@solana/wallet-adapter-react", () => ({
  useConnection: () => ({ connection: {} }),
  useWallet: () => ({
    publicKey: null,
    connected: false,
    sendTransaction: vi.fn(),
  }),
}));

vi.mock("@solana/wallet-adapter-react-ui", () => ({
  useWalletModal: () => ({
    setVisible: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/use-progress", () => ({
  useProgress: () => ({
    progress: null,
    refresh: vi.fn(),
  }),
}));

describe("Course detail page fetch failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as unknown as { React?: typeof React }).React = React;
  });

  it("renders a retryable error empty state when the course API returns non-OK", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      } as Response)
    );

    render(React.createElement(CourseDetailPage));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/courses/solana-fundamentals?locale=en");
  });
});
