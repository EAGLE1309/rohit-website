"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { IconPlayerPlayFilled, IconPlayerTrackNext, IconPlayerTrackPrev, IconPlayerPauseFilled } from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import Image from "next/image";

const BAR_COUNT = 56; // denser waveform for the 223px viewport

const MusicsComponent = ({ TRACKS }: { TRACKS: any }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const loadedTrackKeyRef = useRef<string | number | null>(null);

  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(12));
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [bufferedSeconds, setBufferedSeconds] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isLoading, setIsLoading] = useState(false);
  const isPlayingRef = useRef(isPlaying);
  const waveformRef = useRef<HTMLDivElement>(null);
  const isSeekingRef = useRef(false);
  const latestTrackIndex = TRACKS.length > 0 ? TRACKS.length - 1 : null;

  const currentTrack = useMemo(() => (currentIndex !== null ? TRACKS[currentIndex] : null), [currentIndex, TRACKS]);

  // Init audio element + WebAudio analyser
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "metadata";
    audio.volume = volume;

    // setup event handlers
    const updateBufferedInfo = () => {
      if (!audio.buffered || audio.buffered.length === 0) {
        setBufferedPercent(0);
        setBufferedSeconds(0);
        return;
      }
      try {
        const latestBufferEnd = audio.buffered.end(audio.buffered.length - 1);
        setBufferedSeconds(latestBufferEnd);
        const durationValue = audio.duration;
        if (Number.isFinite(durationValue) && durationValue > 0) {
          const ratio = Math.max(0, Math.min(1, latestBufferEnd / durationValue));
          setBufferedPercent(ratio);
        } else {
          setBufferedPercent(0);
        }
      } catch {
        setBufferedPercent(0);
        setBufferedSeconds(0);
      }
    };

    const onEnded = () => {
      // use functional update so we never rely on a stale currentIndex
      setCurrentIndex((prevIndex) => {
        if (prevIndex === null || !TRACKS.length) return prevIndex;
        const next = (prevIndex + 1) % TRACKS.length;
        return next;
      });
      setIsPlaying(true);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      const newDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(newDuration || 0);
      updateBufferedInfo();
      setIsLoading(false);
    };
    const onProgress = () => updateBufferedInfo();

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("progress", onProgress);

    // cleanup
    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("progress", onProgress);
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
      } catch {
        // ignore
      }
      audioRef.current = null;
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // When currentTrack / isPlaying changes: load / play and ensure AudioContext exists & RAF runs while playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let canceled = false;

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
      const trackKey = currentTrack.id ?? currentTrack.src;
      const trackChanged = loadedTrackKeyRef.current !== trackKey;

      if (trackChanged) {
        loadedTrackKeyRef.current = trackKey;
        audio.src = currentTrack.src;
        audio.currentTime = 0;
        setBufferedPercent(0);
        setBufferedSeconds(0);
        setIsLoading(true);
      }
      if (isPlaying) {
        // ensure audio context exists and resume it (user gesture)
        startAnalyserIfNeeded().then(() => {
          if (canceled || !isPlayingRef.current || loadedTrackKeyRef.current !== trackKey) {
            return;
          }
          audio
            .play()
            .then(() => {
              if (canceled || !isPlayingRef.current || loadedTrackKeyRef.current !== trackKey) {
                return;
              }
              // kick off draw loop if not already running
              if (!rafRef.current) {
                const drawLoop = () => {
                  const analyser = analyserRef.current;
                  if (analyser) {
                    const bins = analyser.frequencyBinCount;
                    const data = new Uint8Array(bins);
                    analyser.getByteFrequencyData(data);

                    const step = Math.floor(data.length / BAR_COUNT) || 1;
                    const newLevels = new Array(BAR_COUNT).fill(12).map((_, i) => {
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
                      const scaled = Math.max(8, Math.min(42, Math.round((avg / 255) * 42)));
                      return scaled;
                    });
                    setLevels(newLevels);
                  } else {
                    // fallback subtle animation
                    setLevels((prev) => prev.map((_, idx) => 14 + Math.round(Math.abs(Math.sin(Date.now() / 320 + idx)) * 16)));
                  }
                  rafRef.current = requestAnimationFrame(drawLoop);
                };
                rafRef.current = requestAnimationFrame(drawLoop);
              }
              toast.success(`Playing: ${currentTrack.title}`);
            })
            .catch((err) => {
              if (canceled || loadedTrackKeyRef.current !== trackKey) {
                return;
              }
              // Ignore expected abort errors when user pauses or switches tracks mid-load
              const errMsg = typeof err?.message === "string" ? err.message : "";
              const wasInterrupted = errMsg.includes("pause") || errMsg.includes("interrupted") || errMsg.includes("AbortError");
              if (!isPlayingRef.current || wasInterrupted) {
                return;
              }

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
      loadedTrackKeyRef.current = null;
      setBufferedPercent(0);
      setBufferedSeconds(0);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      canceled = true;
    };
  }, [currentTrack, isPlaying]);

  // toggle / controls (unchanged)
  const togglePlayForIndex = (index: number) => {
    const audio = audioRef.current;

    if (currentIndex === index) {
      // Same track: simple play / pause toggle
      if (isPlaying) {
        audio?.pause();
        setIsPlaying(false);
        toast.message("Paused");
      } else {
        setIsPlaying(true);
      }
      return;
    }

    // Different track: ensure we fully reset previous playback/loading state
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentTime(0);
    setDuration(0);
    setBufferedPercent(0);
    setBufferedSeconds(0);

    // Clear RAF so we don't keep an analyser loop tied to the previous track
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleGlobalPlayPause = () => {
    if (currentIndex === null) {
      if (latestTrackIndex !== null) {
        setCurrentIndex(latestTrackIndex);
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleWaveformPlayToggle = () => {
    if (currentIndex === null) {
      if (latestTrackIndex === null) return;
      setCurrentIndex(latestTrackIndex);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const seekFromClientX = (clientX: number) => {
    const audio = audioRef.current;
    const waveform = waveformRef.current;
    if (!audio || !waveform || duration === 0) return;

    const rect = waveform.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percent * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleWaveformPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    e.preventDefault();
    isSeekingRef.current = true;
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore capture errors
      }
    }
    seekFromClientX(e.clientX);
  };

  const handleWaveformPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    e.preventDefault();
    seekFromClientX(e.clientX);
  };

  const stopSeeking = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    e.preventDefault();
    isSeekingRef.current = false;
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore release errors
      }
    }
  };

  const handleWaveformPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    seekFromClientX(e.clientX);
    stopSeeking(e);
  };

  const handleWaveformPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    stopSeeking(e);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeMarkers = useMemo(() => {
    const markerCount: number = 5;
    if (duration <= 0) {
      return [{ position: 0, label: "00:00" }];
    }
    return Array.from({ length: markerCount }).map((_, idx) => {
      const ratio = markerCount === 1 ? 0 : idx / (markerCount - 1);
      return {
        position: ratio,
        label: formatTime(ratio * duration),
      };
    });
  }, [duration]);

  // RESERVED
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const goToPrevTrack = () => {
    if (!TRACKS.length) return;
    setCurrentIndex((prevIndex) => {
      if (prevIndex === null) return TRACKS.length - 1;
      return prevIndex === 0 ? TRACKS.length - 1 : prevIndex - 1;
    });
    setIsPlaying(true);
  };

  const goToNextTrack = () => {
    if (!TRACKS.length) return;
    setCurrentIndex((prevIndex) => {
      if (prevIndex === null) return 0;
      return (prevIndex + 1) % TRACKS.length;
    });
    setIsPlaying(true);
  };

  // compute played index to color bars up to that index instantly (no slow transition)
  const progress = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
  const playedIndex = Math.floor(progress * BAR_COUNT);
  const bufferedRatio = Math.max(0, Math.min(1, bufferedPercent));
  const isBuffering = duration === 0 || bufferedRatio < 0.98;
  const bufferedTime = Math.max(0, Math.min(bufferedSeconds, duration || bufferedSeconds || 0));
  const bufferedTimeLabel = formatTime(bufferedTime);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-[272px] h-[425px]">
        <Image src="/casette.webp" alt="Tape" fill className="object-contain pointer-events-none" priority />

        <img
          src={currentTrack?.thumb || "/discs.png"}
          className={`w-[59px] h-[59px] absolute top-[30.5%] rounded-full pointer-events-none left-[49.5%] -translate-x-1/2 -translate-y-1/2 ${
            isPlaying ? "animate-spin" : ""
          }`}
          alt="Discs"
        />

        {/* Waveform visualizer window */}
        <div className="absolute bottom-[6.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[223px] h-[71px] bg-[#040404] border border-white/15 rounded-xs shadow-[0_4px_18px_rgba(0,0,0,0.65)] text-white px-2.5 py-1.5 overflow-hidden">
          <div className="flex items-center justify-between text-[8.5px] uppercase tracking-[0.18em]">
            <div className="flex items-center justify-between w-full">
              <button onClick={goToPrevTrack} className="p-0.5 rounded-sm hover:bg-white/10 transition-colors" aria-label="Previous track">
                <IconPlayerTrackPrev className="w-3 h-3" />
              </button>
              <span className="text-[7px] font-mono truncate">{currentTrack ? currentTrack.title : "Select Track"}</span>
              <button
                onClick={handleWaveformPlayToggle}
                className="p-0.5 rounded-sm hover:bg-white/10 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <IconPlayerPauseFilled className="w-3 h-3" /> : <IconPlayerPlayFilled className="w-3 h-3" />}
              </button>
              <button onClick={goToNextTrack} className="p-0.5 rounded-sm hover:bg-white/10 transition-colors" aria-label="Next track">
                <IconPlayerTrackNext className="w-3 h-3" />
              </button>
            </div>
            {/* <div className="flex items-center gap-0.5 text-white/70">
              <IconVolume className="w-3 h-3" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                className="h-[2px] w-12 accent-white"
              />
            </div> */}
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-white/70 mt-0.5">
            <span>{formatTime(currentTime)}</span>
            <span className={isBuffering ? "text-sky-300" : "text-emerald-300"}>
              {isBuffering ? `Loading ${(bufferedRatio * 100).toFixed(0)}% · ${bufferedTimeLabel}` : `Loaded · ${bufferedTimeLabel}`}
            </span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="mt-0.5" style={{ height: "26px" }}>
            <div
              ref={waveformRef}
              onPointerDown={handleWaveformPointerDown}
              onPointerMove={handleWaveformPointerMove}
              onPointerUp={handleWaveformPointerUp}
              onPointerLeave={stopSeeking}
              onPointerCancel={handleWaveformPointerCancel}
              className="relative h-full rounded-sm border border-white/10 bg-black/80 cursor-pointer overflow-hidden"
              style={{ touchAction: "none" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10 opacity-60 pointer-events-none" />
              <div
                className="absolute inset-y-0 left-0 bg-white/10 pointer-events-none transition-[width] duration-300"
                style={{ width: `${bufferedRatio * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-white/15 pointer-events-none transition-[width] duration-150"
                style={{ width: `${progress * 100}%` }}
              />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/15 pointer-events-none" />
              <div className="relative z-10 flex h-full w-full items-center justify-between px-2" style={{ gap: "2px" }}>
                {Array.from({ length: BAR_COUNT }).map((_, i) => {
                  const h = levels[i] ?? 10;
                  const isPlayed = i <= playedIndex;
                  const width = i % 3 === 0 ? 2 : 1;
                  return (
                    <div
                      key={i}
                      className="rounded-full transition-[height] duration-120 ease-out"
                      style={{
                        height: `${h}px`,
                        width: `${width}px`,
                        backgroundColor: isPlayed ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                        boxShadow: isPlayed ? "0 0 6px rgba(255,255,255,0.45)" : "none",
                      }}
                    />
                  );
                })}
              </div>
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-red-500 shadow-[0_0_6px_rgba(255,45,45,0.8)] pointer-events-none"
                style={{ left: `calc(${progress * 100}% - 1px)` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-white text-[8px] font-mono mt-0.5 opacity-80">
            {timeMarkers.map((marker) => (
              <span key={marker.position.toFixed(2)}>{marker.label}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center pb-3">
          <button
            onClick={handleGlobalPlayPause}
            className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <span className="block w-2.5 h-2.5 bg-white" /> : <IconPlayerPlayFilled className="w-3 h-3 text-white" />}
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
                loading={currentIndex === index && isLoading}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default MusicsComponent;

const Card = ({ title, thumb, active, playing, loading }: { title: string; thumb: string; active: boolean; playing: boolean; loading?: boolean }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`relative group overflow-hidden w-full h-full transition-all duration-300 ease-in-out cursor-pointer
            ${active ? "rounded-2xl" : "hover:rounded-2xl hover:scale-105"}
            ${playing ? "" : ""}
          `}
        >
          {/* Active glow effect */}
          {active && <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 via-transparent to-white/10 pointer-events-none" />}

          {/* Image with subtle zoom on hover */}
          <img
            src={thumb}
            alt={title}
            className={`object-contain w-full min-h-[75px] mx-auto transition-transform duration-500 ease-out ${
              active || playing ? "" : "group-hover:scale-110"
            }`}
          />

          {/* Overlay with controls */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${
              active || playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {loading ? (
              <div className="relative">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            ) : playing ? (
              <div className="relative animate-scale-in">
                <IconPlayerPauseFilled className="w-8 h-8 text-white drop-shadow-lg" />
                <div className="absolute -inset-2 bg-white/20 rounded-full blur-md -z-10 animate-pulse" />
              </div>
            ) : (
              <div className="relative group-hover:animate-scale-in">
                <IconPlayerPlayFilled className="w-8 h-8 text-white drop-shadow-lg transition-transform group-hover:scale-110" />
              </div>
            )}
          </div>

          {/* Playing indicator - subtle corner pulse */}
          {playing && !loading && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-medium">{title}</p>
          {loading && <p className="text-xs text-white/70 mt-1">Loading...</p>}
          {playing && !loading && <p className="text-xs text-green-400 mt-1">● Now Playing</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
