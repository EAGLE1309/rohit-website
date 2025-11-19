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

const ThemeSlider = ({ width = 225, height = 40 }: ThemeSliderProps) => {
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current theme index
  useEffect(() => {
    const currentIndex = themes.findIndex((t) => t.name === theme);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [theme]);

  // Auto-collapse after 3 seconds of inactivity
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isExpanded && !isDragging) {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetTimeout();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isExpanded, isDragging]);

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
    if (!isExpanded) return;
    setIsDragging(true);
    resetTimeout();
    const index = getThemeIndexFromPosition(e.clientX);
    setActiveIndex(index);
    setTheme(themes[index].name);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const index = getThemeIndexFromPosition(e.clientX);
      if (index !== activeIndex) {
        setActiveIndex(index);
        setTheme(themes[index].name);
      }
    },
    [isDragging, activeIndex, getThemeIndexFromPosition, setTheme]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      resetTimeout();
    }
  }, [isDragging]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isExpanded) return;
    setIsDragging(true);
    resetTimeout();
    const touch = e.touches[0];
    const index = getThemeIndexFromPosition(touch.clientX);
    setActiveIndex(index);
    setTheme(themes[index].name);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
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
    if (isDragging) {
      setIsDragging(false);
      resetTimeout();
    }
  }, [isDragging]);

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
    resetTimeout();
  };

  // Calculate dot sizes based on container height
  const activeDotSize = Math.max(12, height * 0.38);
  const inactiveDotSize = Math.max(5, height * 0.15);
  const gap = Math.max(4, height * 0.15);
  const padding = Math.max(12, height * 0.38);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) && !isDragging) {
        setIsExpanded(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded, isDragging]);

  const toggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      resetTimeout();
    }
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
      className={`flex items-center rounded-full cursor-pointer select-none overflow-hidden ${
        isExpanded
          ? `transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`
          : "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
      }`}
      style={{
        width: isExpanded ? `${width}px` : `${activeDotSize}px`,
        height: isExpanded ? `${height}px` : `${activeDotSize}px`,
        gap: isExpanded ? `${gap}px` : "0px",
        padding: isExpanded ? `0 ${padding}px` : "0",
        justifyContent: isExpanded ? "flex-start" : "center",
        backgroundColor: isExpanded ? undefined : "transparent",
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
              className={`rounded-full transition-all duration-150 ease-out flex-shrink-0 ${isActive ? "bg-foreground" : "bg-foreground/40"}`}
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
          className="rounded-full bg-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            width: `${activeDotSize}px`,
            height: `${activeDotSize}px`,
          }}
        />
      )}
    </div>
  );
};

export default ThemeSlider;
