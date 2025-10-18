"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { getMusics } from "@/lib/dashboard/queries/musics";

type Track = {
  id: number;
  title: string;
  artist?: string;
  src: string;
  thumb?: string;
};

// const TRACKS: Track[] = Array.from({ length: 15 }).map((_, i) => ({
//   id: i,
//   title: `Track ${i + 1}`,
//   artist: "Unknown",
//   src: `/audio/footsteps.mp3`,
//   thumb: "/discs.png",
// }));

// console.log(TRACKS);

const BAR_COUNT = 34; // keep it small for 163px width

const SoundsComponent = ({ TRACKS }: { TRACKS: any }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(3));
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const waveformRef = useRef<HTMLDivElement>(null);

  const currentTrack = useMemo(() => (currentIndex !== null ? TRACKS[currentIndex] : null), [currentIndex, TRACKS]);

  // Init audio element + WebAudio analyser
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "metadata";

    // setup event handlers
    const onEnded = () => {
      if (currentIndex === null) return;
      const next = (currentIndex + 1) % TRACKS.length;
      setCurrentIndex(next);
      setIsPlaying(true);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    // create AudioContext + Analyser when user interacts (deferred until needed)
    // We'll create lazily when play is first triggered to satisfy autoplay/user gesture rules.
    const ensureAudioContext = async () => {
      if (audioContextRef.current) return;
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;
      try {
        const source = ctx.createMediaElementSource(audio);
        sourceRef.current = source;
        source.connect(analyser);
        analyser.connect(ctx.destination);
      } catch (err) {
        // if creating MediaElementSource fails (shouldn't normally), ignore and keep fallback
        console.warn("AudioContext media source setup failed", err);
      }
    };

    // draw loop
    let dataArray = new Uint8Array(analyserRef.current ? analyserRef.current.frequencyBinCount : 128);
    const draw = () => {
      const analyser = analyserRef.current;
      if (analyser) {
        const bins = analyser.frequencyBinCount;
        // ensure dataArray length matches
        if (dataArray.length !== bins) {
          dataArray = new Uint8Array(bins);
        }
        analyser.getByteFrequencyData(dataArray);

        // Map frequency bins to BAR_COUNT bars
        const step = Math.floor(dataArray.length / BAR_COUNT) || 1;
        const newLevels = new Array(BAR_COUNT).fill(3).map((_, i) => {
          // average over step
          let sum = 0;
          let count = 0;
          for (let j = 0; j < step; j++) {
            const idx = i * step + j;
            if (idx < dataArray.length) {
              sum += dataArray[idx];
              count++;
            }
          }
          const avg = count ? sum / count : 0;
          // convert 0-255 to px height (clamped for small container)
          const scaled = Math.max(3, Math.min(30, Math.round((avg / 255) * 30)));
          return scaled;
        });
        setLevels(newLevels);
      } else {
        // fallback: slight pulsing when no analyser
        setLevels((prev) => prev.map((v, i) => 6 + Math.round(Math.abs(Math.sin(Date.now() / 300 + i)) * 12)));
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // start RAF only when playing; we'll control it elsewhere.
    // cleanup
    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      // stop RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // disconnect audio graph
      try {
        if (sourceRef.current) sourceRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current) {
          // don't always close; suspend instead to be safer
          audioContextRef.current.close().catch(() => {});
        }
      } catch (err) {
        // ignore
      }
      audioRef.current = null;
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When currentTrack / isPlaying changes: load / play and ensure AudioContext exists & RAF runs while playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const startAnalyserIfNeeded = async () => {
      if (!audioContextRef.current) {
        // create and connect
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.85;
          analyserRef.current = analyser;
          try {
            const source = ctx.createMediaElementSource(audio);
            sourceRef.current = source;
            source.connect(analyser);
            analyser.connect(ctx.destination);
          } catch (err) {
            console.warn("createMediaElementSource failed", err);
          }
        }
      }
    };

    if (currentTrack) {
      audio.src = currentTrack.src;
      audio.currentTime = 0;
      if (isPlaying) {
        // ensure audio context exists and resume it (user gesture)
        startAnalyserIfNeeded().then(() => {
          audio
            .play()
            .then(() => {
              // kick off draw loop if not already running
              if (!rafRef.current) {
                const drawLoop = () => {
                  const analyser = analyserRef.current;
                  if (analyser) {
                    const bins = analyser.frequencyBinCount;
                    const data = new Uint8Array(bins);
                    analyser.getByteFrequencyData(data);

                    const step = Math.floor(data.length / BAR_COUNT) || 1;
                    const newLevels = new Array(BAR_COUNT).fill(3).map((_, i) => {
                      let sum = 0;
                      let count = 0;
                      for (let j = 0; j < step; j++) {
                        const idx = i * step + j;
                        if (idx < data.length) {
                          sum += data[idx];
                          count++;
                        }
                      }
                      const avg = count ? sum / count : 0;
                      const scaled = Math.max(3, Math.min(30, Math.round((avg / 255) * 30)));
                      return scaled;
                    });
                    setLevels(newLevels);
                  } else {
                    // fallback subtle animation
                    setLevels((prev) => prev.map((v, idx) => 6 + Math.round(Math.abs(Math.sin(Date.now() / 300 + idx)) * 12)));
                  }
                  rafRef.current = requestAnimationFrame(drawLoop);
                };
                rafRef.current = requestAnimationFrame(drawLoop);
              }
              toast.success(`Playing: ${currentTrack.title}`);
            })
            .catch((err) => {
              setIsPlaying(false);
              toast.error("Playback failed. Check file path or user gesture policy.");
              console.error(err);
            });
        });
      } else {
        audio.pause();
        // stop RAF
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, isPlaying]);

  // toggle / controls (unchanged)
  const togglePlayForIndex = (index: number) => {
    if (currentIndex === index) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        toast.message("Paused");
      } else {
        setIsPlaying(true);
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

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !waveformRef.current || duration === 0) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // compute played index to color bars up to that index instantly (no slow transition)
  const progress = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
  const playedIndex = Math.floor(progress * BAR_COUNT);

  return (
    <MaxWidthWrapper className="h-[100vh] w-full overflow-hidden relative flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative pointer-events-none w-[272px] h-[425px]">
          <Image src="/casette.webp" alt="Tape" fill className="object-contain pointer-events-none" priority />

          <img
            src={currentTrack?.thumb || "/discs.png"}
            className={`w-[59px] h-[59px] absolute top-[30.5%] rounded-full pointer-events-none left-[49.5%] -translate-x-1/2 -translate-y-1/2 ${
              isPlaying ? "animate-spin" : ""
            }`}
            alt="Discs"
          />

          {/* Waveform visualizer window — resized to 163x71 */}
          <div className="absolute bottom-[6.25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[223px] h-[71px] bg-black/90 border shadow-inner overflow-hidden border-white/15">
            <div className="absolute top-1 left-2 right-2 text-white text-[9px] font-mono truncate">
              {currentTrack ? currentTrack.title : "No Track"}
            </div>

            <div ref={waveformRef} onClick={handleWaveformClick} className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[36px] cursor-pointer">
              <div className="flex items-end h-full px-2 gap-[1px]">
                {Array.from({ length: BAR_COUNT }).map((_, i) => {
                  // use analyser driven height if available else fallback
                  const h = levels[i] ?? 6;
                  const isPlayed = i <= playedIndex;
                  return (
                    <div
                      key={i}
                      // removed slow transition so changes are immediate and in-sync with playhead
                      className="w-[2px] rounded-sm"
                      style={{
                        height: `${h}px`,
                        backgroundColor: isPlayed ? "#ffffff" : "#6b6b6b",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="absolute bottom-1 left-2 right-2 flex justify-between text-white text-[9px] font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <button
              onClick={handleGlobalPlayPause}
              className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <IconPlayerPauseFilled className="w-3 h-3 text-white" /> : <IconPlayerPlayFilled className="w-3 h-3 text-white" />}
            </button>
          </div>
        </div>

        <Carousel opts={{ loop: true }} className="max-w-[565px]">
          <CarouselContent>
            {TRACKS.map((track: any, index: number) => (
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

export default SoundsComponent;

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
      <img src={thumb} alt={title} className="object-contain w-full min-h-[75px] mx-auto" />
    </div>
  );
};
