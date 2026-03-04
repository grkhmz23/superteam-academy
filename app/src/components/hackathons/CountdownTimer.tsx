"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Mins" },
    { value: timeLeft.seconds, label: "Secs" },
  ];

  return (
    <div className="flex gap-2">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <div className="bg-primary/10 rounded-lg px-3 py-2 text-center min-w-[60px]">
            <div className="text-xl font-bold text-primary">{unit.value.toString().padStart(2, "0")}</div>
            <div className="text-xs text-primary/70">{unit.label}</div>
          </div>
          {index < timeUnits.length - 1 && (
            <span className="text-xl font-bold mx-1">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
