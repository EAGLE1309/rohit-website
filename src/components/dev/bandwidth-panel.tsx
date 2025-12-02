"use client";

import { useEffect, useState } from "react";
import { bandwidthMetrics, formatBytes, type BandwidthSummary } from "@/lib/bandwidth-metrics";

const isDev = process.env.NODE_ENV === "development";

/**
 * Dev-only bandwidth monitoring panel
 * Shows real-time bandwidth usage by type
 *
 * Usage: Add <BandwidthPanel /> anywhere in your layout
 * Only visible in development mode
 */
export default function BandwidthPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<BandwidthSummary | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const handleEnable = () => {
    bandwidthMetrics.enable();
    setIsEnabled(true);
  };

  // Update summary periodically when open
  useEffect(() => {
    if (!isDev) return;
    if (!isOpen || !isEnabled) return;

    const interval = setInterval(() => {
      setSummary(bandwidthMetrics.getSummary());
    }, 1000);

    // Initial update
    setSummary(bandwidthMetrics.getSummary());

    return () => clearInterval(interval);
  }, [isOpen, isEnabled]);

  const typeIcons: Record<string, string> = {
    image: "🖼️",
    audio: "🎵",
    video: "🎬",
    api: "📡",
    other: "📦",
  };

  // Only render in development
  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/90 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-black transition-colors border border-white/20"
      >
        📊 {isOpen ? "Hide" : "Bandwidth"}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-black/95 text-white rounded-lg shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-3 border-b border-white/10 flex justify-between items-center">
            <span className="font-bold">Bandwidth Monitor</span>
            {isEnabled && (
              <button
                onClick={() => {
                  bandwidthMetrics.reset();
                  setSummary(bandwidthMetrics.getSummary());
                }}
                className="text-[10px] px-2 py-1 bg-white/10 rounded hover:bg-white/20"
              >
                Reset
              </button>
            )}
          </div>

          {!isEnabled ? (
            <div className="p-4 text-center">
              <p className="text-white/60 mb-3">Click to start tracking bandwidth</p>
              <button onClick={handleEnable} className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors">
                Enable Tracking
              </button>
            </div>
          ) : summary ? (
            <div className="p-3 space-y-3">
              {/* Total */}
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-white/60">Total</span>
                <span className="text-lg font-bold text-green-400">{summary.totalMB} MB</span>
              </div>

              {/* Duration */}
              <div className="flex justify-between text-[10px] text-white/40">
                <span>Session</span>
                <span>{summary.duration}</span>
              </div>

              {/* By Type */}
              <div className="space-y-2">
                {Object.entries(summary.byType).map(([type, data]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>{typeIcons[type] || "📦"}</span>
                      <span className="capitalize">{type}</span>
                    </span>
                    <span className="text-white/80">
                      {data.mb} MB
                      <span className="text-white/40 ml-1">({data.count})</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent entries */}
              {summary.entries.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] text-white/40 mb-1">Recent (last 5)</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {summary.entries
                      .slice(-5)
                      .reverse()
                      .map((entry, i) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span className="truncate max-w-[180px] text-white/60">
                            {typeIcons[entry.type]} {entry.url.split("/").pop()?.slice(0, 25)}
                          </span>
                          <span className="text-white/40">{formatBytes(entry.size)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Console button */}
              <button
                onClick={() => bandwidthMetrics.logReport()}
                className="w-full mt-2 text-[10px] py-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors"
              >
                Log Full Report to Console
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-white/60">Loading...</div>
          )}
        </div>
      )}
    </div>
  );
}
