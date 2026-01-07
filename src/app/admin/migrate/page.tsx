"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

interface MigrationItem {
  _id: string;
  name?: string;
  title?: string;
  videoUrl?: string;
  trackUrl?: string;
  videoSize?: number;
  trackSize?: number;
  videoMimeType?: string;
  trackMimeType?: string;
}

interface MigrationStats {
  projects: {
    total: number;
    toMigrate: number;
    migrated: number;
    items: MigrationItem[];
    totalSize: number;
  };
  musics: {
    total: number;
    toMigrate: number;
    migrated: number;
    items: MigrationItem[];
    totalSize: number;
  };
  summary: {
    totalItems: number;
    totalSize: number;
    totalSizeFormatted: string;
  };
}

type MigrationStep =
  | "pending"
  | "downloading"
  | "uploading"
  | "updating_sanity"
  | "complete"
  | "error";

interface MigrationResult {
  _id: string;
  status: "pending" | "migrating" | "success" | "error" | "updating" | "complete";
  step?: MigrationStep;
  stepDetail?: string;
  error?: string;
  r2Url?: string;
  sanityUpdated?: boolean;
  bytesDownloaded?: number;
  bytesUploaded?: number;
  totalBytes?: number;
  startTime?: number;
  endTime?: number;
}

interface OverallProgress {
  currentIndex: number;
  totalItems: number;
  totalBytesDownloaded: number;
  totalBytesUploaded: number;
  totalBytesToUpload: number;
  currentItemName: string;
  currentItemType: "video" | "audio";
  startTime: number;
  completedItems: number;
}

export default function MigratePage() {
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationResults, setMigrationResults] = useState<Map<string, MigrationResult>>(new Map());
  const [isMigrating, setIsMigrating] = useState(false);
  const [currentMigration, setCurrentMigration] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState<OverallProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/r2/migrate/list");
      if (!response.ok) {
        throw new Error("Failed to fetch migration stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateItemProgress = useCallback((
    id: string,
    updates: Partial<MigrationResult>
  ) => {
    setMigrationResults((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(id) || { _id: id, status: "pending" as const };
      newMap.set(id, { ...existing, ...updates });
      return newMap;
    });
  }, []);

  const migrateItem = async (
    item: MigrationItem,
    type: "video" | "audio"
  ): Promise<MigrationResult> => {
    const sourceUrl = type === "video" ? item.videoUrl : item.trackUrl;
    const fileSize = type === "video" ? item.videoSize : item.trackSize;
    const name = item.name || item.title || item._id;
    const startTime = Date.now();

    if (!sourceUrl) {
      return { _id: item._id, status: "error", error: "No source URL" };
    }

    try {
      // Step 1: Downloading from Sanity CDN
      updateItemProgress(item._id, {
        status: "migrating",
        step: "downloading",
        stepDetail: `Downloading from Sanity CDN...`,
        totalBytes: fileSize || 0,
        bytesDownloaded: 0,
        bytesUploaded: 0,
        startTime,
      });

      const response = await fetch("/api/r2/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl,
          type,
          filename: name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          _id: item._id,
          status: "error",
          step: "error",
          error: errorData.error || `HTTP ${response.status}`,
          endTime: Date.now(),
        };
      }

      const data = await response.json();

      // Step 2: Upload complete, update progress
      updateItemProgress(item._id, {
        step: "uploading",
        stepDetail: `Downloaded ${formatBytes(data.downloadedBytes || 0)} • Uploaded ${formatBytes(data.uploadBytes || data.size || fileSize || 0)} to R2`,
        bytesDownloaded: data.downloadedBytes || 0,
        bytesUploaded: data.uploadBytes || data.size || fileSize || 0,
      });

      // Step 3: Updating Sanity document
      updateItemProgress(item._id, {
        status: "updating",
        step: "updating_sanity",
        stepDetail: "Updating Sanity document...",
      });

      try {
        const updateResponse = await fetch("/api/r2/migrate/update-sanity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: item._id,
            documentType: type === "video" ? "projects" : "musics",
            r2Url: data.r2Url,
            filename: data.filename || name,
            size: data.size,
            mimeType: data.contentType,
          }),
        });

        if (updateResponse.ok) {
          return {
            _id: item._id,
            status: "complete",
            step: "complete",
            stepDetail: "Migration complete!",
            r2Url: data.r2Url,
            sanityUpdated: true,
            bytesDownloaded: data.downloadedBytes || 0,
            bytesUploaded: data.uploadBytes || data.size || fileSize || 0,
            totalBytes: data.uploadBytes || data.size || fileSize || 0,
            endTime: Date.now(),
            startTime,
          };
        }
      } catch {
        // Sanity update failed but R2 upload succeeded
      }

      return {
        _id: item._id,
        status: "success",
        step: "complete",
        stepDetail: "Uploaded to R2 (Sanity update failed)",
        r2Url: data.r2Url,
        sanityUpdated: false,
        bytesDownloaded: data.downloadedBytes || 0,
        bytesUploaded: data.uploadBytes || data.size || fileSize || 0,
        totalBytes: data.uploadBytes || data.size || fileSize || 0,
        endTime: Date.now(),
        startTime,
      };
    } catch (err) {
      return {
        _id: item._id,
        status: "error",
        step: "error",
        stepDetail: err instanceof Error ? err.message : "Unknown error",
        error: err instanceof Error ? err.message : "Unknown error",
        endTime: Date.now(),
        startTime,
      };
    }
  };

  const migrateAll = async () => {
    if (!stats || isMigrating) return;

    setIsMigrating(true);
    abortControllerRef.current = new AbortController();
    const results = new Map<string, MigrationResult>();

    const allItems = [
      ...stats.projects.items.map((p) => ({ ...p, type: "video" as const })),
      ...stats.musics.items.map((m) => ({ ...m, type: "audio" as const })),
    ];
    const totalSize = stats.summary.totalSize;
    const startTime = Date.now();

    // Initialize all items as pending
    allItems.forEach((item) => {
      results.set(item._id, { _id: item._id, status: "pending" });
    });
    setMigrationResults(new Map(results));

    // Initialize overall progress
    setOverallProgress({
      currentIndex: 0,
      totalItems: allItems.length,
      totalBytesDownloaded: 0,
      totalBytesUploaded: 0,
      totalBytesToUpload: totalSize,
      currentItemName: "",
      currentItemType: "video",
      startTime,
      completedItems: 0,
    });

    let completedItems = 0;
    let totalBytesDownloaded = 0;
    let totalBytesUploaded = 0;

    // Migrate all items
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const itemName = item.name || item.title || item._id;
      const itemSize = item.type === "video" ? item.videoSize : item.trackSize;

      setCurrentMigration(itemName);
      setOverallProgress((prev) =>
        prev
          ? {
            ...prev,
            currentIndex: i + 1,
            currentItemName: itemName,
            currentItemType: item.type,
          }
          : null
      );

      const result = await migrateItem(item, item.type);
      results.set(item._id, result);
      setMigrationResults(new Map(results));

      if (result.status === "complete" || result.status === "success") {
        completedItems++;
        totalBytesDownloaded += result.bytesDownloaded || 0;
        totalBytesUploaded += result.bytesUploaded || itemSize || 0;
        setOverallProgress((prev) =>
          prev
            ? {
              ...prev,
              completedItems,
              totalBytesDownloaded,
              totalBytesUploaded,
            }
            : null
        );
      }
    }

    setCurrentMigration(null);
    setIsMigrating(false);
  };

  const migrateSingle = async (item: MigrationItem, type: "video" | "audio") => {
    if (isMigrating) return;

    setIsMigrating(true);
    setCurrentMigration(item.name || item.title || item._id);

    const results = new Map(migrationResults);
    results.set(item._id, { _id: item._id, status: "migrating" });
    setMigrationResults(results);

    const result = await migrateItem(item, type);
    results.set(item._id, result);
    setMigrationResults(new Map(results));

    setCurrentMigration(null);
    setIsMigrating(false);
  };

  const getStepLabel = (step?: MigrationStep): string => {
    const labels: Record<MigrationStep, string> = {
      pending: "Waiting...",
      downloading: "📥 Downloading from Sanity",
      uploading: "📤 Uploading to R2",
      updating_sanity: "📝 Updating Sanity",
      complete: "✅ Complete",
      error: "❌ Error",
    };
    return step ? labels[step] : "";
  };

  const getStatusBadge = (id: string) => {
    const result = migrationResults.get(id);
    if (!result) return null;

    const statusStyles: Record<string, string> = {
      pending: "bg-gray-200 text-gray-700",
      migrating: "bg-blue-200 text-blue-700 animate-pulse",
      updating: "bg-yellow-200 text-yellow-700 animate-pulse",
      success: "bg-green-200 text-green-700",
      complete: "bg-emerald-200 text-emerald-700",
      error: "bg-red-200 text-red-700",
    };

    return (
      <div className="flex flex-col gap-1">
        <span className={`px-2 py-1 text-xs rounded inline-block w-fit ${statusStyles[result.status]}`}>
          {result.step ? getStepLabel(result.step) : result.status}
        </span>
        {result.stepDetail && result.status === "migrating" && (
          <span className="text-xs text-foreground/50">{result.stepDetail}</span>
        )}
        {result.bytesDownloaded !== undefined && result.bytesDownloaded > 0 && result.status !== "pending" && (
          <span className="text-xs text-foreground/50">
            📥 {formatBytes(result.bytesDownloaded)} downloaded
          </span>
        )}
        {result.bytesUploaded !== undefined && result.bytesUploaded > 0 && result.status !== "pending" && (
          <span className="text-xs text-foreground/50">
            📤 {formatBytes(result.bytesUploaded)} uploaded
          </span>
        )}
        {result.error && (
          <span className="text-xs text-red-600">{result.error}</span>
        )}
      </div>
    );
  };

  const successCount = Array.from(migrationResults.values()).filter(
    (r) => r.status === "success" || r.status === "complete"
  ).length;
  const errorCount = Array.from(migrationResults.values()).filter(
    (r) => r.status === "error"
  ).length;

  return (
    <MaxWidthWrapper className="py-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">R2 Migration Dashboard</h1>
        <p className="text-foreground/60 mb-8">
          Migrate media assets from Sanity CDN to Cloudflare R2
        </p>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full mx-auto mb-4" />
            <p>Loading migration stats...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
            <button
              onClick={fetchStats}
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {stats && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border border-foreground/20 p-4 rounded">
                <h3 className="text-sm text-foreground/60 uppercase">Videos</h3>
                <p className="text-2xl font-bold">
                  {stats.projects.toMigrate} / {stats.projects.total}
                </p>
                <p className="text-sm text-foreground/60">
                  {formatBytes(stats.projects.totalSize)} to migrate
                </p>
              </div>
              <div className="border border-foreground/20 p-4 rounded">
                <h3 className="text-sm text-foreground/60 uppercase">Audio</h3>
                <p className="text-2xl font-bold">
                  {stats.musics.toMigrate} / {stats.musics.total}
                </p>
                <p className="text-sm text-foreground/60">
                  {formatBytes(stats.musics.totalSize)} to migrate
                </p>
              </div>
              <div className="border border-foreground/20 p-4 rounded">
                <h3 className="text-sm text-foreground/60 uppercase">Total</h3>
                <p className="text-2xl font-bold">{stats.summary.totalItems}</p>
                <p className="text-sm text-foreground/60">
                  {stats.summary.totalSizeFormatted}
                </p>
              </div>
            </div>

            {/* Migration Progress */}
            {(migrationResults.size > 0 || overallProgress) && (
              <div className="mb-8 p-4 border border-foreground/20 rounded">
                <h3 className="font-medium mb-3">Migration Progress</h3>

                {/* Overall Progress Bar */}
                {overallProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        Item {overallProgress.currentIndex} of {overallProgress.totalItems}
                      </span>
                      <span className="text-right">
                        <div>📥 {formatBytes(overallProgress.totalBytesDownloaded)} downloaded</div>
                        <div>📤 {formatBytes(overallProgress.totalBytesUploaded)} / {formatBytes(overallProgress.totalBytesToUpload)} uploaded</div>
                      </span>
                    </div>
                    <div className="w-full h-3 bg-foreground/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                        style={{
                          width: `${overallProgress.totalBytesToUpload > 0
                            ? (overallProgress.totalBytesUploaded / overallProgress.totalBytesToUpload) * 100
                            : 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-foreground/50 mt-1">
                      <span>
                        {Math.round(
                          overallProgress.totalBytesToUpload > 0
                            ? (overallProgress.totalBytesUploaded / overallProgress.totalBytesToUpload) * 100
                            : 0
                        )}% complete
                      </span>
                      <span>
                        Elapsed: {formatDuration(Date.now() - overallProgress.startTime)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Current Item Details */}
                {currentMigration && overallProgress && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="font-medium text-sm">Currently Processing</span>
                    </div>
                    <p className="text-sm">
                      <span className="text-foreground/70">
                        {overallProgress.currentItemType === "video" ? "🎬 Video" : "🎵 Audio"}:
                      </span>{" "}
                      <span className="font-medium">{currentMigration}</span>
                    </p>
                    {(() => {
                      const currentResult = migrationResults.get(
                        [...migrationResults.entries()].find(
                          ([, r]) => r.status === "migrating" || r.status === "updating"
                        )?.[0] || ""
                      );
                      if (currentResult?.stepDetail) {
                        return (
                          <p className="text-xs text-foreground/60 mt-1">
                            {currentResult.stepDetail}
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {/* Stats Summary */}
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">✅ Success: {successCount}</span>
                  <span className="text-red-600">❌ Errors: {errorCount}</span>
                  <span className="text-gray-600">
                    📊 Total: {migrationResults.size}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={migrateAll}
                disabled={isMigrating || stats.summary.totalItems === 0}
                className="px-4 py-2 bg-foreground text-background rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMigrating ? "Migrating..." : "Migrate All"}
              </button>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-4 py-2 border border-foreground/20 rounded hover:bg-foreground/5"
              >
                Refresh
              </button>
            </div>

            {/* Projects List */}
            {stats.projects.items.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Videos ({stats.projects.items.length})
                </h2>
                <div className="border border-foreground/20 rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-foreground/5">
                      <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Size</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-right p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.projects.items.map((project) => (
                        <tr key={project._id} className="border-t border-foreground/10">
                          <td className="p-3">{project.name || project._id}</td>
                          <td className="p-3">{formatBytes(project.videoSize || 0)}</td>
                          <td className="p-3">{getStatusBadge(project._id)}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => migrateSingle(project, "video")}
                              disabled={isMigrating}
                              className="text-blue-600 hover:underline disabled:opacity-50"
                            >
                              Migrate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Music List */}
            {stats.musics.items.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Audio ({stats.musics.items.length})
                </h2>
                <div className="border border-foreground/20 rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-foreground/5">
                      <tr>
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Size</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-right p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.musics.items.map((music) => (
                        <tr key={music._id} className="border-t border-foreground/10">
                          <td className="p-3">{music.title || music._id}</td>
                          <td className="p-3">{formatBytes(music.trackSize || 0)}</td>
                          <td className="p-3">{getStatusBadge(music._id)}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => migrateSingle(music, "audio")}
                              disabled={isMigrating}
                              className="text-blue-600 hover:underline disabled:opacity-50"
                            >
                              Migrate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {stats.summary.totalItems === 0 && (
              <div className="text-center py-12 text-foreground/60">
                <p className="text-lg">All assets have been migrated!</p>
                <p className="text-sm mt-2">
                  {stats.projects.migrated} videos and {stats.musics.migrated} audio
                  files are already on R2.
                </p>
              </div>
            )}
          </>
        )}

        {/* Instructions */}
        <div className="mt-12 p-4 bg-foreground/5 rounded">
          <h3 className="font-medium mb-2">Important Notes</h3>
          <ul className="text-sm text-foreground/70 space-y-1 list-disc list-inside">
            <li>
              Migration copies files from Sanity CDN to Cloudflare R2
            </li>
            <li>
              After migration, update Sanity documents with the new R2 URLs
            </li>
            <li>
              Large files may take longer to migrate
            </li>
            <li>
              You can migrate individual items or all at once
            </li>
          </ul>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
