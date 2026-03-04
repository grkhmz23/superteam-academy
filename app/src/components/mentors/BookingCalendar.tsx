"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
}

interface BookingCalendarProps {
  availability: TimeSlot[];
  onSelectSlot?: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

export function BookingCalendar({
  availability,
  onSelectSlot,
  selectedSlot,
}: BookingCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSlotsForDay = (date: Date) => {
    return availability.filter((slot) => isSameDay(slot.startTime, date));
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <Card className="transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Availability</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeek((prev) => addDays(prev, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeek((prev) => addDays(prev, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const slots = getSlotsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div key={day.toISOString()} className="text-center">
                <div
                  className={`text-xs font-medium mb-2 ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-sm mb-2 ${
                    isToday ? "font-bold text-primary" : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {slots.length === 0 ? (
                    <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">
                      —
                    </div>
                  ) : (
                    slots.map((slot) => (
                      <button
                        key={slot.id}
                        disabled={slot.isBooked}
                        onClick={() => onSelectSlot?.(slot)}
                        className={`w-full py-1 px-2 text-xs rounded transition-colors ${
                          slot.isBooked
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : selectedSlot?.id === slot.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-primary/10" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-muted" />
            <span>Booked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
