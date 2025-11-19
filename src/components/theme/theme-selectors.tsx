"use client";

import { useTheme } from "next-themes";
import { IconFlare, IconSun, IconMoon } from "@tabler/icons-react";
import { useRef, useEffect, useState, useCallback } from "react";

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

interface ThemeSliderProps {
  width?: number; // Width in pixels
  height?: number; // Height in pixels
}

const ThemeSlider = ({ width = 250, height = 40 }: ThemeSliderProps) => {
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current theme index
  useEffect(() => {
    const currentIndex = themes.findIndex((t) => t.name === theme);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [theme]);

  // Calculate theme index from cursor position
  const getThemeIndexFromPosition = (clientX: number) => {
    if (!containerRef.current) return activeIndex;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(percentage * (themes.length - 1));

    return Math.max(0, Math.min(themes.length - 1, index));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const index = getThemeIndexFromPosition(e.clientX);
    setActiveIndex(index);
    setTheme(themes[index].name);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const index = getThemeIndexFromPosition(e.clientX);
      if (index !== activeIndex) {
        setActiveIndex(index);
        setTheme(themes[index].name);
      }
    },
    [isDragging, activeIndex, getThemeIndexFromPosition, setTheme]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const index = getThemeIndexFromPosition(touch.clientX);
    setActiveIndex(index);
    setTheme(themes[index].name);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const index = getThemeIndexFromPosition(touch.clientX);
      if (index !== activeIndex) {
        setActiveIndex(index);
        setTheme(themes[index].name);
      }
    },
    [isDragging, activeIndex, getThemeIndexFromPosition, setTheme]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse/touch event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setTheme(themes[index].name);
  };

  // Calculate dot sizes based on container height
  const activeDotSize = Math.max(12, height * 0.4);
  const inactiveDotSize = Math.max(8, height * 0.25);
  const gap = Math.max(4, height * 0.1);
  const padding = Math.max(12, height * 0.3);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => {
        if (!isExpanded) {
          e.stopPropagation();
          toggleExpand();
        } else {
          handleMouseDown(e);
        }
      }}
      onTouchStart={(e) => {
        if (!isExpanded) {
          e.stopPropagation();
          toggleExpand();
        } else {
          handleTouchStart(e);
        }
      }}
      className={`flex items-center rounded-full cursor-pointer select-none transition-all duration-500 ease-in-out overflow-hidden ${
        theme === "dark" ? "bg-white/10" : "bg-black/10"
      }`}
      style={{
        width: isExpanded ? `${width}px` : `${height}px`,
        height: `${height}px`,
        gap: isExpanded ? `${gap}px` : "0px",
        padding: isExpanded ? `0 ${padding}px` : "0",
        justifyContent: isExpanded ? "flex-start" : "center",
      }}
    >
      {isExpanded ? (
        themes.map((t, index) => {
          const isActive = index === activeIndex;
          const dotSize = isActive ? activeDotSize : inactiveDotSize;

          return (
            <button
              key={t.name}
              onClick={() => handleDotClick(index)}
              className={`rounded-full transition-all duration-200 ease-out flex-shrink-0 ${isActive ? "bg-foreground" : "bg-foreground/40"}`}
              style={{
                width: `${dotSize}px`,
                height: `${dotSize}px`,
              }}
              aria-label={`Switch to ${t.name} theme`}
            />
          );
        })
      ) : (
        <div
          className="rounded-full bg-foreground transition-all duration-300"
          style={{
            width: `${Math.max(12, height * 0.4)}px`,
            height: `${Math.max(12, height * 0.4)}px`,
          }}
        />
      )}
    </div>
  );
};

export default ThemeSlider;
