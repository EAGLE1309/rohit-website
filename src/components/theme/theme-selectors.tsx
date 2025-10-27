"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { IconFlare, IconSun, IconMoon } from "@tabler/icons-react";

const themes = [
  { name: "dark", icon: IconMoon, reactNode: <IconMoon /> },
  { name: "one", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "two", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "three", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "four", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "five", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "six", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "seven", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "eight", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "nine", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "ten", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "eleven", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "twelve", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "thirteen", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "fourteen", icon: IconFlare, reactNode: <IconFlare /> },
  { name: "light", icon: IconSun, reactNode: <IconSun /> },
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const ThemeSlider = () => {
  const { theme, setTheme } = useTheme();

  // compute default index safely (handle -1 and 0 correctly)
  const initialIndex = (() => {
    const idx = themes.findIndex((t) => t.name === theme);
    // if not found or theme undefined, fallback to 1 (light)
    return idx === -1 ? 1 : idx;
  })();

  const [sliderValue, setSliderValue] = useState<number>(initialIndex);

  // whenever sliderValue changes, round & clamp before using it
  useEffect(() => {
    const idx = clamp(Math.round(sliderValue), 0, themes.length - 1);
    setTheme(themes[idx].name);
  }, [sliderValue]);

  const [themeOpen, setThemeOpen] = useState(false);
  const currentTheme = themes.find((t) => t.name === theme) || themes[1];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="flex gap-3 relative items-center">
      {/* Toggle button */}
      <CurrentIcon
        onClick={() => setThemeOpen((s) => !s)}
        className={`size-8 p-1 cursor-pointer hover:bg-black/5 rounded-full transition-colors ${
          themeOpen ? (theme === "dark" ? "bg-white/10" : "bg-black/5") : ""
        }`}
      />

      {/* Dropdown with other themes */}
      <div
        className={`absolute w-32 md:w-48 top-0 right-full flex gap-3 transform origin-right transition-all duration-300 ${
          themeOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 pointer-events-none"
        }`}
        style={{ marginRight: "0.5rem" }}
      >
        <Slider
          min={0}
          max={themes.length - 1}
          value={[sliderValue]}
          onValueChange={(val) => setSliderValue(val[0])}
          icons={themes.map((t) => t.reactNode)}
        />
      </div>
    </div>
  );
};

export default ThemeSlider;
