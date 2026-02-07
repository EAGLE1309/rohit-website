"use client";

import { useState, useEffect } from "react";

const isDev = process.env.NODE_ENV === "development";

interface VideoAsset {
  _id: string;
  url: string;
  originalFilename: string;
  size: number;
  mimeType: string;
}

interface ProgressState {
  downloadedMB: string;
  totalMB: string;
  progress: string;
  status: string;
}

interface WorkflowState {
  step: "idle" | "fetching" | "downloaded" | "compressed" | "uploaded" | "cleaned";
  selectedVideo: VideoAsset | null;
  inputPath: string | null;
  compressedPath: string | null;
  originalSize: number | null;
  compressedSize: number | null;
  compressionRatio: string | null;
  newAssetId: string | null;
  newAssetUrl: string | null;
  error: string | null;
  loading: boolean;
  downloadProgress: ProgressState | null;
  uploadProgress: ProgressState | null;
}

interface BulkItemState {
  video: VideoAsset;
  status: "pending" | "downloading" | "compressing" | "uploading" | "completed" | "error";
  error?: string;
  inputPath?: string;
  compressedPath?: string;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: string;
  progress?: ProgressState;
}

interface BulkState {
  active: boolean;
  items: BulkItemState[];
  currentIndex: number;
  isPaused: boolean;
  isRunning: boolean;
  completedCount: number;
  errorCount: number;
  cleanupOptions: {
    deleteOriginalFromSanity: boolean;
    deleteTempFiles: boolean;
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const SIZE_FILTER_OPTIONS = [
  { label: "All sizes", value: 0 },
  { label: "> 5 MB", value: 5 * 1024 * 1024 },
  { label: "> 10 MB", value: 10 * 1024 * 1024 },
  { label: "> 25 MB", value: 25 * 1024 * 1024 },
  { label: "> 50 MB", value: 50 * 1024 * 1024 },
  { label: "> 100 MB", value: 100 * 1024 * 1024 },
  { label: "> 250 MB", value: 250 * 1024 * 1024 },
  { label: "> 500 MB", value: 500 * 1024 * 1024 },
];

export default function AdminVideoCompression() {
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [minSizeFilter, setMinSizeFilter] = useState(0);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<BulkState>({
    active: false,
    items: [],
    currentIndex: -1,
    isPaused: false,
    isRunning: false,
    completedCount: 0,
    errorCount: 0,
    cleanupOptions: {
      deleteOriginalFromSanity: false,
      deleteTempFiles: true,
    },
  });
  const [workflow, setWorkflow] = useState<WorkflowState>({
    step: "idle",
    selectedVideo: null,
    inputPath: null,
    compressedPath: null,
    originalSize: null,
    compressedSize: null,
    compressionRatio: null,
    newAssetId: null,
    newAssetUrl: null,
    error: null,
    loading: false,
    downloadProgress: null,
    uploadProgress: null,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoadingVideos(true);
    try {
      const res = await fetch("/api/admin/videos");
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos);
      } else {
        console.error("Failed to fetch videos:", data.error);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  }

  function selectVideo(video: VideoAsset) {
    setWorkflow({
      step: "idle",
      selectedVideo: video,
      inputPath: null,
      compressedPath: null,
      originalSize: video.size,
      compressedSize: null,
      compressionRatio: null,
      newAssetId: null,
      newAssetUrl: null,
      error: null,
      loading: false,
      downloadProgress: null,
      uploadProgress: null,
    });
  }

  async function handleDownload() {
    if (!workflow.selectedVideo) return;

    setWorkflow((prev) => ({
      ...prev,
      loading: true,
      error: null,
      downloadProgress: { downloadedMB: "0.00", totalMB: "0.00", progress: "0", status: "Starting..." },
    }));

    try {
      const eventSource = new EventSource(
        `/api/admin/videos/download-stream?assetId=${encodeURIComponent(workflow.selectedVideo._id)}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "start":
            setWorkflow((prev) => ({
              ...prev,
              downloadProgress: {
                downloadedMB: "0.00",
                totalMB: data.totalSizeMB,
                progress: "0",
                status: `Downloading ${data.filename}...`,
              },
            }));
            break;

          case "progress":
            setWorkflow((prev) => ({
              ...prev,
              downloadProgress: {
                downloadedMB: data.downloadedMB,
                totalMB: data.totalMB,
                progress: data.progress,
                status: `Downloading: ${data.downloadedMB} MB / ${data.totalMB} MB`,
              },
            }));
            break;

          case "status":
            setWorkflow((prev) => ({
              ...prev,
              downloadProgress: prev.downloadProgress
                ? { ...prev.downloadProgress, status: data.message }
                : null,
            }));
            break;

          case "complete":
            eventSource.close();
            setWorkflow((prev) => ({
              ...prev,
              step: "downloaded",
              inputPath: data.inputPath,
              originalSize: data.originalSize,
              loading: false,
              downloadProgress: {
                downloadedMB: data.downloadedMB,
                totalMB: data.downloadedMB,
                progress: "100",
                status: "Download complete!",
              },
            }));
            break;

          case "error":
            eventSource.close();
            setWorkflow((prev) => ({
              ...prev,
              error: data.message,
              loading: false,
              downloadProgress: null,
            }));
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setWorkflow((prev) => ({
          ...prev,
          error: "Connection lost during download",
          loading: false,
          downloadProgress: null,
        }));
      };
    } catch (error: any) {
      setWorkflow((prev) => ({
        ...prev,
        error: error.message || "Download failed",
        loading: false,
        downloadProgress: null,
      }));
    }
  }

  async function handleCompress() {
    if (!workflow.inputPath) return;

    setWorkflow((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch("/api/admin/videos/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputPath: workflow.inputPath }),
      });

      const data = await res.json();

      if (data.success) {
        setWorkflow((prev) => ({
          ...prev,
          step: "compressed",
          compressedPath: data.outputPath,
          compressedSize: data.compressedSize,
          compressionRatio: data.compressionRatio,
          loading: false,
        }));
      } else {
        setWorkflow((prev) => ({
          ...prev,
          error: data.error || "Compression failed",
          loading: false,
        }));
      }
    } catch (error: any) {
      setWorkflow((prev) => ({
        ...prev,
        error: error.message || "Compression failed",
        loading: false,
      }));
    }
  }

  async function handleUpload() {
    if (!workflow.compressedPath || !workflow.selectedVideo) return;

    setWorkflow((prev) => ({
      ...prev,
      loading: true,
      error: null,
      uploadProgress: { downloadedMB: "0.00", totalMB: "0.00", progress: "0", status: "Starting..." },
    }));

    try {
      const params = new URLSearchParams({
        compressedPath: workflow.compressedPath,
        originalAssetId: workflow.selectedVideo._id,
        originalFilename: workflow.selectedVideo.originalFilename || "",
      });

      const eventSource = new EventSource(`/api/admin/videos/upload-stream?${params.toString()}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "start":
            setWorkflow((prev) => ({
              ...prev,
              uploadProgress: {
                downloadedMB: "0.00",
                totalMB: data.totalSizeMB,
                progress: "0",
                status: `Preparing ${data.filename}...`,
              },
            }));
            break;

          case "progress":
            setWorkflow((prev) => ({
              ...prev,
              uploadProgress: {
                downloadedMB: data.uploadedMB,
                totalMB: data.totalMB,
                progress: data.progress,
                status: `Uploading: ${data.uploadedMB} MB / ${data.totalMB} MB`,
              },
            }));
            break;

          case "status":
            setWorkflow((prev) => ({
              ...prev,
              uploadProgress: prev.uploadProgress
                ? { ...prev.uploadProgress, status: data.message }
                : null,
            }));
            break;

          case "complete":
            eventSource.close();
            setWorkflow((prev) => ({
              ...prev,
              step: "uploaded",
              newAssetId: data.newAssetId,
              newAssetUrl: data.newAssetUrl,
              loading: false,
              uploadProgress: {
                downloadedMB: data.uploadedMB,
                totalMB: data.uploadedMB,
                progress: "100",
                status: "Upload complete!",
              },
            }));
            break;

          case "error":
            eventSource.close();
            setWorkflow((prev) => ({
              ...prev,
              error: data.message,
              loading: false,
              uploadProgress: null,
            }));
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setWorkflow((prev) => ({
          ...prev,
          error: "Connection lost during upload",
          loading: false,
          uploadProgress: null,
        }));
      };
    } catch (error: any) {
      setWorkflow((prev) => ({
        ...prev,
        error: error.message || "Upload failed",
        loading: false,
        uploadProgress: null,
      }));
    }
  }

  async function handleCleanup(options: {
    deleteOriginalFromSanity: boolean;
    deleteTempFiles: boolean;
  }) {
    setWorkflow((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch("/api/admin/videos/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPath: workflow.inputPath,
          compressedPath: workflow.compressedPath,
          originalAssetId: workflow.selectedVideo?._id,
          deleteOriginalFromSanity: options.deleteOriginalFromSanity,
          deleteTempFiles: options.deleteTempFiles,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setWorkflow((prev) => ({
          ...prev,
          step: "cleaned",
          loading: false,
        }));
        fetchVideos();
      } else {
        setWorkflow((prev) => ({
          ...prev,
          error: data.errors?.join(", ") || "Cleanup failed",
          loading: false,
        }));
      }
    } catch (error: any) {
      setWorkflow((prev) => ({
        ...prev,
        error: error.message || "Cleanup failed",
        loading: false,
      }));
    }
  }

  const filteredVideos = videos.filter((video) => video.size >= minSizeFilter);

  function resetWorkflow() {
    setWorkflow({
      step: "idle",
      selectedVideo: null,
      inputPath: null,
      compressedPath: null,
      originalSize: null,
      compressedSize: null,
      compressionRatio: null,
      newAssetId: null,
      newAssetUrl: null,
      error: null,
      loading: false,
      downloadProgress: null,
      uploadProgress: null,
    });
  }

  function toggleVideoSelection(videoId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds(new Set(filteredVideos.map((v) => v._id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function startBulkProcess() {
    const selectedVideos = filteredVideos.filter((v) => selectedIds.has(v._id));
    if (selectedVideos.length === 0) return;

    setBulk({
      active: true,
      items: selectedVideos.map((video) => ({
        video,
        status: "pending",
        originalSize: video.size,
      })),
      currentIndex: -1,
      isPaused: true,
      isRunning: false,
      completedCount: 0,
      errorCount: 0,
      cleanupOptions: {
        deleteOriginalFromSanity: false,
        deleteTempFiles: true,
      },
    });
    setMode("bulk");
  }

  function cancelBulkProcess() {
    setBulk((prev) => ({ ...prev, active: false, isRunning: false, isPaused: true }));
    setMode("single");
    setSelectedIds(new Set());
  }

  async function processNextBulkItem() {
    const nextIndex = bulk.currentIndex + 1;
    if (nextIndex >= bulk.items.length) {
      setBulk((prev) => ({ ...prev, isRunning: false, isPaused: true }));
      return;
    }

    setBulk((prev) => ({ ...prev, currentIndex: nextIndex, isRunning: true, isPaused: false }));
    const item = bulk.items[nextIndex];

    try {
      setBulk((prev) => ({
        ...prev,
        items: prev.items.map((it, i) =>
          i === nextIndex ? { ...it, status: "downloading", progress: { downloadedMB: "0", totalMB: "0", progress: "0", status: "Starting download..." } } : it
        ),
      }));

      const downloadResult = await processBulkDownload(item.video, nextIndex);
      if (!downloadResult.success) throw new Error(downloadResult.error);

      setBulk((prev) => ({
        ...prev,
        items: prev.items.map((it, i) =>
          i === nextIndex ? { ...it, status: "compressing", inputPath: downloadResult.inputPath, progress: { downloadedMB: "0", totalMB: "0", progress: "0", status: "Compressing..." } } : it
        ),
      }));

      const compressResult = await processBulkCompress(downloadResult.inputPath!, nextIndex);
      if (!compressResult.success) throw new Error(compressResult.error);

      setBulk((prev) => ({
        ...prev,
        items: prev.items.map((it, i) =>
          i === nextIndex
            ? {
              ...it,
              status: "uploading",
              compressedPath: compressResult.outputPath,
              compressedSize: compressResult.compressedSize,
              compressionRatio: compressResult.compressionRatio,
              progress: { downloadedMB: "0", totalMB: "0", progress: "0", status: "Uploading..." },
            }
            : it
        ),
      }));

      const uploadResult = await processBulkUpload(
        compressResult.outputPath!,
        item.video._id,
        item.video.originalFilename,
        nextIndex
      );
      if (!uploadResult.success) throw new Error(uploadResult.error);

      await fetch("/api/admin/videos/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPath: downloadResult.inputPath,
          compressedPath: compressResult.outputPath,
          originalAssetId: item.video._id,
          deleteOriginalFromSanity: bulk.cleanupOptions.deleteOriginalFromSanity,
          deleteTempFiles: bulk.cleanupOptions.deleteTempFiles,
        }),
      });

      setBulk((prev) => ({
        ...prev,
        items: prev.items.map((it, i) => (i === nextIndex ? { ...it, status: "completed" } : it)),
        completedCount: prev.completedCount + 1,
      }));
    } catch (error: any) {
      setBulk((prev) => ({
        ...prev,
        items: prev.items.map((it, i) => (i === nextIndex ? { ...it, status: "error", error: error.message } : it)),
        errorCount: prev.errorCount + 1,
      }));
    }

    setBulk((prev) => ({ ...prev, isPaused: true, isRunning: false }));
  }

  async function processBulkDownload(video: VideoAsset, index: number): Promise<{ success: boolean; inputPath?: string; error?: string }> {
    return new Promise((resolve) => {
      const eventSource = new EventSource(`/api/admin/videos/download-stream?assetId=${encodeURIComponent(video._id)}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setBulk((prev) => ({
            ...prev,
            items: prev.items.map((it, i) =>
              i === index
                ? { ...it, progress: { downloadedMB: data.downloadedMB, totalMB: data.totalMB, progress: data.progress, status: `Downloading: ${data.downloadedMB}/${data.totalMB} MB` } }
                : it
            ),
          }));
        } else if (data.type === "complete") {
          eventSource.close();
          resolve({ success: true, inputPath: data.inputPath });
        } else if (data.type === "error") {
          eventSource.close();
          resolve({ success: false, error: data.message });
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        resolve({ success: false, error: "Connection lost" });
      };
    });
  }

  async function processBulkCompress(inputPath: string, _index: number): Promise<{ success: boolean; outputPath?: string; compressedSize?: number; compressionRatio?: string; error?: string }> {
    const res = await fetch("/api/admin/videos/compress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputPath }),
    });
    const data = await res.json();

    if (data.success) {
      return { success: true, outputPath: data.outputPath, compressedSize: data.compressedSize, compressionRatio: data.compressionRatio };
    }
    return { success: false, error: data.error || "Compression failed" };
  }

  async function processBulkUpload(
    compressedPath: string,
    originalAssetId: string,
    originalFilename: string,
    index: number
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const params = new URLSearchParams({ compressedPath, originalAssetId, originalFilename: originalFilename || "" });
      const eventSource = new EventSource(`/api/admin/videos/upload-stream?${params.toString()}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setBulk((prev) => ({
            ...prev,
            items: prev.items.map((it, i) =>
              i === index
                ? { ...it, progress: { downloadedMB: data.uploadedMB, totalMB: data.totalMB, progress: data.progress, status: `Uploading: ${data.uploadedMB}/${data.totalMB} MB` } }
                : it
            ),
          }));
        } else if (data.type === "complete") {
          eventSource.close();
          resolve({ success: true });
        } else if (data.type === "error") {
          eventSource.close();
          resolve({ success: false, error: data.message });
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        resolve({ success: false, error: "Connection lost" });
      };
    });
  }

  function runAllRemaining() {
    runBulkSequence();
  }

  async function runBulkSequence() {
    let idx = bulk.currentIndex + 1;
    while (idx < bulk.items.length) {
      setBulk((prev) => {
        if (prev.isPaused) return prev;
        return prev;
      });

      if (bulk.isPaused) break;

      await processNextBulkItem();
      idx = bulk.currentIndex + 1;

      const currentBulk = bulk;
      if (currentBulk.isPaused) break;
    }
  }

  if (!isDev) {
    return (
      <div className="min-h-screen mt-28 bg-neutral-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-neutral-400">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-28 bg-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Video Compression Admin</h1>
          <p className="text-neutral-400">
            Temporary tool for compressing Sanity videos. Each step requires manual confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video List */}
          <div className="bg-neutral-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Available Videos</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("single")}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${mode === "single" ? "bg-blue-600" : "bg-neutral-700 hover:bg-neutral-600"}`}
                >
                  Single
                </button>
                <button
                  onClick={() => setMode("bulk")}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${mode === "bulk" ? "bg-blue-600" : "bg-neutral-700 hover:bg-neutral-600"}`}
                >
                  Bulk
                </button>
              </div>
            </div>

            {/* Size Filter */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">Filter by minimum size:</label>
              <select
                value={minSizeFilter}
                onChange={(e) => setMinSizeFilter(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {SIZE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {minSizeFilter > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  Showing {filteredVideos.length} of {videos.length} videos
                </p>
              )}
            </div>

            {/* Bulk Selection Controls */}
            {mode === "bulk" && !bulk.active && (
              <div className="mb-4 flex gap-2 flex-wrap">
                <button
                  onClick={selectAllFiltered}
                  className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Select All ({filteredVideos.length})
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Clear
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={startBulkProcess}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                  >
                    Start Bulk ({selectedIds.size} selected)
                  </button>
                )}
              </div>
            )}

            {loadingVideos ? (
              <p className="text-neutral-400">Loading videos...</p>
            ) : filteredVideos.length === 0 ? (
              <p className="text-neutral-400">
                {videos.length === 0 ? "No videos found in Sanity" : "No videos match the size filter"}
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredVideos.map((video) => (
                  <div
                    key={video._id}
                    onClick={() => mode === "single" ? selectVideo(video) : toggleVideoSelection(video._id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer flex items-center gap-3 ${mode === "single"
                      ? workflow.selectedVideo?._id === video._id
                        ? "bg-blue-600"
                        : "bg-neutral-800 hover:bg-neutral-700"
                      : selectedIds.has(video._id)
                        ? "bg-blue-600"
                        : "bg-neutral-800 hover:bg-neutral-700"
                      }`}
                  >
                    {mode === "bulk" && (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedIds.has(video._id) ? "bg-white border-white" : "border-neutral-500"
                        }`}>
                        {selectedIds.has(video._id) && (
                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.originalFilename || video._id}</p>
                      <p className="text-sm text-neutral-400">
                        {formatBytes(video.size)} • {video.mimeType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={fetchVideos}
              className="mt-4 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
            >
              Refresh List
            </button>
          </div>

          {/* Workflow Panel */}
          <div className="bg-neutral-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {bulk.active ? "Bulk Processing" : "Compression Workflow"}
            </h2>

            {/* Bulk Processing UI */}
            {bulk.active ? (
              <div className="space-y-4">
                {/* Bulk Summary */}
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Progress</h3>
                    <span className="text-sm text-neutral-400">
                      {bulk.currentIndex + 1} / {bulk.items.length}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${((bulk.currentIndex + 1) / bulk.items.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">✓ {bulk.completedCount} completed</span>
                    {bulk.errorCount > 0 && <span className="text-red-400">✗ {bulk.errorCount} errors</span>}
                    <span className="text-neutral-400">{bulk.items.length - bulk.completedCount - bulk.errorCount} pending</span>
                  </div>
                </div>

                {/* Cleanup Options */}
                <div className="bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Cleanup Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bulk.cleanupOptions.deleteTempFiles}
                        onChange={(e) => setBulk((prev) => ({ ...prev, cleanupOptions: { ...prev.cleanupOptions, deleteTempFiles: e.target.checked } }))}
                        className="w-4 h-4 rounded"
                      />
                      Delete temp files after each video
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-red-400">
                      <input
                        type="checkbox"
                        checked={bulk.cleanupOptions.deleteOriginalFromSanity}
                        onChange={(e) => setBulk((prev) => ({ ...prev, cleanupOptions: { ...prev.cleanupOptions, deleteOriginalFromSanity: e.target.checked } }))}
                        className="w-4 h-4 rounded"
                      />
                      Delete original from Sanity (danger!)
                    </label>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {bulk.isPaused && bulk.currentIndex < bulk.items.length - 1 && (
                    <>
                      <button
                        onClick={processNextBulkItem}
                        disabled={bulk.isRunning}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-lg transition-colors"
                      >
                        Process Next
                      </button>
                      <button
                        onClick={runAllRemaining}
                        disabled={bulk.isRunning}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 rounded-lg transition-colors"
                      >
                        Run All Remaining
                      </button>
                    </>
                  )}
                  <button
                    onClick={cancelBulkProcess}
                    className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 rounded-lg transition-colors"
                  >
                    {bulk.currentIndex >= bulk.items.length - 1 ? "Done" : "Cancel"}
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {bulk.items.map((item, idx) => (
                    <div
                      key={item.video._id}
                      className={`p-3 rounded-lg ${idx === bulk.currentIndex
                        ? "bg-blue-900/30 border border-blue-500"
                        : item.status === "completed"
                          ? "bg-green-900/20"
                          : item.status === "error"
                            ? "bg-red-900/20"
                            : "bg-neutral-800"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate flex-1">{item.video.originalFilename}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${item.status === "completed" ? "bg-green-600" :
                          item.status === "error" ? "bg-red-600" :
                            item.status === "pending" ? "bg-neutral-600" :
                              "bg-blue-600"
                          }`}>
                          {item.status}
                        </span>
                      </div>
                      {item.progress && idx === bulk.currentIndex && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-neutral-400 mb-1">
                            <span>{item.progress.status}</span>
                            <span>{item.progress.progress}%</span>
                          </div>
                          <div className="w-full bg-neutral-700 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${item.progress.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {item.status === "completed" && item.compressionRatio && (
                        <p className="text-xs text-green-400 mt-1">
                          {formatBytes(item.originalSize)} → {formatBytes(item.compressedSize || 0)} ({item.compressionRatio})
                        </p>
                      )}
                      {item.status === "error" && item.error && (
                        <p className="text-xs text-red-400 mt-1">{item.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : !workflow.selectedVideo ? (
              <p className="text-neutral-400">{mode === "bulk" ? "Select videos and click 'Start Bulk'" : "Select a video to begin"}</p>
            ) : (
              <div className="space-y-6">
                {/* Selected Video Info */}
                <div className="bg-neutral-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Selected Video</h3>
                  <p className="text-sm text-neutral-300">{workflow.selectedVideo.originalFilename}</p>
                  <p className="text-sm text-neutral-400">Size: {formatBytes(workflow.selectedVideo.size)}</p>
                  <p className="text-sm text-neutral-400 truncate">ID: {workflow.selectedVideo._id}</p>
                </div>

                {/* Error Display */}
                {workflow.error && (
                  <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                    <p className="text-red-300">{workflow.error}</p>
                  </div>
                )}

                {/* Step 1: Download */}
                <div className={`p-4 rounded-lg ${workflow.step === "idle" ? "bg-blue-900/30 border border-blue-500" : "bg-neutral-800"}`}>
                  <h3 className="font-medium mb-2">Step 1: Download Video</h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    Download the video from Sanity to local temp folder for processing.
                  </p>
                  {workflow.step === "idle" && !workflow.loading && (
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      Confirm Download
                    </button>
                  )}
                  {workflow.step === "idle" && workflow.loading && workflow.downloadProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-300">{workflow.downloadProgress.status}</span>
                        <span className="text-blue-400 font-mono">{workflow.downloadProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-150"
                          style={{ width: `${workflow.downloadProgress.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-neutral-400 font-mono">
                        <span>{workflow.downloadProgress.downloadedMB} MB</span>
                        <span>{workflow.downloadProgress.totalMB} MB</span>
                      </div>
                    </div>
                  )}
                  {workflow.step !== "idle" && workflow.inputPath && (
                    <p className="text-sm text-green-400">✓ Downloaded to: {workflow.inputPath}</p>
                  )}
                </div>

                {/* Step 2: Compress */}
                <div className={`p-4 rounded-lg ${workflow.step === "downloaded" ? "bg-blue-900/30 border border-blue-500" : "bg-neutral-800"}`}>
                  <h3 className="font-medium mb-2">Step 2: Compress Video</h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    Run FFmpeg compression with H.264, CRF 18, AAC audio.
                  </p>
                  {workflow.step === "downloaded" && (
                    <button
                      onClick={handleCompress}
                      disabled={workflow.loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {workflow.loading ? "Compressing..." : "Confirm Compress"}
                    </button>
                  )}
                  {workflow.compressedPath && (
                    <div className="text-sm">
                      <p className="text-green-400">✓ Compressed successfully</p>
                      <p className="text-neutral-300">
                        Original: {formatBytes(workflow.originalSize || 0)} → Compressed: {formatBytes(workflow.compressedSize || 0)}
                      </p>
                      <p className="text-neutral-300">Reduction: {workflow.compressionRatio}</p>
                    </div>
                  )}
                </div>

                {/* Step 3: Upload */}
                <div className={`p-4 rounded-lg ${workflow.step === "compressed" ? "bg-blue-900/30 border border-blue-500" : "bg-neutral-800"}`}>
                  <h3 className="font-medium mb-2">Step 3: Upload & Replace</h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    Upload compressed video to Sanity and update document references.
                  </p>
                  {workflow.step === "compressed" && !workflow.loading && (
                    <button
                      onClick={handleUpload}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      Confirm Upload & Replace
                    </button>
                  )}
                  {workflow.step === "compressed" && workflow.loading && workflow.uploadProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-300">{workflow.uploadProgress.status}</span>
                        <span className="text-blue-400 font-mono">{workflow.uploadProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-150"
                          style={{ width: `${workflow.uploadProgress.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-neutral-400 font-mono">
                        <span>{workflow.uploadProgress.downloadedMB} MB</span>
                        <span>{workflow.uploadProgress.totalMB} MB</span>
                      </div>
                    </div>
                  )}
                  {workflow.newAssetId && (
                    <div className="text-sm">
                      <p className="text-green-400">✓ Uploaded and references updated</p>
                      <p className="text-neutral-300 truncate">New Asset ID: {workflow.newAssetId}</p>
                    </div>
                  )}
                </div>

                {/* Step 4: Cleanup */}
                <div className={`p-4 rounded-lg ${workflow.step === "uploaded" ? "bg-blue-900/30 border border-blue-500" : "bg-neutral-800"}`}>
                  <h3 className="font-medium mb-2">Step 4: Cleanup</h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    Choose what to clean up. Temp files are in <code className="text-xs bg-neutral-700 px-1 rounded">temp-videos/</code> folder.
                  </p>
                  {workflow.step === "uploaded" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCleanup({ deleteOriginalFromSanity: false, deleteTempFiles: true })}
                          disabled={workflow.loading}
                          className="px-3 py-2 bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                        >
                          {workflow.loading ? "..." : "Delete Temp Only"}
                        </button>
                        <button
                          onClick={() => handleCleanup({ deleteOriginalFromSanity: false, deleteTempFiles: false })}
                          disabled={workflow.loading}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                        >
                          {workflow.loading ? "..." : "Keep Temp Files"}
                        </button>
                      </div>
                      <div className="border-t border-neutral-700 pt-3">
                        <p className="text-xs text-red-400 mb-2">⚠️ Danger zone - deletes original from Sanity:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleCleanup({ deleteOriginalFromSanity: true, deleteTempFiles: true })}
                            disabled={workflow.loading}
                            className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                          >
                            {workflow.loading ? "..." : "Delete All"}
                          </button>
                          <button
                            onClick={() => handleCleanup({ deleteOriginalFromSanity: true, deleteTempFiles: false })}
                            disabled={workflow.loading}
                            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                          >
                            {workflow.loading ? "..." : "Delete Original, Keep Temp"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {workflow.step === "cleaned" && (
                    <p className="text-sm text-green-400">✓ Cleanup complete</p>
                  )}
                </div>

                {/* Completion */}
                {workflow.step === "cleaned" && (
                  <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                    <h3 className="font-medium text-green-400 mb-2">✓ Workflow Complete</h3>
                    <p className="text-sm text-neutral-300">
                      Video has been compressed and replaced successfully.
                    </p>
                    <button
                      onClick={resetWorkflow}
                      className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                    >
                      Process Another Video
                    </button>
                  </div>
                )}

                {/* Cancel Button */}
                {workflow.step !== "cleaned" && (
                  <button
                    onClick={resetWorkflow}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                  >
                    Cancel / Reset
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-8 bg-yellow-900/30 border border-yellow-500 rounded-lg p-4">
          <h3 className="font-medium text-yellow-400 mb-2">⚠️ Important Notes</h3>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• This is a temporary admin tool - remove after use</li>
            <li>• Ensure FFmpeg is installed on the server</li>
            <li>• Large videos may take several minutes to compress</li>
            <li>• Always verify the compressed video before deleting the original</li>
            <li>• Requires SANITY_API_TOKEN environment variable with write access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
