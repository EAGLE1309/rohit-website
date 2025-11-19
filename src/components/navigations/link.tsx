"use client";

import React from "react";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import type { UrlObject } from "url";
import clsx from "clsx";
import { useLenis } from "lenis/react";

type TransitionLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | UrlObject;
  children: React.ReactNode;
  className?: string;
  ref?: React.ForwardedRef<HTMLAnchorElement>;
};

const Link: React.FC<TransitionLinkProps> = ({ href, children, className, ref, onClick, ...rest }) => {
  const router = useTransitionRouter();
  const currentPath = usePathname();
  const lenis = useLenis();

  function improvedSlideInOut() {
    // Fade out old page - buttery smooth
    document.documentElement.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 700,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    });

    // Fade in new page - seamless and smooth
    document.documentElement.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 750,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    });
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
    <a href={typeof href === "string" ? href : href.pathname || "/"} ref={ref} onClick={handleClick} className={clsx(className)} {...rest}>
      {children}
    </a>
  );
};

export default Link;
