"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";
import { toast } from "sonner";

type Track = {
  id: number;
  title: string;
  artist?: string;
  src: string; // e.g. "/audio/track-01.mp3"
  thumb?: string; // e.g. "/thumbs/track-01.png"
};

// ⚠️ Replace these with your real audio files & thumbs
const TRACKS: Track[] = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  title: `Track ${i + 1}`,
  artist: "Unknown",
  src: `/audio/footsteps.mp3`,
  thumb: "/discs.png",
}));

const SoundsPage = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = useMemo(() => (currentIndex !== null ? TRACKS[currentIndex] : null), [currentIndex]);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "metadata";

    const onEnded = () => {
      // Auto-advance to next track (loop through)
      if (currentIndex === null) return;
      const next = (currentIndex + 1) % TRACKS.length;
      setCurrentIndex(next);
      setIsPlaying(true); // keep playing next
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When currentTrack changes, load and (optionally) play it
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack) {
      audio.src = currentTrack.src;
      audio.currentTime = 0;
      if (isPlaying) {
        audio
          .play()
          .then(() => {
            toast.success(`Playing: ${currentTrack.title}`);
          })
          .catch((err) => {
            setIsPlaying(false);
            toast.error("Playback failed. Check file path or user gesture policy.");
            console.error(err);
          });
      } else {
        audio.pause();
      }
    } else {
      // No track selected
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [currentTrack, isPlaying]);

  const togglePlayForIndex = (index: number) => {
    // If clicking the same track, toggle; else switch & play
    if (currentIndex === index) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        toast.message("Paused");
      } else {
        setIsPlaying(true);
        // play() will be triggered by effect
      }
    } else {
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  const handleGlobalPlayPause = () => {
    if (currentIndex === null) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    }
  };

  return (
    <MaxWidthWrapper className="h-[100vh] w-full overflow-hidden relative flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-3">
        {/* Tape / Now Playing */}
        <div className="relative w-[375px] h-[482px]">
          <Image src="/tape.png" alt="Tape" fill className="object-contain" priority />

          {/* Center disc spins only while playing */}
          <img
            src={currentTrack?.thumb}
            className={`w-[59px] h-[59px] absolute top-[38%] rounded-full left-1/2 -translate-x-1/2 -translate-y-1/2 ${
              isPlaying ? "animate-spin" : ""
            }`}
            alt="Discs"
          />
          {/* 8-bit pixel wave window */}
          <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[163px] h-[71px] bg-black/90 border border-white/15 shadow-inner overflow-hidden">
            {/* Visualizer sits behind the label text */}
            <PixelEQ className="brightness-25" isPlaying={isPlaying} barCount={20} palette="teal" />

            {/* Overlay title/status */}
            <button
              onClick={handleGlobalPlayPause}
              className="absolute inset-0 flex items-center justify-center p-1.5 focus:outline-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <p className="text-teal-500 brightness-125 text-xs leading-tight font-mono text-center drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
                {currentTrack ? (
                  <>
                    {currentTrack.title}
                    <br />[{isPlaying ? "Playing" : "Paused"}]
                  </>
                ) : (
                  <>
                    Click on tracks to play music
                    <br />
                    [CASSETTE]
                  </>
                )}
              </p>
            </button>
          </div>
        </div>

        {/* Track Carousel */}
        <Carousel opts={{ loop: true }} className="max-w-[565px]">
          <CarouselContent>
            {TRACKS.map((track, index) => (
              <CarouselItem className="basis-1/4 md:basis-1/5" key={track.id} onClick={() => togglePlayForIndex(index)}>
                <Card
                  title={track.title}
                  thumb={track.thumb ?? "/home.png"}
                  active={currentIndex === index}
                  playing={currentIndex === index && isPlaying}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </MaxWidthWrapper>
  );
};

export default SoundsPage;

const Card = ({ title, thumb, active, playing }: { title: string; thumb: string; active: boolean; playing: boolean }) => {
  return (
    <div
      className={`relative group overflow-hidden w-full h-full transition-all duration-300 ease-in-out cursor-pointer ${
        active ? "ring-2 ring-white/70 rounded-2xl" : "hover:rounded-2xl"
      }`}
      title={title}
    >
      <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black/45 backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300 ease-in-out transition-all">
        {playing ? <IconPlayerPauseFilled className="w-8 h-8 text-white" /> : <IconPlayerPlayFilled className="w-8 h-8 text-white" />}
      </div>
      <img src={thumb} alt={title} className="object-contain w-full h-[75px] mx-auto" />
    </div>
  );
};

function PixelEQ({
  isPlaying,
  className,
  barCount = 24, // number of columns (chunkier = fewer)
  palette = "teal", // "teal" | "lime" | "pink" | "white"
}: {
  isPlaying: boolean;
  className?: string;
  barCount?: number;
  palette?: "teal" | "lime" | "pink" | "white";
}) {
  // Precompute per-bar animation duration & phase for organic feel
  const bars = useMemo(
    () =>
      Array.from({ length: barCount }).map((_, i) => {
        const base = 650 + Math.random() * 900; // 650–1550ms
        const delay = -Math.random() * 1200; // negative = desync start
        return {
          w: Math.max(1, Math.floor(163 / barCount)), // pixel-ish width
          x: Math.floor((i * 163) / barCount),
          dur: Math.round(base),
          delay: Math.round(delay),
        };
      }),
    [barCount]
  );

  // Simple palettes (flat 8-bit vibes)
  const color =
    palette === "lime" ? "rgb(150,255,150)" : palette === "pink" ? "rgb(255,160,200)" : palette === "white" ? "rgb(230,230,230)" : "rgb(120,255,255)"; // teal

  return (
    <div
      className={className}
      style={{
        width: 163,
        height: 71,
        background: "rgba(0,0,0,0.9)",
        imageRendering: "pixelated",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "inset 0 0 12px rgba(0,0,0,0.6)",
      }}
      aria-hidden
    >
      {bars.map((b, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            bottom: 1, // leave a 1px gutter like old VU windows
            left: b.x,
            width: b.w,
            // Start at a tiny height, animation will step between pixel heights
            height: 4,
            background: color,
            // Pixel block edges
            borderRadius: 0,
            // 8-bit “stepped” motion: keyframes jump to set pixel heights
            animation: `eqSteps ${b.dur}ms steps(1, end) infinite`,
            animationPlayState: isPlaying ? "running" : "paused",
            animationDelay: `${b.delay}ms`,
          }}
        />
      ))}

      {/* Local keyframes — tuned to 71px high window using chunky pixel heights */}
      <style jsx>{`
        @keyframes eqSteps {
          0% {
            height: 6px;
          }
          12% {
            height: 14px;
          }
          25% {
            height: 28px;
          }
          37% {
            height: 10px;
          }
          50% {
            height: 40px;
          }
          62% {
            height: 18px;
          }
          75% {
            height: 56px;
          }
          87% {
            height: 24px;
          }
          100% {
            height: 34px;
          }
        }
      `}</style>
    </div>
  );
}
