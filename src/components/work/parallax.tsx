"use client";

import React, { useEffect, useRef, ReactNode, HTMLAttributes } from "react";

interface ParallaxGridWrapperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  baseLag?: number;
  lenisInstance?: any;
  className?: string;
  style?: React.CSSProperties;
  randomOffset?: number; // maximum random start offset in px
}

export const ParallaxGridWrapper: React.FC<ParallaxGridWrapperProps> = ({
  children,
  baseLag = 0.5,
  randomOffset = 25,
  lenisInstance,
  className = "",
  style = {},
  ...props
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const columnElementsRef = useRef<HTMLDivElement[]>([]);
  const initialOffsetsRef = useRef<number[]>([]);
  const tickingRef = useRef(false);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Get number of columns from CSS grid
    const numColumns = window.getComputedStyle(grid).getPropertyValue("grid-template-columns").split(" ").filter(Boolean).length;
    if (numColumns <= 1) return;

    const items = Array.from(grid.children) as HTMLElement[];

    // Group items by column
    const columns: HTMLElement[][] = Array.from({ length: numColumns }, () => []);
    items.forEach((item, i) => columns[i % numColumns].push(item));

    // Clear grid and append column containers
    grid.innerHTML = "";
    const columnEls: HTMLDivElement[] = columns.map((colItems) => {
      const col = document.createElement("div");

      // Random starting offset
      const offset = (Math.random() - 0.5) * 2 * randomOffset; // -randomOffset → +randomOffset
      col.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: inherit;
        will-change: transform;
        transform: translate3d(0, ${offset}px, 0);
      `;
      colItems.forEach((item) => col.appendChild(item));
      grid.appendChild(col);
      initialOffsetsRef.current.push(offset);
      return col;
    });

    columnElementsRef.current = columnEls;
    const mid = (columnEls.length - 1) / 2;

    // Scroll handler using requestAnimationFrame
    const handleScroll = (scrollY: number) => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          columnElementsRef.current.forEach((col, i) => {
            const distance = Math.abs(i - mid);
            const lag = (baseLag / 5) * (1 + distance);
            const startOffset = initialOffsetsRef.current[i] || 0;
            col.style.transform = `translate3d(0, ${startOffset - scrollY * lag}px, 0)`;
          });
          tickingRef.current = false;
        });
      }
    };

    // Integrate with Lenis if available
    const lenis = lenisInstance || (window as any).lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", (e: any) => handleScroll(e.scroll || 0));
      return () => lenis.off("scroll", handleScroll);
    } else {
      const onScroll = () => handleScroll(window.scrollY);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [baseLag, lenisInstance, randomOffset]);

  return (
    <div ref={gridRef} className={className} style={style} {...props}>
      {children}
    </div>
  );
};
