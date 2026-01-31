"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";
import type { ProjectMain, CaseStudyBlock, VideoBlock } from "@/lib/dashboard/queries/projects-main";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectsCard from "./card";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { VideoPlayer } from "@/app/work/[work]/video-player";

// Embed type detector
const getEmbedType = (url: string) => {
  if (!url) return null;

  if (/instagram\.com/.test(url)) return "instagram";
  if (/spotify\.com/.test(url)) return "spotify";
  if (/soundcloud\.com/.test(url)) return "soundcloud";
  if (/facebook\.com/.test(url)) return "facebook";
  if (/twitter\.com|x\.com/.test(url)) return "twitter";
  if (/untitled\.stream|untitled\.app/.test(url)) return "untitled";

  return null;
};

// Embed renderer component
const Embed = ({ url }: { url: string }) => {
  const type = getEmbedType(url);

  if (!type) return null;

  if (type === "instagram") {
    // Match only post/reel/tv embeds
    const match = url.match(/instagram\.com\/(p|reel|tv)\/([^/?#&]+)/);
    const postId = match?.[2];

    // If it's a profile or unsupported IG URL → fallback UI
    if (!postId) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block w-full max-w-md my-6 p-3 md:p-4 rounded-2xl border-2 border-foreground/15 bg-background hover:border-pink-500/45 transition-all duration-300 ease-out dark:bg-neutral-900 dark:border-neutral-800"
        >
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
              {/* Instagram Gradient Ring */}
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2cc6ff] flex-shrink-0">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center">
                  {/* Simple SVG Instagram Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 md:w-5 md:h-5 text-foreground"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm md:text-lg text-foreground group-hover:text-pink-600 transition-colors truncate">
                  {url.replace("https://www.instagram.com/", "@").replace("https://instagram.com/", "@")}
                </p>
                <p className="text-[10px] md:text-xs font-medium text-foreground/55 uppercase tracking-wider">
                  Instagram Profile
                </p>
              </div>
            </div>

            {/* External Link Arrow */}
            <div className="text-foreground group-hover:text-pink-500 transition-colors flex-shrink-0">
              <svg width="18" height="18" className="md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </div>
          </div>
        </a>
      );
    }

    // Valid post/reel embed
    return (
      <iframe
        src={`https://www.instagram.com/p/${postId}/embed`}
        className="w-full max-w-xl mx-auto my-4 md:my-6 rounded-xl border border-foreground/10"
        height={520}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
        loading="lazy"
        allowFullScreen
      />
    );
  }


  if (type === "spotify") {
    const embedUrl = url.replace("open.spotify.com", "open.spotify.com/embed");
    return (
      <iframe
        src={embedUrl}
        className="w-full h-[152px] my-4 md:my-6 rounded-lg"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    );
  }

  if (type === "soundcloud") {
    return (
      <iframe
        className="w-full h-[166px] my-4 md:my-6 rounded-lg"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`}
        allow="autoplay"
        loading="lazy"
      />
    );
  }

  if (type === "facebook") {
    return (
      <iframe
        className="w-full max-w-xl mx-auto my-4 md:my-6 rounded-lg"
        src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}`}
        height={500}
        loading="lazy"
      />
    );
  }

  if (type === "twitter") {
    return (
      <blockquote className="my-4 md:my-6 p-4 border-l-4 border-foreground/30">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-foreground/55 font-medium transition-colors text-sm md:text-base">
          View post on Twitter/X
        </a>
      </blockquote>
    );
  }

  if (type === "untitled") {
    return (
      <iframe
        src={url.replace("untitled.stream", "embed.untitled.stream")}
        className="w-full h-[160px] my-4 md:my-6 rounded-lg"
        allow="autoplay"
        loading="lazy"
      />
    );
  }

  return null;
};

// Add these variant definitions outside or inside your component
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // This creates the cascade effect
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }, // Fast exit for the old list
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
};

const ProjectsComponent = ({ data }: { data: ProjectMain[] }) => {
  const [selectedProject, setSelectedProject] = useState<ProjectMain | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = Array.from(new Set(data.map(project => project.category).filter(Boolean)));
  const allFilters = ["all", ...categories];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setTimeout(() => {
      const buttonElement = document.getElementById(`filter-button-${filter}`);
      if (buttonElement) {
        buttonElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 0);
  };

  const handleProjectSelect = (projectId: string) => {
    if (!projectId) { setSelectedProject(null); return; }
    const project = data.find(p => p._id === projectId);
    if (project) {
      setSelectedProject(project);
      setTimeout(() => {
        const el = document.getElementById(`mobile-thumb-${projectId}`);
        if (el && scrollContainerRef.current) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 100);
    } else setSelectedProject(null);
  };
  // Filter and sort logic
  const filteredProjects = data
    .filter((project) => project.name)
    .filter((project) => activeFilter === "all" ? true : project.category === activeFilter)
    .sort((a, b) => {
      // If both have index, sort by index (higher index first)
      if (a.index !== undefined && b.index !== undefined) {
        return b.index - a.index;
      }
      // If only one has index, prioritize the one with index
      if (a.index !== undefined) return -1;
      if (b.index !== undefined) return 1;
      // If neither has index, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

  // Auto-select first project on mobile
  useEffect(() => {
    if (!selectedProject && filteredProjects.length > 0) setSelectedProject(filteredProjects[0]);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full relative h-full flex flex-col md:grid md:grid-cols-7 overflow-hidden">

      {/* --- LEFT PANEL (DETAILS) --- */}
      <div className="w-full flex-1 md:h-full col-span-5 overflow-hidden relative order-1 md:order-none">
        <div className="w-full h-full overflow-y-auto scrollbar-hide p-3">
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.div
                key={selectedProject._id} // Triggers animation on ID change
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full p-3"
              >
                <div className="w-full flex flex-col gap-8">

                  {/* Project Header */}
                  <div className="w-full flex gap-3">
                    <p className="text-3xl md:text-4xl font-medium">
                      {(() => {
                        const name = selectedProject?.name || "";
                        const num = name ? String(name.split("").reduce((acc: any, c: any) => acc + c.charCodeAt(0), 0) % 100).padStart(2, "0") : "--";
                        return <span className="text-3xl md:text-4xl font-medium">{num}.</span>;
                      })()}
                    </p>
                    <div className="w-full">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-medium"
                      >
                        {selectedProject?.name}
                      </motion.div>
                    </div>
                  </div>

                  {/* About section */}
                  {selectedProject?.description && (
                    <div className="w-full flex flex-col gap-3">
                      <div className="w-full">
                        <p className="text-sm md:text-lg font-mono text-foreground/55">About</p>
                      </div>
                      <div className="w-full">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm md:text-base leading-relaxed"
                        >
                          {selectedProject.description}
                        </motion.p>
                      </div>
                    </div>
                  )}

                  {/* Project Details Section */}
                  <div className="w-full flex flex-col gap-3">
                    <div className="w-full">
                      <p className="text-sm font-mono text-foreground/55 md:text-base">Project Details</p>
                    </div>
                    <div className="w-full flex flex-col gap-2 text-sm md:text-base">
                      <p><span className="font-mono text-foreground/55">Category : </span> {selectedProject?.category.charAt(0).toUpperCase() + selectedProject?.category.slice(1) || "None"}</p>
                      <span className="w-1/5 border-t-2 border-foreground/35" />
                      {selectedProject?.service && (
                        <>
                          <p><span className="font-mono text-foreground/55">Service : </span> {selectedProject.service}</p>
                          <span className="w-1/5 border-t-2 border-foreground/35" />
                        </>
                      )}
                      {selectedProject?.client && (
                        <>
                          <p><span className="font-mono text-foreground/55">Client : </span> {selectedProject.client}</p>
                          <span className="w-1/5 border-t-2 border-foreground/35" />
                        </>
                      )}
                      <p><span className="font-mono text-foreground/55">Created : </span> {new Date(selectedProject?.date || selectedProject?._createdAt || "").toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {selectedProject?.thumbnail && !selectedProject?.hideThumbnail && (
                    <motion.div
                      className="w-full overflow-hidden"
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        src={thumbnailUrl(selectedProject.thumbnail, "lg")}
                        alt={selectedProject.name}
                        className="w-full aspect-video object-cover"
                      />
                    </motion.div>
                  )}

                  {/* Case Study Content */}
                  {selectedProject?.caseStudyContent && selectedProject.caseStudyContent.length > 0 && (
                    <div className="w-full space-y-8">
                      {selectedProject.caseStudyContent.map((block: CaseStudyBlock) => {
                        if (block._type === "textBlock") {
                          return (
                            <motion.div
                              key={block._key}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="w-full flex flex-col gap-4"
                            >
                              <div className="w-full prose prose-sm md:prose-base max-w-none">
                                {block.content && (() => {
                                  const elements: React.ReactElement[] = [];
                                  let currentList: { type: string; items: React.ReactElement[] } | null = null;

                                  block.content.forEach((contentBlock: any, idx: number) => {
                                    if (contentBlock._type === "code") {
                                      elements.push(
                                        <pre key={contentBlock._key || idx} className="bg-foreground/5 p-4 rounded overflow-x-auto my-4">
                                          <code className="font-mono text-sm text-foreground">{contentBlock.code}</code>
                                        </pre>
                                      );
                                      return;
                                    }

                                    if (contentBlock._type === "block") {
                                      const style = contentBlock.style || "normal";
                                      const listItem = contentBlock.listItem;
                                      const children = contentBlock.children || [];
                                      const markDefs = contentBlock.markDefs || [];

                                      const text = children.map((child: any, childIdx: number) => {
                                        const content = child.text || "";
                                        const marks = child.marks || [];

                                        let element: React.ReactNode = content;

                                        if (marks.includes("code")) {
                                          element = (
                                            <code key={child._key || childIdx} className="px-1.5 py-0.5 bg-foreground/10 text-foreground font-mono text-sm rounded">
                                              {content}
                                            </code>
                                          );
                                        } else {
                                          if (marks.includes("strong")) {
                                            element = <strong key={child._key || childIdx} className="font-semibold text-foreground">{element}</strong>;
                                          }
                                          if (marks.includes("em")) {
                                            element = <em key={child._key || childIdx} className="italic">{element}</em>;
                                          }
                                          if (marks.includes("underline")) {
                                            element = <span key={child._key || childIdx} className="underline">{element}</span>;
                                          }
                                          if (marks.includes("strike-through")) {
                                            element = <span key={child._key || childIdx} className="line-through">{element}</span>;
                                          }
                                        }

                                        const linkKey = marks.find((m: string) => markDefs.some((def: any) => def._key === m));
                                        if (linkKey) {
                                          const link = markDefs.find((def: any) => def._key === linkKey);
                                          if (link?._type === "link") {
                                            const embedType = getEmbedType(link.href);

                                            if (embedType) {
                                              return <Embed key={child._key || childIdx} url={link.href} />;
                                            }

                                            element = (
                                              <a
                                                key={child._key || childIdx}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-foreground underline hover:text-foreground/55 font-medium transition-colors"
                                              >
                                                {element}
                                              </a>
                                            );
                                          }
                                        }

                                        return element;
                                      });

                                      // Handle list items
                                      if (listItem === "bullet" || listItem === "number") {
                                        if (!currentList || currentList.type !== listItem) {
                                          if (currentList) {
                                            elements.push(
                                              currentList.type === "bullet"
                                                ? <ul key={`list-${elements.length}`} className="list-disc list-outside ml-5 space-y-2 my-4 text-foreground/80">{currentList.items}</ul>
                                                : <ol key={`list-${elements.length}`} className="list-decimal list-outside ml-5 space-y-2 my-4 text-foreground/80">{currentList.items}</ol>
                                            );
                                          }
                                          currentList = { type: listItem, items: [] };
                                        }
                                        currentList.items.push(<li key={idx} className="leading-relaxed pl-1">{text}</li>);
                                      } else {
                                        if (currentList) {
                                          elements.push(
                                            currentList.type === "bullet"
                                              ? <ul key={`list-${elements.length}`} className="list-disc list-outside ml-5 space-y-2 my-4 text-foreground/80">{currentList.items}</ul>
                                              : <ol key={`list-${elements.length}`} className="list-decimal list-outside ml-5 space-y-2 my-4 text-foreground/80">{currentList.items}</ol>
                                          );
                                          currentList = null;
                                        }

                                        if (style === "h1") elements.push(<h1 key={contentBlock._key || idx} className="text-3xl md:text-4xl font-semibold text-foreground mt-8 mb-4">{text}</h1>);
                                        else if (style === "h2") elements.push(<h2 key={contentBlock._key || idx} className="text-2xl md:text-3xl font-semibold text-foreground mt-7 mb-3">{text}</h2>);
                                        else if (style === "h3") elements.push(<h3 key={contentBlock._key || idx} className="text-xl md:text-2xl font-medium text-foreground mt-6 mb-2">{text}</h3>);
                                        else if (style === "h4") elements.push(<h4 key={contentBlock._key || idx} className="text-lg md:text-xl font-medium text-foreground mt-5 mb-2">{text}</h4>);
                                        else if (style === "blockquote") elements.push(<blockquote key={contentBlock._key || idx} className="pl-4 border-l-4 border-foreground/30 italic text-foreground/70 my-4 py-1">{text}</blockquote>);
                                        else elements.push(<div key={contentBlock._key || idx} className="mb-4 leading-relaxed text-foreground/80 text-sm md:text-base">{text}</div>);
                                      }
                                    }
                                  });

                                  if (currentList) {
                                    const list = currentList as { type: string; items: React.ReactElement[] };
                                    elements.push(
                                      list.type === "bullet"
                                        ? <ul key={`list-${elements.length}`} className="list-disc list-outside ml-5 space-y-2 my-4 text-foreground/80">{list.items}</ul>
                                        : <ol key={`list-${elements.length}`} className="list-decimal list-outside ml-5 space-y-2 my-4 text-foreground/80">{list.items}</ol>
                                    );
                                  }

                                  return elements;
                                })()}
                              </div>
                            </motion.div>
                          );
                        }

                        if (block._type === "videoBlock") {
                          // Collect all consecutive video blocks for masonry display
                          const videoBlocks: VideoBlock[] = [];
                          let currentIndex = selectedProject.caseStudyContent!.indexOf(block);

                          // Check if this is the first video in a sequence
                          const prevBlock = selectedProject.caseStudyContent![currentIndex - 1];
                          if (prevBlock?._type === "videoBlock") {
                            return null; // Skip - already rendered in previous grid
                          }

                          // Collect consecutive video blocks
                          while (currentIndex < selectedProject.caseStudyContent!.length) {
                            const currentBlock = selectedProject.caseStudyContent![currentIndex];
                            if (currentBlock._type === "videoBlock") {
                              videoBlocks.push(currentBlock as VideoBlock);
                              currentIndex++;
                            } else {
                              break;
                            }
                          }

                          const videoCount = videoBlocks.length;
                          const getGridCols = () => {
                            if (videoCount <= 4) return 2;
                            if (videoCount <= 6) return 3;
                            if (videoCount <= 9) return 4;
                            return 3;
                          };
                          const cols = getGridCols();

                          return (
                            <motion.div
                              key={block._key}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="w-full grid gap-4"
                              style={{
                                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                                gridAutoRows: 'auto'
                              }}
                            >
                              {videoBlocks.map((videoBlock) => (
                                <div key={videoBlock._key} className="bg-foreground/10 h-fit pb-2 space-y-1">
                                  {(videoBlock.videoUrl || videoBlock.video?.asset?.url) && (
                                    <div className="w-full overflow-hidden">
                                      <VideoPlayer
                                        size="small"
                                        videoUrl={videoBlock.videoUrl || videoBlock.video?.asset?.url}
                                        poster={thumbnailUrl(selectedProject.thumbnail, "lg")}
                                      />
                                    </div>
                                  )}
                                  {videoBlock.caption && (
                                    <p className="text-sm text-foreground text-center font-mono">{videoBlock.caption}</p>
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          );
                        }

                        if (block._type === "imageBlock") {
                          return (
                            <motion.div
                              key={block._key}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="w-full space-y-2"
                            >
                              {block.image && (
                                <div className="w-full overflow-hidden">
                                  <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    src={thumbnailUrl(block.image, "lg")}
                                    alt={block.caption || ""}
                                    className=""
                                  />
                                </div>
                              )}
                              {block.caption && (
                                <p className="text-sm text-foreground/55 text-center">{block.caption}</p>
                              )}
                            </motion.div>
                          );
                        }

                        if (block._type === "imageGrid") {
                          const imageCount = block.images?.length || 0;
                          const columnCount = imageCount === 1
                            ? 2
                            : block.layout === "four-column"
                              ? 4
                              : block.layout === "three-column"
                                ? 3
                                : 2;
                          return (
                            <motion.div
                              key={block._key}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="w-full"
                              style={{
                                columnCount: columnCount,
                                columnGap: '1rem',
                              }}
                            >
                              {block.images && block.images.map((image: any, idx: number) => (
                                <motion.div
                                  key={idx}
                                  className="overflow-hidden mb-4 break-inside-avoid"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                >
                                  <img
                                    src={thumbnailUrl(image, "lg")}
                                    alt={`Grid image ${idx + 1}`}
                                    className="w-full h-auto object-cover hover:scale-110 transition-transform duration-700"
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div className="text-foreground/60">Select a project to view details</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- RIGHT PANEL (LIST) --- */}
      <div className="w-full md:h-full relative col-span-2 flex flex-col gap-3 mt-7 overflow-hidden z-20 order-2 md:order-none shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:shadow-none">

        <div className="w-full sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          {/* Mobile Select */}
          <div className="md:hidden">
            <Select onValueChange={handleProjectSelect} value={selectedProject?._id || ""}>
              <SelectTrigger className="w-full p-3 border-none bg-transparent text-foreground rounded-none focus:ring-0 outline-none text-xs uppercase tracking-wider opacity-70">
                <SelectValue placeholder="Jump to..." />
              </SelectTrigger>
              <SelectContent className="mt-1 bg-background border-[1.5px] border-foreground rounded-none [&_*]:rounded-none">
                {data.map((project) => (
                  <SelectItem
                    key={project._id}
                    value={project._id}
                    className="cursor-pointer transition-colors duration-200 data-[highlighted]:bg-foreground data-[highlighted]:text-background data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                  >
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Desktop Select */}
          <div className="hidden md:block">
            <Select onValueChange={handleProjectSelect} value={selectedProject?._id || ""}>
              <SelectTrigger className="w-full p-3 border-foreground border-r-[1.5px] border-t-[1.5px] border-l-[1.5px] bg-transparent text-foreground rounded-none focus:ring-0 outline-none">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="mt-1 bg-background border-[1.5px] border-foreground rounded-none [&_*]:rounded-none">
                {data.map((project) => (
                  <SelectItem
                    key={project._id}
                    value={project._id}
                    className="cursor-pointer transition-colors duration-200 data-[highlighted]:bg-foreground data-[highlighted]:text-background data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                  >
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Animated Filter Bar - Hidden on mobile */}
          <div className={`w-full border-[1.5px] border-t-[0px] border-foreground hidden md:flex ${allFilters.length > 3 ? "overflow-x-auto scrollbar-hide" : "items-center"}`}>
            <LayoutGroup>
              <div className={`flex ${allFilters.length > 3 ? "min-w-max" : "w-full items-center"}`}>
                {allFilters.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <div
                      key={filter}
                      id={`filter-button-${filter}`}
                      onClick={() => handleFilterClick(filter)}
                      className={`relative flex items-center justify-center text-sm cursor-pointer ${allFilters.length > 3 ? "px-4 py-2 min-w-[100px]" : "flex-1 py-2"} transition-colors duration-200`}
                    >
                      {/* The Magic Sliding Background */}
                      {isActive && (
                        <motion.div
                          layoutId="activeFilter"
                          className="absolute inset-0 bg-foreground"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      {/* Text needs relative z-index to sit on top of the motion div */}
                      <span className={`relative z-10 ${isActive ? "text-background font-medium" : "text-foreground hover:opacity-70"}`}>
                        {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>
        </div>

        {/* --- LIST AREA --- */}
        <div ref={scrollContainerRef} className="w-full flex-1 p-3 md:pb-7 md:p-0 min-h-[100px] md:min-h-0 overflow-y-hidden overflow-x-auto md:overflow-x-hidden md:overflow-y-auto scrollbar-hide snap-x snap-mandatory md:snap-none flex flex-row md:flex-col gap-3">
          {/* Mobile Horizontal Thumbnails */}
          <div className="md:hidden contents">
            {filteredProjects.map((project) => {
              const isSelected = selectedProject?._id === project._id;
              return (
                <div key={project._id} id={`mobile-thumb-${project._id}`} onClick={() => handleProjectSelect(project._id)} className="snap-center shrink-0">
                  <motion.div className={`relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'shadow-lg scale-105' : 'opacity-70 scale-95'}`} whileTap={{ scale: 0.9 }}>
                    <img src={thumbnailUrl(project.thumbnail, "sm")} alt={project.name} className="w-full h-full object-cover" />
                    {isSelected && <motion.div layoutId="activeRing" className="absolute inset-0 bg-white/20 rounded-lg" />}
                  </motion.div>
                </div>
              );
            })}
          </div>
          {/* Desktop Vertical List */}
          <div className="hidden md:block w-full">
            <AnimatePresence mode="wait">
              <motion.div key={activeFilter} variants={listContainerVariants} initial="hidden" animate="visible" exit="exit" className="w-full space-y-3">
                {filteredProjects.length === 0 ? (
                  <motion.div variants={listItemVariants} className="text-center text-foreground/60 py-10">Nothing to show here</motion.div>
                ) : (
                  filteredProjects.map((project) => (
                    <motion.div key={project._id} variants={listItemVariants} layout>
                      <ProjectsCard id={project._id} className="h-full" image={thumbnailUrl(project.thumbnail)} title={project.name} subtitle={project.category} service={project.service || ""} onSelect={() => handleProjectSelect(project._id)} isSelected={selectedProject?._id === project._id} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsComponent;
