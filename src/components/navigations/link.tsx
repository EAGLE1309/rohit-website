"use client";

import React from "react";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import type { UrlObject } from "url";
import clsx from "clsx";
import { useLenis } from "lenis/react";

type TransitionLinkProps = {
  href: string | UrlObject;
  children: React.ReactNode;
  className?: string;
  ref?: React.ForwardedRef<HTMLAnchorElement>;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

const Link: React.FC<TransitionLinkProps> = ({ href, children, className, ref, onClick }) => {
  const router = useTransitionRouter();
  const currentPath = usePathname();
  const lenis = useLenis();

  function improvedSlideInOut() {
    // Animate old page fading and sliding up slightly
    document.documentElement.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(-25%) scale(0.98)" },
      ],
      {
        duration: 600,
        easing: "cubic-bezier(0.86, 0, 0.07, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    // Animate new page appearing with a subtle slide from bottom and fade in
    document.documentElement.animate(
      [
        { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", opacity: 0.95 },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", opacity: 1 },
      ],
      {
        duration: 650,
        easing: "cubic-bezier(0.86, 0, 0.07, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const url = typeof href === "string" ? href : href.pathname || "/";
    if (url === currentPath) return;

    router.push(url, {
      onTransitionReady: () => {
        improvedSlideInOut();
        lenis?.scrollTo(0, { immediate: true });
      },
    });

    if (onClick) onClick(e);
  };

  return (
    <a href={typeof href === "string" ? href : href.pathname || "/"} ref={ref} onClick={handleClick} className={clsx(className)}>
      {children}
    </a>
  );
};

export default Link;
