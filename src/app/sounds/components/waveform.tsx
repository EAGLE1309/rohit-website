import { useMemo } from "react";

type Track = { title: string; duration?: number };

export default function WavePlayerCard({
  currentTrack,
  isPlaying,
  progress = 0, // number 0..1 controlling scrubber position
  onTogglePlay,
}: {
  currentTrack?: Track | null;
  isPlaying: boolean;
  progress?: number;
  onTogglePlay?: () => void;
}) {
  // ensure progress clamps 0..1
  const pct = Math.max(0, Math.min(1, progress));

  return (
    <div className="relative w-full max-w-[920px] h-[160px]">
      {/* Background container (mimics screenshot framing) */}
      <div className="absolute inset-0 bg-black border border-white/15 shadow-inner overflow-hidden">
        {/* Top-left title (small monospace) */}
        <div className="absolute top-3 left-4 text-white/90 font-mono text-sm select-none">DJ Mixtape 202</div>

        {/* Waveform + horizontal baseline */}
        <div className="absolute left-6 right-6 top-10 bottom-12 flex items-center">
          {/* horizontal baseline */}
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/8 pointer-events-none" />

          {/* Waveform SVG */}
          <div className="relative w-full flex items-center justify-center">
            <Waveform width="100%" height={72} bars={60} progress={pct} />
          </div>
        </div>

        {/* Red scrubber (vertical line + small bottom circle) */}
        <div className="absolute top-[calc(10px+36px-72px/2)] left-6 right-6 h-[72px] pointer-events-none" aria-hidden>
          <div className="absolute top-0 bottom-0 w-0" style={{ left: `calc(${pct * 100}% )` }}>
            {/* vertical line */}
            <div className="absolute -translate-x-1/2 w-[2px] h-full bg-red-600" />
            {/* small red circle around bottom of line */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-3 h-3 rounded-full bg-red-600 border border-red-400" />
          </div>
        </div>

        {/* Timestamps row */}
        <div className="absolute left-6 right-6 bottom-3 text-white/90 font-mono text-sm select-none">
          <div className="flex justify-between items-center">
            <span>0:00</span>
            <span>1:00</span>
            <span>2:00</span>
            <span>3:00</span>
            <span>4:00</span>
          </div>
        </div>

        {/* Play overlay button centered horizontally and vertically in the small square area (as in your markup) */}
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[163px] h-[71px] bg-black/90 border border-white/15 shadow-inner overflow-hidden">
          <button
            onClick={() => onTogglePlay?.()}
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
    </div>
  );
}

/* ---------- Waveform component (SVG) ---------- */
/* Dense audio waveform visualization with white vertical bars */
function Waveform({ width = "100%", height = 1, bars = 80, progress = 0 }: { width?: string; height?: number; bars?: number; progress?: number }) {
  // Generate waveform pattern similar to the reference image (memoized — only recalculates when bars changes)
  const waveformData = useMemo(() => {
    const data: number[] = [];

    // Create a complex waveform pattern with multiple frequency components
    for (let i = 0; i < bars; i++) {
      const t = i / bars;

      // Combine multiple sine waves for natural audio-like appearance
      const wave1 = Math.sin(t * Math.PI * 4) * 0.4;
      const wave2 = Math.sin(t * Math.PI * 8 + 1.5) * 0.3;
      const wave3 = Math.sin(t * Math.PI * 16 + 0.7) * 0.2;
      const wave4 = Math.sin(t * Math.PI * 32 + 2.1) * 0.1;

      // Add some noise for variation
      const noise = Math.sin(i * 12.9898) * Math.cos(i * 78.233) * 0.15;

      // Combine all components
      let amplitude = wave1 + wave2 + wave3 + wave4 + noise;

      // Create envelope (louder in middle, quieter at edges)
      const envelope = Math.sin(t * Math.PI) * 0.8 + 0.2;
      amplitude *= envelope;

      // Normalize to 0-1 range
      amplitude = (amplitude + 1) / 2;

      data.push(amplitude);
    }

    return data;
  }, [bars]);

  const barWidth = 3;
  const barGap = 2;
  const totalBarWidth = barWidth + barGap;

  const barElements = waveformData.map((amplitude, i) => {
    // Map amplitude to bar height
    const minHeight = 4;
    const maxHeight = height * 0.85;
    const barHeight = minHeight + amplitude * (maxHeight - minHeight);

    const x = i * totalBarWidth;
    const y = (height - barHeight) / 2;

    // Determine if this bar has been played
    const isPlayed = i / bars <= progress;
    const opacity = isPlayed ? 0.95 : 0.35;

    return (
      <rect key={i} x={x} y={y} width={barWidth} height={barHeight} rx={barWidth / 2} ry={barWidth / 2} fill={`rgba(255, 255, 255, ${opacity})`} />
    );
  });

  const viewWidth = bars * totalBarWidth;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none"
      aria-hidden
    >
      <g>{barElements}</g>
    </svg>
  );
}
