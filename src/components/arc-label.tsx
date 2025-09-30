/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

type ArcDayRingProps = {
  labels?: string[];
  centerText: string;
  arcDegrees?: number;
  rx?: number;
  ry?: number;
  minOpacity?: number;
  activeBoost?: number;

  // NEW: time & date helpers
  liveClock?: boolean; // show live time in center
  twelveHour?: boolean; // 12h vs 24h
  showSeconds?: boolean; // include seconds
  timeZone?: string; // e.g. "Asia/Kolkata"
  useWeekdayLabels?: boolean; // force labels to week days
  autoRotateTodayToTop?: boolean; // rotate labels so today is on top
};

export default function ArcLabel({
  labels = ["FRI", "SAT", "SUN", "MON", "TUE", "WED", "THU"],
  centerText,
  arcDegrees = 220,
  rx = 140,
  ry = 60,
  minOpacity = 0.25,
  activeBoost = 1.1,

  // defaults for new features
  liveClock = false,
  twelveHour = true,
  showSeconds = false,
  timeZone,
  useWeekdayLabels = false,
  autoRotateTodayToTop = false,
}: ArcDayRingProps) {
  // ---- NEW: live time (center) ----
  const [now, setNow] = React.useState<Date>(() => new Date());
  React.useEffect(() => {
    if (!liveClock) return;
    const tick = () => setNow(new Date());
    // update exactly at the start of each second or minute
    const initialDelay = showSeconds ? 1000 - (Date.now() % 1000) : 60000 - (Date.now() % 60000);
    const t0 = setTimeout(() => {
      tick();
      const id = setInterval(tick, showSeconds ? 1000 : 60000);
      // store id on window to clear when unmounting timeout scope ends
      (tick as any)._id = id;
    }, initialDelay);
    return () => {
      clearTimeout(t0);
      if ((tick as any)._id) clearInterval((tick as any)._id);
    };
  }, [liveClock, showSeconds]);

  const formattedTime = React.useMemo(() => {
    if (!liveClock) return centerText;
    const opts: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: twelveHour,
      ...(showSeconds ? { second: "2-digit" } : {}),
    };
    return new Intl.DateTimeFormat(undefined, { timeZone, ...opts }).format(now).toUpperCase();
  }, [liveClock, centerText, now, twelveHour, showSeconds, timeZone]);

  const weekdayLabels = React.useMemo(() => {
    if (!useWeekdayLabels) return labels;

    const base = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.UTC(2020, 5, 7 + i));
      return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d).toUpperCase();
    });

    return base.map((s) => s.replace(".", ""));
  }, [useWeekdayLabels, labels]);

  const rotatedLabels = React.useMemo(() => {
    if (!autoRotateTodayToTop || !useWeekdayLabels) return weekdayLabels;
    const todayIdx = new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone }).format(now).toUpperCase().replace(".", "");
    const idx = weekdayLabels.indexOf(todayIdx);
    if (idx < 0) return weekdayLabels;

    const mid = Math.floor(weekdayLabels.length / 2);
    const rotated = [...weekdayLabels];

    const shift = (mid - idx + weekdayLabels.length) % weekdayLabels.length;
    return rotated.map((_, i) => weekdayLabels[(i - shift + weekdayLabels.length) % weekdayLabels.length]);
  }, [autoRotateTodayToTop, useWeekdayLabels, weekdayLabels, now, timeZone]);

  const useLabels = useWeekdayLabels ? rotatedLabels : labels;

  const start = -90 - arcDegrees / 2;
  const end = -90 + arcDegrees / 2;
  const angles = useLabels.length <= 1 ? [-90] : useLabels.map((_, i) => start + (i * (end - start)) / (useLabels.length - 1));

  return (
    <div className="relative px-16 select-none">
      {/* Labels positioned along an ellipse */}
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;

        // Ellipse parametric coordinates (x right+, y down+)
        const x = rx * Math.cos(rad);
        const y = ry * Math.sin(rad);

        // Emphasis & fade based on distance from top (-90°)
        const dist = Math.abs(deg + 90);
        const t = Math.min(1, dist / (arcDegrees / 2)); // 0 at top, 1 at edges
        const opacity = (1 - t) * (1 - minOpacity) + minOpacity;
        const scale = 1 + (1 - t) * (activeBoost - 1);
        const isTop = t < 0.01;

        return (
          <div
            key={useLabels[i] + i}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
              transition: "transform 200ms ease, opacity 200ms ease",
              opacity,
            }}
          >
            <span className={`text-sm ${isTop ? "font-neue font-medium text-black" : "font-neue text-black/70"}`}>{useLabels[i]}</span>
          </div>
        );
      })}

      {/* Center text */}
      <div className="relative z-10 grid place-items-center">
        <span className="text-md font-medium font-neue">{formattedTime}</span>
      </div>
    </div>
  );
}
