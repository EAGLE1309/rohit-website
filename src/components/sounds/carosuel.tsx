"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Direction = "left" | "right";

export type CarouselImage = {
  id: number | string;
  url: string;
  alt: string;
};

export interface HorizontalCarouselProps {
  images?: CarouselImage[];
  /** Pixels to scroll per click. Defaults to 300. */
  scrollBy?: number;
  /** Card width/height in Tailwind classes; defaults to w-48 h-32. */
  cardClassName?: string;
  /** Container additional classes. */
  className?: string;
}

export default function HorizontalCarousel({
  images = [
    { id: 1, url: "/home.png", alt: "Abstract 1" },
    { id: 2, url: "/home.png", alt: "Sunset" },
    { id: 3, url: "/home.png", alt: "Architecture" },
    { id: 4, url: "/home.png", alt: "Gradient 1" },
    { id: 5, url: "/home.png", alt: "Abstract 2" },
    { id: 6, url: "/home.png", alt: "Sunset 2" },
    { id: 7, url: "/home.png", alt: "Architecture 2" },
    { id: 8, url: "/home.png", alt: "Gradient 2" },
    { id: 9, url: "/home.png", alt: "Abstract 3" },
    { id: 10, url: "/home.png", alt: "Architecture 3" },
  ],
  scrollBy = 300,
  cardClassName = "w-48 h-32",
  className = "",
}: HorizontalCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);

  const updateArrows = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = useCallback(
    (direction: Direction) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const amount = direction === "left" ? -scrollBy : scrollBy;
      container.scrollTo({
        left: container.scrollLeft + amount,
        behavior: "smooth",
      });
    },
    [scrollBy]
  );

  const handleScroll: React.UIEventHandler<HTMLDivElement> = () => {
    updateArrows();
  };

  useEffect(() => {
    // Initialize arrow visibility on mount and on resize
    updateArrows();
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateArrows]);

  return (
    <div className={`relative w-full bg-black min-h-screen flex items-center justify-center p-8 ${className}`}>
      <div className="w-full max-w-7xl">
        <div className="relative group">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Carousel Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"] }}
            role="region"
            aria-roledescription="carousel"
          >
            {images.map((image) => (
              <div
                key={image.id}
                className={`flex-shrink-0 ${cardClassName} rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105`}
              >
                {/* Using <img> for simplicity; swap to next/image if you prefer */}
                <img src={image.url} alt={image.alt} className="w-full h-full object-cover" draggable={false} />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Hover to show navigation arrows • Click and drag to scroll</p>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
