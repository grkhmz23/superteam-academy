"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import type { Hackathon } from "./HackathonCard";

interface EventsCalendarProps {
  hackathons: Hackathon[];
  onSelectHackathon?: (hackathon: Hackathon) => void;
}

export function EventsCalendar({ hackathons, onSelectHackathon }: EventsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getHackathonsForDay = (day: Date) => {
    return hackathons.filter((h) => isSameDay(h.startDate, day));
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Events Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Header */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Days */}
          {days.map((day, dayIdx) => {
            const dayHackathons = getHackathonsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] bg-background p-2 ${
                  !isCurrentMonth ? "text-muted-foreground/50" : ""
                }`}
              >
                <span className="text-sm">{format(day, "d")}</span>
                <div className="mt-1 space-y-1">
                  {dayHackathons.map((hackathon) => (
                    <button
                      key={hackathon.id}
                      onClick={() => onSelectHackathon?.(hackathon)}
                      className="w-full text-left text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors truncate"
                    >
                      {hackathon.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
