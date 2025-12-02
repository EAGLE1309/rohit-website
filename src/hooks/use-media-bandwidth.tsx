"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface MediaBandwidthStats {
  loaded: number;
  total: number;
  percent: number;
  formattedLoaded: string;
  formattedTotal: string;
  bitrate: string;
}

/**
 * Hook to track bandwidth usage for HTMLMediaElement (audio/video)
 */
export function useMediaBandwidth(mediaRef: React.RefObject<HTMLMediaElement | null>) {
  const [stats, setStats] = useState<MediaBandwidthStats>({
    loaded: 0,
    total: 0,
    percent: 0,
    formattedLoaded: "0 KB",
    formattedTotal: "0 KB",
    bitrate: "0 kbps",
  });

  const lastLoadedRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateStats = () => {
      const buffered = media.buffered;
      if (!buffered || buffered.length === 0) return;

      const duration = media.duration || 0;
      const bufferedEnd = buffered.end(buffered.length - 1);
      const src = media.currentSrc || "";

      let totalBytes = 0;
      let loadedBytes = 0;

      if (typeof window !== "undefined" && window.performance) {
        const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        const mediaEntry = entries.find((e) => src.includes(e.name.split("?")[0]) || e.name.includes("proxy-audio"));

        if (mediaEntry) {
          totalBytes = mediaEntry.decodedBodySize || mediaEntry.transferSize || 0;
          loadedBytes = mediaEntry.transferSize || 0;
        }
      }

      if (totalBytes === 0 && duration > 0) {
        const isVideo = media instanceof HTMLVideoElement;
        const estimatedBitrate = isVideo ? 2000000 : 128000;
        totalBytes = Math.round((duration * estimatedBitrate) / 8);
        loadedBytes = Math.round((bufferedEnd / duration) * totalBytes);
      }

      const now = Date.now();
      const timeDelta = (now - lastTimeRef.current) / 1000;
      const bytesDelta = loadedBytes - lastLoadedRef.current;
      const bitrate = timeDelta > 0 ? Math.round((bytesDelta * 8) / timeDelta / 1000) : 0;

      lastLoadedRef.current = loadedBytes;
      lastTimeRef.current = now;

      const percent = totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 0;

      setStats({
        loaded: loadedBytes,
        total: totalBytes,
        percent: Math.min(100, percent),
        formattedLoaded: formatBytes(loadedBytes),
        formattedTotal: formatBytes(totalBytes),
        bitrate: `${bitrate} kbps`,
      });
    };

    media.addEventListener("progress", updateStats);
    media.addEventListener("loadedmetadata", updateStats);
    media.addEventListener("timeupdate", updateStats);
    updateStats();

    const interval = setInterval(updateStats, 1000);

    return () => {
      media.removeEventListener("progress", updateStats);
      media.removeEventListener("loadedmetadata", updateStats);
      media.removeEventListener("timeupdate", updateStats);
      clearInterval(interval);
    };
  }, [mediaRef, formatBytes]);

  return stats;
}

/**
 * Bandwidth meter component for media elements
 */
export function MediaBandwidthMeter({
  stats,
  label = "Bandwidth",
  compact = false,
}: {
  stats: MediaBandwidthStats;
  label?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-mono text-foreground/60">
        <span>{stats.formattedLoaded}</span>
        <span className="text-foreground/30">/</span>
        <span>{stats.formattedTotal}</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-[10px] font-mono text-foreground/70">
        <span>{label}</span>
        <span>
          {stats.formattedLoaded} / {stats.formattedTotal}
        </span>
      </div>
      <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${stats.percent}%` }} />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-foreground/50">
        <span>{stats.percent}% loaded</span>
        <span>{stats.bitrate}</span>
      </div>
    </div>
  );
}
