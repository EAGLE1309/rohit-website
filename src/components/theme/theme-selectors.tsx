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
  onMobileExpandChange?: (expanded: boolean) => void;
}

const ThemeSlider = ({ width = 225, height = 40, onMobileExpandChange }: ThemeSliderProps) => {
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(true);
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const skipNextPointerRef = useRef(false);
  const mobileSelectionGuardRef = useRef(false);
  const mobileSelectionGuardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const themeChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activateMobileSelectionGuard = useCallback(() => {
    mobileSelectionGuardRef.current = true;
    if (mobileSelectionGuardTimeoutRef.current) {
      clearTimeout(mobileSelectionGuardTimeoutRef.current);
    }
    mobileSelectionGuardTimeoutRef.current = setTimeout(() => {
      mobileSelectionGuardRef.current = false;
      mobileSelectionGuardTimeoutRef.current = null;
    }, 250);
  }, []);

  // Debounced theme change for smoother transitions
  const debouncedSetTheme = useCallback(
    (themeName: string) => {
      if (themeChangeTimeoutRef.current) {
        clearTimeout(themeChangeTimeoutRef.current);
      }
      themeChangeTimeoutRef.current = setTimeout(() => {
        setTheme(themeName);
      }, 50);
    },
    [setTheme]
  );

  // Track viewport width for mobile detection
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportWidth <= 768;

  useEffect(() => {
    if (!onMobileExpandChange) return;
    onMobileExpandChange(isMobile ? isExpanded : false);
  }, [isExpanded, isMobile, onMobileExpandChange]);

  useEffect(() => {
    return () => {
      if (mobileSelectionGuardTimeoutRef.current) {
        clearTimeout(mobileSelectionGuardTimeoutRef.current);
      }
      if (themeChangeTimeoutRef.current) {
        clearTimeout(themeChangeTimeoutRef.current);
      }
    };
  }, []);

  // Check cookie on mount to see if user has interacted before
  useEffect(() => {
    const hasInteracted = document.cookie.includes("theme-slider-interacted=true");
    if (hasInteracted) {
      setShouldPulse(false);
    } else {
      // Start pulsing every 5 seconds
      pulseIntervalRef.current = setInterval(() => {
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 1000); // Pulse for 1 second
      }, 5000);
    }

    return () => {
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
    };
  }, []);

  // Stop pulsing permanently when user hovers for the first time
  const handleFirstHover = () => {
    if (!document.cookie.includes("theme-slider-interacted=true")) {
      // Set cookie that expires in 1 year
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `theme-slider-interacted=true; expires=${expires.toUTCString()}; path=/`;

      setShouldPulse(false);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
    }
  };

  // Get current theme index
  useEffect(() => {
    const currentIndex = themes.findIndex((t) => t.name === theme);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [theme]);

  // Auto-collapse after 3 seconds of inactivity (desktop/tablet only)
  const resetTimeout = () => {
    if (isMobile) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isExpanded && !isDragging && !isHovering) {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 100);
    }
  };

  useEffect(() => {
    resetTimeout();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isExpanded, isDragging, isHovering]);

  // Calculate theme index from cursor position
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getThemeIndexFromPosition = (clientX: number) => {
    if (!containerRef.current) return activeIndex;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(percentage * (themes.length - 1));

    return Math.max(0, Math.min(themes.length - 1, index));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (skipNextPointerRef.current) {
      skipNextPointerRef.current = false;
      return;
    }
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
        debouncedSetTheme(themes[index].name);
      }
    },
    [isDragging, activeIndex, getThemeIndexFromPosition, debouncedSetTheme]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      resetTimeout();
    }
  }, [isDragging]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (skipNextPointerRef.current) {
      skipNextPointerRef.current = false;
      return;
    }
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
        debouncedSetTheme(themes[index].name);
      }
    },
    [isDragging, activeIndex, getThemeIndexFromPosition, debouncedSetTheme]
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
    if (mobileSelectionGuardRef.current) return;
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

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        if (!isMobile) {
          setIsHovering(true);
          handleFirstHover();
          if (!isExpanded) {
            setIsExpanded(true);
          }
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsHovering(false);
          resetTimeout();
        }
      }}
      onClick={(e) => {
        if (isMobile && !isExpanded) {
          e.preventDefault();
          e.stopPropagation();
          if ("stopImmediatePropagation" in e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
          }
          handleFirstHover();
          skipNextPointerRef.current = true;
          setIsExpanded(true);
          activateMobileSelectionGuard();
        }
      }}
      onMouseDown={(e) => {
        if (isExpanded) {
          handleMouseDown(e);
        }
      }}
      onTouchStart={(e) => {
        handleFirstHover();
        if (!isExpanded) {
          e.preventDefault();
          e.stopPropagation();
          if ("stopImmediatePropagation" in e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
          }
          skipNextPointerRef.current = true;
          setIsExpanded(true);
          resetTimeout();
          activateMobileSelectionGuard();
        } else {
          handleTouchStart(e);
        }
      }}
      className={`flex items-center rounded-full cursor-pointer select-none ${isExpanded ? "overflow-hidden" : "overflow-visible"} ${
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
          className="relative flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            width: `${activeDotSize}px`,
            height: `${activeDotSize}px`,
          }}
        >
          <span
            className={`absolute inline-flex rounded-full bg-foreground/20 ${shouldPulse ? "animate-ping" : "opacity-0"}`}
            style={{
              width: `${activeDotSize * 1.1}px`,
              height: `${activeDotSize * 1.1}px`,
            }}
          />
          <span
            className="relative inline-flex rounded-full bg-foreground"
            style={{
              width: `${activeDotSize}px`,
              height: `${activeDotSize}px`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ThemeSlider;
