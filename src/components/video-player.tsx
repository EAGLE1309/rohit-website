"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Awwwards-level accessible video player (TypeScript)
 * - Tailwind-first styling (drop into a Tailwind + Next.js project)
 * - Custom controls (play/pause, mute, time, progress, fullscreen, pip)
 * - Keyboard & a11y support
 * - Poster, lazy-loading, and graceful fallbacks
 *
 * Props:
 * - videoUrl (string) required
 * - poster (string) optional
 * - captions (string) optional VTT url
 * - className (string) optional extra wrapper classes
 */

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  captions?: string;
  className?: string;
  preload?: "auto" | "metadata" | "none";
}

export default function VideoPlayer({ videoUrl, poster, captions, className = "", preload = "metadata" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      setDuration(vid.duration || 0);
      setIsLoading(false);
    };

    const onTime = () => setCurrentTime(vid.currentTime || 0);

    const onProgress = () => {
      try {
        const buffered = vid.buffered;
        if (buffered.length) setBufferedEnd(buffered.end(buffered.length - 1));
      } catch (e) {
        // ignore
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    vid.addEventListener("loadedmetadata", onLoaded);
    vid.addEventListener("timeupdate", onTime);
    vid.addEventListener("progress", onProgress);
    vid.addEventListener("playing", onPlay);
    vid.addEventListener("pause", onPause);

    // handle network stalls
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    vid.addEventListener("waiting", onWaiting);
    vid.addEventListener("canplay", onCanPlay);

    return () => {
      vid.removeEventListener("loadedmetadata", onLoaded);
      vid.removeEventListener("timeupdate", onTime);
      vid.removeEventListener("progress", onProgress);
      vid.removeEventListener("playing", onPlay);
      vid.removeEventListener("pause", onPause);
      vid.removeEventListener("waiting", onWaiting);
      vid.removeEventListener("canplay", onCanPlay);
    };
  }, [videoUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // keyboard shortcuts when focused inside container
      if (!containerRef.current?.contains(document.activeElement as Node)) return;
      const vid = videoRef.current;
      if (!vid) return;

      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "k") togglePlay();
      if (e.key === "m") toggleMute();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "ArrowRight") seekBy(5);
      if (e.key === "ArrowLeft") seekBy(-5);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) vid.play().catch(() => { });
    else vid.pause();
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  };

  const seekTo = (time: number) => {
    const vid = videoRef.current;
    if (!vid || Number.isNaN(time)) return;
    vid.currentTime = Math.max(0, Math.min(time, duration || 0));
  };

  const seekBy = (delta: number) => seekTo((videoRef.current?.currentTime || 0) + delta);

  const formatTime = (sec = 0) => {
    if (!Number.isFinite(sec)) return "00:00";
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    if (duration >= 3600) {
      const h = Math.floor(sec / 3600)
        .toString()
        .padStart(2, "0");
      return `${h}:${m}:${s}`;
    }
    return `${m}:${s}`;
  };

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    seekTo(pct * duration);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const enterPip = async () => {
    try {
      if (videoRef.current?.requestPictureInPicture) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      // ignore unsupported
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative group rounded-2xl overflow-hidden bg-black/70 shadow-2xl ${className}`}
      tabIndex={0}
      aria-label="Video player"
    >
      {/* VIDEO element */}
      <video
        ref={videoRef}
        src={videoUrl}
        preload={preload}
        poster={poster}
        playsInline
        className="w-full h-auto max-h-[70vh] bg-black object-contain"
        crossOrigin="anonymous"
      >
        {captions && <track kind="captions" srcLang="en" src={captions} default />}
        {/* fallback */}
        Your browser does not support the video tag.
      </video>

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* Big center play button (appears when paused) */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:scale-105 transition-transform"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 3v18l15-9L5 3z" fill="white" />
          </svg>
        </button>
      )}

      {/* Controls bar */}
      <div className="absolute left-0 right-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-black/80 to-black/10 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-200">
        {/* Progress track */}
        <div
          className="h-2 w-full rounded-full bg-white/10 cursor-pointer relative"
          onClick={onProgressClick}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          tabIndex={0}
        >
          {/* buffered */}
          <div className="absolute left-0 top-0 bottom-0 rounded-full bg-white/20" style={{ width: `${(bufferedEnd / (duration || 1)) * 100}%` }} />
          {/* played */}
          <div
            className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>

        {/* controls row */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/6 hover:bg-white/10 focus:outline-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="5" width="4" height="14" fill="white" />
                  <rect x="14" y="5" width="4" height="14" fill="white" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 3v18l15-9L5 3z" fill="white" />
                </svg>
              )}
            </button>

            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-lg bg-white/6 hover:bg-white/10 flex items-center justify-center"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7l-1.41 1.41L18.17 12l-3.58 3.59L16 17l5-5-5-5z" fill="white" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 9v6h4l5 5V4L9 9H5z" fill="white" />
                </svg>
              )}
            </button>

            <div className="text-xs tabular-nums">
              <span className="font-medium">{formatTime(currentTime)}</span>
              <span className="text-white/50"> / </span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          {/* spacer */}
          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button onClick={() => seekBy(-10)} className="w-10 h-10 rounded-lg bg-white/6 hover:bg-white/10" aria-label="Rewind 10s">
              -10
            </button>
            <button onClick={() => seekBy(10)} className="w-10 h-10 rounded-lg bg-white/6 hover:bg-white/10" aria-label="Forward 10s">
              +10
            </button>

            <button onClick={enterPip} className="w-10 h-10 rounded-lg bg-white/6 hover:bg-white/10" aria-label="Picture-in-Picture">
              PiP
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-lg bg-white/6 hover:bg-white/10"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? "⤢" : "⤢"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
