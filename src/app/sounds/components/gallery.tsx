"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { fullImageUrl, blurPlaceholderUrl } from "@/lib/dashboard/sanity-cilent";
import { motion, AnimatePresence } from "framer-motion";

// Helper to generate random IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const useColumnCount = () => {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setCols(4);
      else if (window.innerWidth >= 768) setCols(3);
      else setCols(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
};

const GalleryComponent = ({ gallery }: { gallery: any[] }) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayPhotos, setDisplayPhotos] = useState<any[]>([]);
  const columnCount = useColumnCount();

  // React 19 safe ref
  const clickedImageRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const initialLoading: { [key: string]: boolean } = {};
    const initialPhotosWithKeys = gallery.map((p) => ({
      ...p,
      _renderId: p.id || generateId(),
    }));

    gallery.forEach((photo) => {
      if (photo.id) initialLoading[photo.id] = true;
    });

    setLoading(initialLoading);
    setDisplayPhotos(initialPhotosWithKeys);
  }, [gallery]);

  // Distribute photos into columns in row-first order
  // e.g. 9 photos, 3 cols: col0=[0,3,6], col1=[1,4,7], col2=[2,5,8]
  // Reading across: row0=[0,1,2], row1=[3,4,5], row2=[6,7,8] ✓
  const gridColumns = useMemo(() => {
    if (isExpanded) return [];
    const cols: { photo: any; idx: number }[][] = Array.from({ length: columnCount }, () => []);
    displayPhotos.forEach((photo, i) => {
      cols[i % columnCount].push({ photo, idx: i });
    });
    return cols;
  }, [displayPhotos, columnCount, isExpanded]);

  // --- Handle Clicks ---
  const handleImageClick = (index: number) => {
    if (isExpanded) {
      // CLOSE: Return to grid
      setIsExpanded(false);

      const resetPhotos = gallery.map(p => ({
        ...p,
        _renderId: p.id || generateId()
      }));
      setDisplayPhotos(resetPhotos);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);

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
    const nextBatch = [...gallery];
    nextBatch.sort(() => Math.random() - 0.5);

    const batchWithNewKeys = nextBatch.map(p => ({
      ...p,
      _renderId: `${p.id}-copy-${generateId()}`
    }));

    setDisplayPhotos((prev) => [...prev, ...batchWithNewKeys]);
  }, [gallery]);

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

  const renderPhoto = (photograph: any, idx: number) => {
    const uniqueKey = photograph._renderId;
    const isClickedImage = isExpanded && idx === 0;
    const photoBlurPlaceholder = blurPlaceholderUrl(photograph.image);

    return (
      <motion.div
        key={uniqueKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.4,
          delay: isExpanded ? 0 : Math.min(idx * 0.03, 0.3),
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
        ref={isClickedImage ? clickedImageRef : undefined}
        className={`relative cursor-pointer bg-gray-100 dark:bg-zinc-900 overflow-hidden ${isExpanded ? "w-full" : "w-full"}`}
        style={isExpanded && loading[photograph.id] ? { minHeight: '400px' } : undefined}
        onClick={() => handleImageClick(idx)}
      >
        {/* Blur Placeholder */}
        <div
          className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ${loading[photograph.id] ? "opacity-100" : "opacity-0"}`}
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

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullImageUrl(photograph.image) || ""}
          alt="Gallery Photo"
          loading="lazy"
          className={`block w-full transition-opacity duration-500 ${loading[photograph.id] ? "opacity-0" : "opacity-100"
            } ${isExpanded
              ? "h-auto object-contain"
              : "h-full object-cover"
            }`}
          onLoad={() =>
            setLoading((prev) => ({ ...prev, [photograph.id]: false }))
          }
        />
      </motion.div>
    );
  };

  return (
    <div className="pb-16 w-full">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col max-w-[725px] mx-auto gap-12"
          >
            {displayPhotos.map((photograph: any, idx: number) => renderPhoto(photograph, idx))}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-5 md:ml-48"
          >
            {gridColumns.map((col, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-5">
                {col.map(({ photo, idx }) => renderPhoto(photo, idx))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isExpanded && (
        <div className="w-full text-center py-8 opacity-50 text-sm animate-pulse">
          Loading memories...
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;
