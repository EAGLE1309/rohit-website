"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";
import type { ProjectMain, CaseStudyBlock } from "@/lib/dashboard/queries/projects-main";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectsCard from "./card";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

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
    .sort((a, b) => activeFilter === "all"
      ? a.name.localeCompare(b.name)
      : new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
    );

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
                  <div className="w-full flex flex-col gap-5">
                    <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                      <div className="w-full col-span-1">
                        <p className="text-3xl md:text-5xl font-medium">
                          {(() => {
                            const name = selectedProject?.name || "";
                            const num = name ? String(name.split("").reduce((acc: any, c: any) => acc + c.charCodeAt(0), 0) % 100).padStart(2, "0") : "--";
                            return <span className="text-3xl md:text-5xl font-medium">{num}.</span>;
                          })()}
                        </p>
                      </div>
                      <div className="w-full col-span-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-3xl md:text-5xl uppercase font-medium"
                        >
                          {selectedProject?.name}
                        </motion.div>
                      </div>
                    </div>

                    {selectedProject?.description && (
                      <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                        <span className="w-full col-span-1"></span>
                        <div className="w-full col-span-4">
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm md:text-base text-foreground/55 leading-relaxed"
                          >
                            {selectedProject.description}
                          </motion.p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Project Details Section */}
                  <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                    <div className="w-full col-span-1"></div>
                    <div className="w-fit col-span-4 grid grid-cols-2 text-sm md:text-base text-foreground/55">
                      <div className="flex flex-col gap-1">
                        <p className="text-foreground">Category</p>
                        {selectedProject?.service && <p className="text-foreground">Service</p>}
                        {selectedProject?.client && <p className="text-foreground">Client</p>}
                        <p className="text-foreground">Created</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p>{selectedProject?.category.charAt(0).toUpperCase() + selectedProject?.category.slice(1) || "None"}</p>
                        {selectedProject?.service && <p>{selectedProject.service}</p>}
                        {selectedProject?.client && <p>{selectedProject.client}</p>}
                        <p>{new Date(selectedProject?._createdAt || "").toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {selectedProject?.thumbnail && (
                    <motion.div
                      className="w-full overflow-hidden rounded-md"
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
                              className="w-full grid grid-cols-3 md:grid-cols-5 gap-8"
                            >
                              <div className="w-full col-span-1"></div>
                              <div className="w-full col-span-5 prose prose-sm md:prose-base max-w-none text-foreground/70">
                                {block.content && (() => {
                                  const elements: React.ReactElement[] = [];
                                  let currentList: { type: string; items: React.ReactElement[] } | null = null;

                                  block.content.forEach((contentBlock: any, idx: number) => {
                                    if (contentBlock._type === "block") {
                                      const style = contentBlock.style || "normal";
                                      const listItem = contentBlock.listItem;
                                      const children = contentBlock.children || [];
                                      const text = children.map((child: any, childIdx: number) => {
                                        const content = child.text || "";
                                        if (child.marks?.includes("strong")) {
                                          return <strong key={child._key || childIdx}>{content}</strong>;
                                        }
                                        if (child.marks?.includes("em")) {
                                          return <em key={child._key || childIdx}>{content}</em>;
                                        }
                                        return content;
                                      });

                                      // Handle list items
                                      if (listItem === "bullet" || listItem === "number") {
                                        if (!currentList || currentList.type !== listItem) {
                                          if (currentList) {
                                            elements.push(
                                              currentList.type === "bullet"
                                                ? <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-3">{currentList.items}</ul>
                                                : <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-3">{currentList.items}</ol>
                                            );
                                          }
                                          currentList = { type: listItem, items: [] };
                                        }
                                        currentList.items.push(<li key={idx} className="leading-relaxed">{text}</li>);
                                      } else {
                                        if (currentList) {
                                          elements.push(
                                            currentList.type === "bullet"
                                              ? <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-3">{currentList.items}</ul>
                                              : <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-3">{currentList.items}</ol>
                                          );
                                          currentList = null;
                                        }

                                        if (style === "h2") elements.push(<h2 key={idx} className="text-2xl font-bold mt-6 mb-3">{text}</h2>);
                                        else if (style === "h3") elements.push(<h3 key={idx} className="text-xl font-bold mt-4 mb-2">{text}</h3>);
                                        else if (style === "blockquote") elements.push(<blockquote key={idx} className="pl-4 italic my-4">{text}</blockquote>);
                                        else elements.push(<p key={idx} className="mb-3 leading-relaxed">{text}</p>);
                                      }
                                    }
                                  });

                                  if (currentList) {
                                    const list = currentList as { type: string; items: React.ReactElement[] };
                                    elements.push(
                                      list.type === "bullet"
                                        ? <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-3">{list.items}</ul>
                                        : <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-3">{list.items}</ol>
                                    );
                                  }

                                  return elements;
                                })()}
                              </div>
                            </motion.div>
                          );
                        }

                        if (block._type === "videoBlock") {
                          return (
                            <motion.div
                              key={block._key}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="w-full space-y-2"
                            >
                              {block.video && (
                                <div className="w-full overflow-hidden rounded-md">
                                  <video
                                    src={block.video.asset?.url}
                                    controls
                                    className="w-full aspect-video object-cover"
                                  />
                                </div>
                              )}
                              {block.caption && (
                                <p className="text-sm text-foreground/55 text-center">{block.caption}</p>
                              )}
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
                                <div className="w-full overflow-hidden rounded-md">
                                  <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    src={thumbnailUrl(block.image, "lg")}
                                    alt={block.caption || ""}
                                    className="w-full aspect-video object-cover"
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
                          const gridCols = block.layout === "four-column" ? "grid-cols-4" : block.layout === "three-column" ? "grid-cols-3" : "grid-cols-2";
                          return (
                            <motion.div
                              key={block._key}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`w-full grid ${gridCols} gap-4`}
                            >
                              {block.images && block.images.map((image: any, idx: number) => (
                                <motion.div
                                  key={idx}
                                  className="overflow-hidden rounded-md"
                                >
                                  <img
                                    src={thumbnailUrl(image, "lg")}
                                    alt={`Grid image ${idx + 1}`}
                                    className="w-full aspect-video object-cover hover:scale-110 transition-transform duration-700"
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
