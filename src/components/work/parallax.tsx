"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, ReactNode, HTMLAttributes } from "react";

interface ElasticGridWrapperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  baseLag?: number;
  lagScale?: number;
  smoothness?: number;
  dampening?: number;
  randomOffset?: number;
  lenisInstance?: any; // Lenis instance if you want to pass it manually
  className?: string;
  style?: React.CSSProperties;
}

interface ColumnElement {
  element: HTMLDivElement;
  lag: number;
  targetY: number;
  currentY: number;
  velocity: number;
  randomOffset: number;
}

// Global Lenis instance interface
declare global {
  interface Window {
    lenis?: any;
  }
}

export const ElasticGridWrapper: React.FC<ElasticGridWrapperProps> = ({
  children,
  baseLag = 0.08,
  lagScale = 0.12,
  smoothness = 0.18,
  dampening = 0.82,
  randomOffset = 35,
  lenisInstance,
  className = "",
  style = {},
  ...props
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScrollingRef = useRef<boolean>(false);
  const lastScrollY = useRef<number>(0);

  useEffect(() => {
    if (!gridRef.current) return;

    const initElasticGrid = (): (() => void) | null => {
      const grid = gridRef.current;
      if (!grid) return null;

      // Get Lenis instance (either passed prop, global, or fallback)
      const lenis = lenisInstance || window.lenis;

      // Get number of columns from CSS grid
      const gridStyles = window.getComputedStyle(grid);
      const columnsRaw = gridStyles.getPropertyValue("grid-template-columns");
      const numColumns = columnsRaw.split(" ").filter(Boolean).length;

      if (numColumns <= 1) return null;

      // Get all direct children (grid items)
      const items = Array.from(grid.children) as HTMLElement[];

      // Group items by column
      const columnArrays: HTMLElement[][] = Array.from({ length: numColumns }, () => []);
      items.forEach((item, index) => {
        columnArrays[index % numColumns].push(item);
      });

      // Store original items for cleanup
      const originalItems = [...items];

      // Clear grid and create column containers
      grid.innerHTML = "";
      const columnElements: ColumnElement[] = [];
      const mid = (numColumns - 1) / 2;

      columnArrays.forEach((columnItems, i) => {
        const distance = Math.abs(i - mid);
        const lag = baseLag + distance * lagScale;

        // Generate random offset for initial positioning
        const randomY = (Math.random() - 0.5) * randomOffset;

        const columnContainer = document.createElement("div");
        columnContainer.className = "elastic-grid-column";
        columnContainer.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: inherit;
          will-change: transform;
          transform: translate3d(0, ${randomY}px, 0);
        `;

        columnItems.forEach((item) => {
          columnContainer.appendChild(item);
        });

        grid.appendChild(columnContainer);
        columnElements.push({
          element: columnContainer,
          lag,
          targetY: randomY,
          currentY: randomY,
          velocity: 0,
          randomOffset: randomY,
        });
      });

      let scrollVelocity = 0;
      let scrollTimeout: NodeJS.Timeout | undefined;

      // Smooth animation loop optimized for Lenis
      const animate = (): void => {
        let hasMovement = false;

        columnElements.forEach((column) => {
          const diff = column.targetY - column.currentY;

          if (Math.abs(diff) > 0.08 || Math.abs(column.velocity) > 0.01) {
            // Enhanced smoothing for Lenis integration
            column.velocity += diff * smoothness;
            column.velocity *= dampening;
            column.currentY += column.velocity;

            // Use translate3d for better performance with Lenis
            column.element.style.transform = `translate3d(0, ${column.currentY}px, 0)`;
            hasMovement = true;
          }
        });

        // Continue animation if there's movement or scrolling
        if (hasMovement || isScrollingRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      // Lenis scroll handler
      const handleLenisScroll = (data: any): void => {
        const scrollY = data.scroll || 0;
        const velocity = data.velocity || 0;

        // Calculate velocity for enhanced responsiveness
        scrollVelocity = scrollY - lastScrollY.current;
        lastScrollY.current = scrollY;

        isScrollingRef.current = true;

        // Clear existing timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // Update target positions with Lenis data
        columnElements.forEach((column) => {
          const scrollOffset = scrollY * column.lag;
          // Enhanced velocity influence using Lenis velocity data
          const velocityInfluence = velocity * 0.008 * column.lag;
          const randomInfluence = Math.sin(scrollY * 0.001 + column.lag) * 2; // Subtle organic variation

          column.targetY = column.randomOffset - scrollOffset + velocityInfluence + randomInfluence;
        });

        // Start animation if not already running
        if (!animationFrameRef.current) {
          animate();
        }

        // Enhanced settling behavior
        scrollTimeout = setTimeout(() => {
          isScrollingRef.current = false;

          // Smooth return to base position with slight variation
          columnElements.forEach((column) => {
            const scrollOffset = scrollY * column.lag;
            const settleVariation = Math.sin(scrollY * 0.001 + column.lag) * 1;
            column.targetY = column.randomOffset - scrollOffset + settleVariation;
          });

          // Ensure animation continues for smooth settling
          if (!animationFrameRef.current) {
            animate();
          }
        }, 120);
      };

      // Enhanced fallback for when Lenis isn't available
      const handleNativeScroll = (): void => {
        const scrollY = window.scrollY;
        scrollVelocity = scrollY - lastScrollY.current;
        lastScrollY.current = scrollY;

        handleLenisScroll({ scroll: scrollY, velocity: scrollVelocity });
      };

      // Integrate with Lenis if available
      if (lenis && typeof lenis.on === "function") {
        lenis.on("scroll", handleLenisScroll);
        console.log("✅ Elastic Grid integrated with Lenis");
      } else {
        // Fallback to native scroll with throttling
        let scrollTicking = false;
        const throttledScroll = (): void => {
          if (!scrollTicking) {
            requestAnimationFrame(() => {
              handleNativeScroll();
              scrollTicking = false;
            });
            scrollTicking = true;
          }
        };

        window.addEventListener("scroll", throttledScroll, { passive: true });
        console.log("⚠️ Lenis not found, using fallback scroll handler");
      }

      // Start initial animation
      animate();

      // Return cleanup function
      return (): void => {
        // Clean up Lenis listener
        if (lenis && typeof lenis.off === "function") {
          lenis.off("scroll", handleLenisScroll);
        } else {
          window.removeEventListener("scroll", handleNativeScroll);
        }

        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Restore original structure
        if (grid && originalItems.length > 0) {
          grid.innerHTML = "";
          originalItems.forEach((item) => grid.appendChild(item));
        }
      };
    };

    // Initialize with slight delay for Lenis
    const timeoutId = setTimeout(() => {
      cleanupRef.current = initElasticGrid();
    }, 100);

    // Handle resize with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = (): void => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
        setTimeout(() => {
          cleanupRef.current = initElasticGrid();
        }, 50);
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener("resize", handleResize);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [baseLag, lagScale, smoothness, dampening, randomOffset, lenisInstance]);

  return (
    <>
      {/* Enhanced styles optimized for Lenis */}
      <style jsx global>{`
        .elastic-grid-column {
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        /* Optimize for Lenis smooth scrolling */
        .elastic-grid-column > * {
          transform: translateZ(0);
        }

        /* Enhanced performance */
        html.lenis {
          height: auto;
        }

        .lenis.lenis-smooth {
          scroll-behavior: auto;
        }

        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }
      `}</style>

      <div ref={gridRef} className={className} style={style} {...props}>
        {children}
      </div>
    </>
  );
};
