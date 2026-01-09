"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fullImageUrl, blurPlaceholderUrl } from "@/lib/dashboard/sanity-cilent";
import { motion, AnimatePresence } from "framer-motion";

// Helper to generate random IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const PhotographsComponent = ({ photographs }: { photographs: any[] }) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayPhotos, setDisplayPhotos] = useState<any[]>([]);

  // React 19 safe ref
  const clickedImageRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const initialLoading: { [key: string]: boolean } = {};
    const initialPhotosWithKeys = photographs.map((p) => ({
      ...p,
      _renderId: p.id || generateId(),
    }));

    photographs.forEach((photo) => {
      if (photo.id) initialLoading[photo.id] = true;
    });

    setLoading(initialLoading);
    setDisplayPhotos(initialPhotosWithKeys);
  }, [photographs]);

  // --- Handle Clicks ---
  const handleImageClick = (index: number) => {
    if (isExpanded) {
      // CLOSE: Return to grid
      setIsExpanded(false);

      const resetPhotos = photographs.map(p => ({
        ...p,
        _renderId: p.id || generateId()
      }));
      setDisplayPhotos(resetPhotos);

    } else {
      // OPEN: Shuffle and expand
      const clicked = displayPhotos[index];
      const remaining = displayPhotos.filter((_, idx) => idx !== index);

      // Shuffle logic
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }

      setDisplayPhotos([clicked, ...remaining]);
      setIsExpanded(true);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  // --- Infinite Scroll ---
  const loadMorePhotos = useCallback(() => {
    const nextBatch = [...photographs];
    nextBatch.sort(() => Math.random() - 0.5);

    const batchWithNewKeys = nextBatch.map(p => ({
      ...p,
      _renderId: `${p.id}-copy-${generateId()}`
    }));

    setDisplayPhotos((prev) => [...prev, ...batchWithNewKeys]);
  }, [photographs]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleScroll = () => {
      // Buffer of 200px
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
        loadMorePhotos();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isExpanded, loadMorePhotos]);

  return (
    <div
      className={`pb-16 w-full transition-all duration-700 ease-in-out ${isExpanded
        ? "flex flex-col max-w-[725px] mx-auto gap-12" // Increased gap for better feed look
        : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:ml-48"
        }`}
    >
      {/* mode="popLayout" is CRITICAL here. 
         It allows the 'leaving' items (old grid positions) to exist simultaneously 
         with the 'entering' items (new column positions) during the shuffle.
      */}
      <AnimatePresence mode="popLayout">
        {displayPhotos.map((photograph: any, idx: number) => {
          const uniqueKey = photograph._renderId;
          const isClickedImage = isExpanded && idx === 0;
          const photoBlurPlaceholder = blurPlaceholderUrl(photograph.image);

          return (
            <motion.div
              layout // This prop handles the smooth slide from Grid -> Column
              key={uniqueKey}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1.0] // Apple-like easing (easeOutSine-ish)
              }}
              ref={isClickedImage ? clickedImageRef : undefined}
              className={`relative cursor-pointer bg-gray-100 dark:bg-zinc-900 ${isExpanded
                ? "w-full" // Let container fit content
                : "w-full h-[375px] md:max-w-[272px] md:h-[425px] overflow-hidden"
                }`}
              style={isExpanded && loading[photograph.id] ? { minHeight: '400px' } : undefined}
              onClick={() => handleImageClick(idx)}
            >
              {/* Blur Placeholder */}
              <div
                className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ${loading[photograph.id] ? "opacity-100" : "opacity-0"
                  }`}
                style={
                  photoBlurPlaceholder
                    ? {
                      backgroundImage: `url(${photoBlurPlaceholder})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                    : undefined
                }
              />

              {/* UNIFIED IMAGE TAG STRATEGY 
                 We use a standard <img> tag for BOTH states.
                 This prevents the DOM from destroying/recreating the node, which causes flickering.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullImageUrl(photograph.image) || ""}
                alt="Gallery Photo"
                loading="lazy"
                className={`block w-full transition-all duration-500 ${loading[photograph.id] ? "opacity-0" : "opacity-100"
                  } ${isExpanded
                    ? "h-auto object-contain" // Natural aspect ratio, no constraints
                    : "h-full object-cover"   // Grid: Force Crop
                  }`}
                onLoad={() =>
                  setLoading((prev) => ({ ...prev, [photograph.id]: false }))
                }
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {isExpanded && (
        <div className="w-full text-center py-8 opacity-50 text-sm animate-pulse">
          Loading memories...
        </div>
      )}
    </div>
  );
};

export default PhotographsComponent;
