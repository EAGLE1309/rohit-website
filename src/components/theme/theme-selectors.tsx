"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { IconBolt, IconFlare, IconFlame } from "@tabler/icons-react";
import { Moon, Sun } from "lucide-react";

const themes = [
  { name: "dark", icon: Moon },
  { name: "light", icon: Sun },
  { name: "bolt", icon: IconBolt },
  { name: "red", icon: IconFlame },
  { name: "beige", icon: IconFlare },
];

const ThemeSelectors = () => {
  const [themeOpen, setThemeOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setThemeOpen(false);
  };

  const currentTheme = themes.find((t) => t.name === theme) || themes[1]; // default to light
  const otherThemes = themes.filter((t) => t.name !== theme);

  const CurrentIcon = currentTheme.icon;

  return (
    <div className="flex gap-3 relative items-center">
      {/* Toggle button */}
      <CurrentIcon onClick={() => setThemeOpen(!themeOpen)} className="w-8 h-8 p-1.5 rounded-md cursor-pointer hover:bg-zinc-100 transition-colors" />

      {/* Dropdown with other themes */}
      <div
        className={`absolute top-0 right-full flex gap-3 transform origin-right transition-all duration-300 ${
          themeOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 pointer-events-none"
        }`}
        style={{ marginRight: "0.5rem" }}
      >
        {otherThemes.map((t) => {
          const Icon = t.icon;
          return (
            <Icon key={t.name} onClick={() => handleThemeChange(t.name)} className="w-8 h-8 p-1.5 cursor-pointer rounded-md hover:bg-zinc-100" />
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelectors;
