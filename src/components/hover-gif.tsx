"use client";

import { useState } from "react";

interface HoverGifProps {
  staticSrc: string;
  gifSrc: string;
  alt?: string;
  className?: string;
}

export function HoverGif({ staticSrc, gifSrc, alt = "", className = "" }: HoverGifProps) {
  const [hover, setHover] = useState(false);

  return (
    <img src={hover ? gifSrc : staticSrc} alt={alt} className={className} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} />
  );
}
