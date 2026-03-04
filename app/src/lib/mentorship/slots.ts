export interface WeeklyTimeSlot {
  start: string;
  end: string;
}

export type WeeklyAvailability = Record<string, WeeklyTimeSlot[]>;

export interface ExistingMentorshipSession {
  scheduledAt: Date;
  duration: number;
  status?: string;
}

export interface GeneratedBookableSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: false;
}

interface GenerateBookableSlotsInput {
  availability: WeeklyAvailability;
  startDate: Date;
  now?: Date;
  days?: number;
  durationMinutes?: number;
  sessions?: ExistingMentorshipSession[];
}

const weekdayKeys = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function parseTimeOnDate(baseDate: Date, value: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const result = new Date(baseDate);
  result.setUTCHours(Number.parseInt(match[1], 10), Number.parseInt(match[2], 10), 0, 0);
  return result;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function generateBookableSlots({
  availability,
  startDate,
  now = new Date(),
  days = 14,
  durationMinutes = 60,
  sessions = [],
}: GenerateBookableSlotsInput): GeneratedBookableSlot[] {
  const slots: GeneratedBookableSlot[] = [];
  const activeSessions = sessions.filter(
    (session) => !session.status || ["scheduled", "in_progress"].includes(session.status)
  );

  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(startDate);
    day.setUTCDate(day.getUTCDate() + offset);

    const weekday = weekdayKeys[day.getUTCDay()];
    const windows = availability[weekday] ?? [];

    for (const window of windows) {
      const windowStart = parseTimeOnDate(day, window.start);
      const windowEnd = parseTimeOnDate(day, window.end);
      if (!windowStart || !windowEnd || windowEnd <= windowStart) {
        continue;
      }

      for (
        let pointer = new Date(windowStart);
        pointer.getTime() + durationMinutes * 60_000 <= windowEnd.getTime();
        pointer = new Date(pointer.getTime() + durationMinutes * 60_000)
      ) {
        const slotStart = new Date(pointer);
        const slotEnd = new Date(pointer.getTime() + durationMinutes * 60_000);

        if (slotStart < now) {
          continue;
        }

        const isConflicting = activeSessions.some((session) => {
          const sessionStart = new Date(session.scheduledAt);
          const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60_000);
          return overlaps(slotStart, slotEnd, sessionStart, sessionEnd);
        });

        if (isConflicting) {
          continue;
        }

        slots.push({
          id: `${slotStart.toISOString()}-${durationMinutes}`,
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: false,
        });
      }
    }
  }

  return slots;
}
