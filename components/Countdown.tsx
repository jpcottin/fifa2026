"use client";

import { useEffect, useState } from "react";

export function Countdown({ deadlineMs }: { deadlineMs: number }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadlineMs - now;

      if (distance < 0) {
        setTimeLeft("Submissions closed");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`you have still ${days} days ${hours} hours to cast your selections`);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineMs]);

  if (!timeLeft) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium animate-pulse">
      {timeLeft}
    </div>
  );
}
