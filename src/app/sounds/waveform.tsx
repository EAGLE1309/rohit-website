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
            <Waveform width="100%" height={72} bars={60} />
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
/* - `bars` controls number of vertical bars in waveform
   - heights are generated procedurally to create that "dense mono" waveform look
*/
function Waveform({ width = "100%", height = 72, bars = 60 }: { width?: string; height?: number; bars?: number }) {
  // create deterministic-ish heights so waveform looks "designed"
  const seed = 1337;
  const rand = (i: number) => {
    // simple pseudo random deterministic function
    return Math.abs(Math.sin(i * 12.9898 + seed) * 43758.5453) % 1;
  };

  const barElements = Array.from({ length: bars }).map((_, i) => {
    // vary height: center area slightly taller to match screenshot density
    const mid = bars / 2;
    const dist = Math.abs(i - mid) / mid;
    const base = 0.15 + (1 - dist) * 0.85; // center bigger
    const jitter = 0.2 + rand(i) * 0.8; // add randomness
    const hFactor = base * jitter;

    // map to pixels
    const barMax = height * 0.9; // leave small padding top/bottom
    const barH = Math.max(2, Math.round(barMax * hFactor));
    const barW = Math.max(2, Math.round(width === "100%" ? 4 : 4)); // fixed pixel-like width
    const gap = 2;
    const x = i * (barW + gap);

    const y = (height - barH) / 2;

    // vary opacity slightly to produce foreground/backfade effect
    // simulate the waveform fading to the right (like screenshot) by reducing opacity based on x
    const fadeFactor = 1 - (i / bars) * 0.55;
    const opacity = 0.85 * fadeFactor;

    return <rect key={i} x={x} y={y} width={barW} height={barH} rx={1} ry={1} fill={`rgba(255,255,255,${opacity.toFixed(3)})`} />;
  });

  const viewWidth = bars * 6; // bar + gap approx
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
