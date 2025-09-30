"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Sun, Moon, SunMedium, Sunset } from "lucide-react";

/**
 * ThemeLevelToggle
 * - 5-level theme switcher built on Radix Slider
 * - Dots (ticks) on the track with filled/unfilled states
 * - Keyboard accessible (Left/Right, Home/End)
 * - Emits the selected theme key via onChange + applies it to <html data-theme="...">
 *
 * Usage:
 * <ThemeLevelToggle onChange={(theme)=>console.log(theme)} />
 *
 * Add the CSS variables shown at the bottom into your globals.css (or tailwind base layer)
 */
export default function ThemeSlider({
  defaultLevel = 0,
  onChange,
  className,
}: {
  defaultLevel?: number;
  onChange?: (themeKey: ThemeKey) => void;
  className?: string;
}) {
  // 5 theme stops
  const LEVELS: ThemeDef[] = [
    { key: "light", label: "Light", icon: Sun },
    { key: "warm", label: "Warm", icon: SunMedium },
    { key: "sepia", label: "Sepia", icon: Sunset },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "midnight", label: "Midnight", icon: Moon },
  ];

  const [value, setValue] = React.useState<number[]>([defaultLevel]);
  const index = value[0];
  const clamped = Math.max(0, Math.min(LEVELS.length - 1, index));
  const active = LEVELS[clamped];

  React.useEffect(() => {
    // Apply theme to <html>
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", active.key);
    }
    onChange?.(active.key);
  }, [clamped]);

  return (
    <div className={"w-full max-w-sm select-none " + (className ?? "")}>
      <div className="relative py-4">
        {/* Dots layer */}
        <div className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2">
          <div className="relative h-2">
            {LEVELS.map((_, i) => {
              const left = (i / (LEVELS.length - 1)) * 100;
              const filled = i <= clamped;
              return (
                <span
                  key={i}
                  className={
                    "absolute -top-[6px] size-3 -translate-x-1/2 rounded-full border " +
                    (filled ? "bg-primary border-primary shadow-[0_0_0_2px_rgba(0,0,0,0.06)]" : "bg-background border-border")
                  }
                  style={{ left: `${left}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Slider */}
        <SliderPrimitive.Root
          className="relative flex h-8 w-full touch-none items-center"
          min={0}
          max={LEVELS.length - 1}
          step={1}
          value={value}
          onValueChange={setValue}
          aria-label="Theme level"
        >
          <SliderPrimitive.Track className="relative mx-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            {/* Filled track */}
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block size-5 rounded-full border border-border bg-background shadow transition-transform data-[state=active]:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </SliderPrimitive.Root>

        {/* Labels under dots */}
        <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
          {LEVELS.map((lvl, i) => (
            <button
              key={lvl.key}
              type="button"
              onClick={() => setValue([i])}
              className={"-mx-1 rounded px-1 py-0.5 transition-colors hover:text-foreground " + (i === clamped ? "text-foreground font-medium" : "")}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// — Types —
type ThemeKey = "light" | "warm" | "sepia" | "dark" | "midnight";
interface ThemeDef {
  key: ThemeKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
