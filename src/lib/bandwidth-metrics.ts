/**
 * Bandwidth Metrics Utility
 * Tracks and reports bandwidth usage across the application
 */

export interface BandwidthEntry {
  url: string;
  type: "image" | "audio" | "video" | "api" | "other";
  size: number; // bytes
  timestamp: number;
  cached: boolean;
}

export interface BandwidthSummary {
  totalBytes: number;
  totalMB: string;
  byType: Record<string, { count: number; bytes: number; mb: string }>;
  entries: BandwidthEntry[];
  sessionStart: number;
  duration: string;
}

class BandwidthMetrics {
  private entries: BandwidthEntry[] = [];
  private sessionStart: number = Date.now();
  private isEnabled: boolean = false;

  /**
   * Enable bandwidth tracking (call once on app init if needed)
   */
  enable() {
    if (typeof window === "undefined") return;
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.sessionStart = Date.now();
    this.interceptFetch();
    this.observeResources();

    console.log("[Bandwidth] Metrics tracking enabled");
  }

  /**
   * Intercept fetch requests to track API calls
   */
  private interceptFetch() {
    const originalFetch = window.fetch.bind(window);
    const addEntry = this.addEntry.bind(this);
    const getType = this.getTypeFromUrl.bind(this);

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const response = await originalFetch(...args);

      try {
        const input = args[0];
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const clone = response.clone();
        const blob = await clone.blob();

        addEntry({
          url: url.slice(0, 100),
          type: getType(url),
          size: blob.size,
          timestamp: Date.now(),
          cached: response.headers.get("x-cache") === "HIT",
        });
      } catch {
        // Ignore tracking errors
      }

      return response;
    };
  }

  /**
   * Observe resource loading via PerformanceObserver
   */
  private observeResources() {
    if (typeof PerformanceObserver === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        if (resource.transferSize > 0) {
          this.addEntry({
            url: resource.name.slice(0, 100),
            type: this.getTypeFromUrl(resource.name),
            size: resource.transferSize,
            timestamp: Date.now(),
            cached: resource.transferSize < resource.decodedBodySize * 0.1,
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["resource"] });
    } catch {
      // PerformanceObserver not supported
    }
  }

  /**
   * Determine resource type from URL
   */
  private getTypeFromUrl(url: string): BandwidthEntry["type"] {
    const lower = url.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)/.test(lower)) return "image";
    // Audio: file extensions or proxy-audio endpoint
    if (/(\.mp3|\.wav|\.ogg|\.m4a|\.aac|\.flac)/.test(lower) || lower.includes("proxy-audio")) return "audio";
    // Video: file extensions
    if (/(\.mp4|\.webm|\.mov|\.avi)/.test(lower)) return "video";
    if (lower.includes("/api/") || lower.includes("sanity.io")) return "api";
    return "other";
  }

  /**
   * Add a bandwidth entry
   */
  addEntry(entry: BandwidthEntry) {
    this.entries.push(entry);

    // Keep last 500 entries to prevent memory bloat
    if (this.entries.length > 500) {
      this.entries = this.entries.slice(-500);
    }
  }

  /**
   * Manually track a resource (useful for custom tracking)
   */
  track(url: string, size: number, type?: BandwidthEntry["type"]) {
    this.addEntry({
      url: url.slice(0, 100),
      type: type || this.getTypeFromUrl(url),
      size,
      timestamp: Date.now(),
      cached: false,
    });
  }

  /**
   * Get bandwidth summary
   */
  getSummary(): BandwidthSummary {
    const byType: Record<string, { count: number; bytes: number; mb: string }> = {};
    let totalBytes = 0;

    for (const entry of this.entries) {
      totalBytes += entry.size;

      if (!byType[entry.type]) {
        byType[entry.type] = { count: 0, bytes: 0, mb: "0" };
      }
      byType[entry.type].count++;
      byType[entry.type].bytes += entry.size;
    }

    // Calculate MB for each type
    for (const type of Object.keys(byType)) {
      byType[type].mb = (byType[type].bytes / (1024 * 1024)).toFixed(2);
    }

    const durationMs = Date.now() - this.sessionStart;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return {
      totalBytes,
      totalMB: (totalBytes / (1024 * 1024)).toFixed(2),
      byType,
      entries: this.entries.slice(-50), // Last 50 for display
      sessionStart: this.sessionStart,
      duration: `${minutes}m ${seconds}s`,
    };
  }

  /**
   * Get formatted report for console
   */
  getReport(): string {
    const summary = this.getSummary();

    let report = `\n📊 BANDWIDTH REPORT (${summary.duration})\n`;
    report += `${"─".repeat(40)}\n`;
    report += `Total: ${summary.totalMB} MB\n\n`;
    report += `By Type:\n`;

    for (const [type, data] of Object.entries(summary.byType)) {
      const icon = type === "image" ? "🖼️" : type === "audio" ? "🎵" : type === "video" ? "🎬" : type === "api" ? "📡" : "📦";
      report += `  ${icon} ${type}: ${data.mb} MB (${data.count} requests)\n`;
    }

    return report;
  }

  /**
   * Log report to console
   */
  logReport() {
    console.log(this.getReport());
  }

  /**
   * Reset metrics
   */
  reset() {
    this.entries = [];
    this.sessionStart = Date.now();
  }
}

// Singleton instance
export const bandwidthMetrics = new BandwidthMetrics();

// Helper to format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
