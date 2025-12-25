"use client";

import { useState, useEffect, useRef } from "react";
import { fullImageUrl, blurPlaceholderUrl } from "@/lib/dashboard/sanity-cilent";
import Image from "next/image";

const PhotographsComponent = ({ photographs }: { photographs: any[] }) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [shuffledPhotos, setShuffledPhotos] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const clickedImageRef = useRef<HTMLDivElement>(null);

  // Shuffle array while keeping clicked image at the start
  const shuffleArray = (array: any[], startIndex: number) => {
    const clicked = array[startIndex];
    const remaining = array.filter((_, idx) => idx !== startIndex);

    // Fisher-Yates shuffle for remaining items
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    return [clicked, ...remaining];
  };

  // Initialize loading states
  useEffect(() => {
    const initialLoading: { [key: string]: boolean } = {};
    photographs.forEach((photo) => {
      initialLoading[photo.id] = true;
    });
    setLoading(initialLoading);
  }, [photographs]);

  const handleImageClick = (index: number) => {
    if (isExpanded) {
      setIsExpanded(false);
      setShuffledPhotos([]);
    } else {
      const shuffled = shuffleArray(photographs, index);
      setShuffledPhotos(shuffled);
      setIsExpanded(true);

      // Scroll to clicked image after animation starts
      setTimeout(() => {
        clickedImageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const displayPhotos = isExpanded ? shuffledPhotos : photographs;

  return (
    <div
      ref={containerRef}
      className={`pb-16 w-full transition-all duration-700 ease-in-out ${
        isExpanded ? "flex flex-col max-w-[725px] mx-auto gap-8" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:ml-48"
      }`}
    >
      {displayPhotos.map((photograph: any, idx: number) => {
        const photoBlurPlaceholder = blurPlaceholderUrl(photograph.image);
        const isClickedImage = isExpanded && idx === 0;
        const uniqueKey = `${photograph.id || `photo-${idx}`}-${isExpanded ? "expanded" : "grid"}`;

        return (
          <div
            key={uniqueKey}
            ref={isClickedImage ? clickedImageRef : null}
            className={`relative cursor-pointer transition-all duration-700 ease-in-out ${
              isExpanded ? "w-full" : "w-full h-[375px] md:max-w-[272px] md:h-[425px]"
            }`}
            onClick={() => handleImageClick(isExpanded ? photographs.findIndex((p) => p.id === photograph.id) : idx)}
            style={{
              transformOrigin: "center",
            }}
          >
            <div
              aria-hidden
              className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${
                loading[photograph.id] ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={
                photoBlurPlaceholder
                  ? { backgroundImage: `url(${photoBlurPlaceholder})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            >
              {!photoBlurPlaceholder && <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />}
            </div>
            {isExpanded ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fullImageUrl(photograph.image, 1200) || ""}
                alt="Gallery Photo"
                className={`w-full object-contain transition-all duration-300 ${loading[photograph.id] ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setLoading((prev) => ({ ...prev, [photograph.id]: false }))}
                onError={() => setLoading((prev) => ({ ...prev, [photograph.id]: false }))}
              />
            ) : (
              <Image
                src={fullImageUrl(photograph.image, 600) || ""}
                alt="Gallery Photo"
                fill
                className={`object-cover transition-all duration-300 ${loading[photograph.id] ? "opacity-0" : "opacity-100"}`}
                placeholder={photoBlurPlaceholder ? "blur" : "empty"}
                blurDataURL={photoBlurPlaceholder || undefined}
                priority={idx < 8}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 272px"
                onLoadingComplete={() => setLoading((prev) => ({ ...prev, [photograph.id]: false }))}
                onError={() => setLoading((prev) => ({ ...prev, [photograph.id]: false }))}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PhotographsComponent;
