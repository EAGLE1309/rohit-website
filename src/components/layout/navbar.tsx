/* eslint-disable @next/next/no-img-element */

"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/navigations/link";

import { Button } from "../ui/button";
import ThemeSelectors from "../theme/theme-selectors";
import { usePathname } from "next/navigation";
import { IconMenu, IconX } from "@tabler/icons-react";
import { useTheme } from "next-themes";

const items = [
  { title: "Home", href: "/" },
  { title: "Work", href: "/work" },
  { title: "Sounds", href: "/sounds" },
  { title: "About", href: "/about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isThemeSliderExpanded, setIsThemeSliderExpanded] = useState(false);

  const { theme } = useTheme();

  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicatorStyle, setIndicatorStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 });
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const normalizedPath = useMemo(() => {
    if (!pathname) return pathname;
    return pathname.startsWith("/work") ? "/work" : pathname;
  }, [pathname]);

  const resolvedActiveHref = useMemo(() => {
    if (hoveredHref) return hoveredHref;
    return normalizedPath;
  }, [hoveredHref, normalizedPath]);

  const isNavActive = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (href === "/work") return pathname.startsWith("/work");
      return pathname === href;
    },
    [pathname]
  );

  const updateIndicator = useCallback(
    (targetHref?: string | null) => {
      const track = desktopNavRef.current;
      if (!track) {
        setIndicatorVisible(false);
        return;
      }
      const linkEl = linkRefs.current.get(targetHref ?? resolvedActiveHref ?? "");
      if (!linkEl) {
        setIndicatorVisible(false);
        return;
      }
      const trackRect = track.getBoundingClientRect();
      const linkRect = linkEl.getBoundingClientRect();
      setIndicatorStyle({
        width: linkRect.width,
        left: linkRect.left - trackRect.left,
      });
      setIndicatorVisible(true);
    },
    [resolvedActiveHref]
  );

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect((): (() => void) => {
    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator]);

  return (
    <nav className={`fixed bg-background ease-in-out w-full top-0 z-50 px-3`}>
      <div className="h-auto md:w-[50%] w-full border-2 rounded-full px-5 py-1 my-3 mx-auto max-w-screen-xl flex justify-between items-center">
        <Link
          href="/"
          className={`flex leading-5 items-center text-lg font-medium font-neue gap-3 ${
            isThemeSliderExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {theme === "dark" || theme === "nightfall" || theme === "midnight" ? (
            <img src="/logo-white.svg" className="w-20 h-full " alt="Logo" />
          ) : (
            <img src="/logo.svg" className="w-20 h-full" alt="Logo" />
          )}
        </Link>

        <div ref={desktopNavRef} className="relative gap-2 py-3 hidden md:flex items-center">
          {indicatorVisible && (
            <span
              className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 h-9 rounded-full bg-black/90 transition-[width,left] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: `${Math.max(indicatorStyle.width, 0)}px`,
                left: `${indicatorStyle.left}px`,
              }}
            />
          )}
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-neue relative z-10 px-3 py-1 text-md transition-colors flex items-center gap-1 ${
                hoveredHref
                  ? hoveredHref === item.href
                    ? "text-white"
                    : "text-gray-500"
                  : isNavActive(item.href)
                  ? "text-white"
                  : "text-gray-500 hover:text-white"
              }`}
              onMouseEnter={() => {
                setHoveredHref(item.href);
                updateIndicator(item.href);
              }}
              onMouseLeave={() => {
                setHoveredHref(null);
                updateIndicator(normalizedPath);
              }}
              ref={(node) => {
                if (node) {
                  linkRefs.current.set(item.href, node);
                } else {
                  linkRefs.current.delete(item.href);
                }
              }}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <ThemeSelectors onMobileExpandChange={setIsThemeSliderExpanded} />
          <Button
            className={`!px-1.5 rounded-full ${open ? (theme === "dark" ? "!bg-white/5" : "!bg-black/5") : ""}`}
            onClick={() => setOpen(!open)}
            variant="ghost"
          >
            {open ? <IconX className="size-6" /> : <IconMenu className="size-6" />}
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeSelectors />
        </div>
      </div>

      {/* Mobile nav */}

      <div
        className={`md:hidden transition-all bg-background absolute z-[-1] top-0 pt-24 py-12 flex h-screen flex-col items-center gap-2 px-3 ease-in-out duration-300 ${
          open ? "left-0 w-full" : "left-[-100%] w-0"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="w-full text-lg font-medium font-neue py-2 flex items-center gap-2"
          >
            {isNavActive(item.href) ? <span>&nbsp;[&nbsp;•&nbsp;]</span> : <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;]</span>}
            &nbsp;{item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
