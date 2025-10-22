"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { Moon, Sun } from "lucide-react";
import { IconFlame, IconBolt, IconFlare } from "@tabler/icons-react";

const themes = [
  { name: "dark", icon: Moon, reactNode: <Moon /> },
  { name: "light", icon: Sun, reactNode: <Sun /> },
  { name: "bolt", icon: IconBolt, reactNode: <IconBolt /> },
  { name: "red", icon: IconFlame, reactNode: <IconFlame /> },
  { name: "beige", icon: IconFlare, reactNode: <IconFlare /> },
];
const ThemeSlider = () => {
  const { theme, setTheme } = useTheme();
  const defaultIndex = themes.findIndex((t) => t.name === theme) || 1;
  const [sliderValue, setSliderValue] = useState(defaultIndex);

  useEffect(() => {
    setTheme(themes[sliderValue].name);
  }, [sliderValue]);

  const [themeOpen, setThemeOpen] = useState(false);
  const currentTheme = themes.find((t) => t.name === theme) || themes[1];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="flex gap-3 relative items-center">
      {/* Toggle button */}
      <CurrentIcon
        onClick={() => setThemeOpen(!themeOpen)}
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
