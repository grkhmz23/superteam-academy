import { describe, expect, it } from "vitest";
import { generateBookableSlots } from "@/lib/mentorship/slots";

describe("generateBookableSlots", () => {
  it("expands weekly availability into concrete future slots", () => {
    const slots = generateBookableSlots({
      availability: {
        monday: [{ start: "09:00", end: "11:00" }],
      },
      startDate: new Date("2026-03-02T00:00:00.000Z"),
      now: new Date("2026-03-02T08:00:00.000Z"),
      days: 1,
      durationMinutes: 60,
      sessions: [],
    });

    expect(slots).toHaveLength(2);
    expect(slots[0]?.startTime.toISOString()).toBe("2026-03-02T09:00:00.000Z");
    expect(slots[1]?.startTime.toISOString()).toBe("2026-03-02T10:00:00.000Z");
  });

  it("skips slots that overlap existing sessions", () => {
    const slots = generateBookableSlots({
      availability: {
        monday: [{ start: "09:00", end: "12:00" }],
      },
      startDate: new Date("2026-03-02T00:00:00.000Z"),
      now: new Date("2026-03-02T08:00:00.000Z"),
      days: 1,
      durationMinutes: 60,
      sessions: [
        {
          scheduledAt: new Date("2026-03-02T10:00:00.000Z"),
          duration: 60,
          status: "scheduled",
        },
      ],
    });

    expect(slots.map((slot) => slot.startTime.toISOString())).toEqual([
      "2026-03-02T09:00:00.000Z",
      "2026-03-02T11:00:00.000Z",
    ]);
  });
});
