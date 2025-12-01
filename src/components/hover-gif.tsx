"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HoverGifProps {
  staticSrc: string;
  gifSrc: string;
  alt?: string;
  className?: string;
}

export function HoverGif({ staticSrc, gifSrc, alt = "", className = "" }: HoverGifProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Image src={staticSrc} alt={alt} fill priority className="object-cover" sizes="(max-width: 768px) 80px, 230px" />
      {!isHovered && <img src={gifSrc} alt={alt} className="absolute inset-0 w-full h-full object-cover" />}
    </div>
  );
}
