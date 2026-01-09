import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  poster: string;
}

export const VideoPlayer = ({ videoUrl, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Format time helper
  const formatTime = useCallback((sec: number) => {
    if (!sec || Number.isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  // 1. Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 2. Control Visibility Logic
  const startHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    // Disappear after 2.5 seconds of inactivity
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
      }
    }, 2500);
  }, []);

  const handleInteraction = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    // Only start the hide timer if the video is actually playing
    if (isPlaying) {
      startHideTimer();
    }
  }, [isPlaying, startHideTimer]);

  // 3. Play/Pause Toggle
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    if (v.paused) {
      v.play();
      setIsPlaying(true);
      startHideTimer(); // Start timer immediately on play
    } else {
      v.pause();
      setIsPlaying(false);
      setControlsVisible(true); // Always show controls when paused
      if (hideTimer.current) clearTimeout(hideTimer.current); // Cancel any hide timer
    }
  }, [startHideTimer]);

  // 4. Initial Load (Big Play Button)
  const handleInitialLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Auto-play trigger once loaded
  useEffect(() => {
    if (isLoaded && videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          startHideTimer();
        })
        .catch((err) => console.error("Autoplay blocked/failed", err));
    }
  }, [isLoaded, startHideTimer]);

  // 5. Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      // Interaction handlers for visibility
      onMouseMove={handleInteraction}
      onMouseEnter={handleInteraction}
      onMouseLeave={() => {
        // When leaving window, start the timer instead of hiding immediately
        if (isPlaying) startHideTimer();
      }}
      className={`group relative bg-black overflow-hidden transition-all duration-300 ${isFullscreen
        ? "fixed inset-0 z-50 flex items-center justify-center bg-black"
        : "w-full h-auto"
        }`}
    >
      {/* VIDEO ELEMENT */}
      <video
        ref={videoRef}
        poster={poster}
        src={isLoaded ? videoUrl : undefined}
        preload={isLoaded ? "auto" : "none"}
        playsInline
        onClick={isLoaded ? togglePlay : handleInitialLoad}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onEnded={() => {
          setIsPlaying(false);
          setControlsVisible(true);
        }}
        className={`w-full cursor-pointer transition-opacity duration-300 ${isFullscreen
          ? "h-full w-full object-contain"
          : "h-auto block"
          } ${!isLoaded ? "opacity-90" : "opacity-100"}`}
      />

      {/* --- BIG CENTER PLAY BUTTON (Initial State) --- */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10 hover:bg-black/20 transition-colors">
          <button
            onClick={handleInitialLoad}
            className="group/btn relative flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-xl hover:scale-110 transition-transform duration-200"
            aria-label="Load and Play Video"
          >
            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" />
          </button>
        </div>
      )}

      {/* --- CONTROLS OVERLAY --- */}
      {isLoaded && (
        <div
          className={`
            absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%]
            bg-black/35 backdrop-blur-md rounded-xl px-4 py-2
            flex items-center gap-4 text-white shadow-2xl border border-white/10
            transition-all duration-500 ease-in-out z-20
            ${controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
          `}
        >
          {/* Play/Pause */}
          <button onClick={togglePlay} className="hover:text-gray-300 transition-colors">
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Time */}
          <span className="text-sm font-sans min-w-[85px] select-none">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const t = Number(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = t;
              setCurrentTime(t);
            }}
            // Added z-50 to ensure dragging slider doesn't lose focus easily
            className="relative z-50 flex-1 h-2 bg-white/30 rounded-lg accent-white cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
          />

          {/* Fullscreen Button */}
          <button onClick={toggleFullscreen} className="hover:text-gray-300 transition-colors text-lg">
            ⛶
          </button>
        </div>
      )}
    </div>
  );
};
