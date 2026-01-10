"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, } from "react";
import type { Project } from "@/lib/dashboard/queries/projects";
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

const ProjectsComponent = ({ data }: { data: Project[] }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

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

  const handleProjectSelect = async (projectId: string) => {
    if (!projectId) {
      setSelectedProject(null);
      return;
    }
    const project = data.find(p => p._id === projectId);
    if (project) {
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
    }
  };

  const handleSelectChange = (projectId: string) => {
    handleProjectSelect(projectId);
  };

  // Filter and sort logic
  const filteredProjects = data
    .filter((project) => project.name)
    .filter((project) => activeFilter === "all" ? true : project.category === activeFilter)
    .sort((a, b) => activeFilter === "all"
      ? a.name.localeCompare(b.name)
      : new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
    );

  return (
    <div className="w-full relative h-full flex flex-col-reverse md:grid md:grid-cols-7">

      {/* --- LEFT PANEL (DETAILS) --- */}
      <div className="w-full h-full col-span-5 border-[1.5px] rounded-xl overflow-hidden border-r-0 rounded-r-none border-foreground/45 relative bg-background">
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

                    {/* About Section */}
                    <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                      <span className="w-full col-span-1"></span>
                      <div className="w-full col-span-4">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm md:text-base text-foreground/55 leading-relaxed"
                        >
                          {selectedProject?.description}
                        </motion.p>
                      </div>
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                    <div className="w-full col-span-1"></div>
                    <div className="w-fit col-span-4 grid grid-cols-2 text-sm md:text-base text-foreground/55">
                      <div className="flex flex-col gap-1">
                        <p className="text-foreground">Category</p>
                        <p className="text-foreground">Service</p>
                        <p className="text-foreground">Client</p>
                        <p className="text-foreground">Created</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p>{selectedProject?.category.charAt(0).toUpperCase() + selectedProject?.category.slice(1) || "Personal"}</p>
                        <p>Mix Media Video</p>
                        <p>N/A</p>
                        <p>{new Date(selectedProject?._createdAt || "").toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {selectedProject?.thumbnail && (
                    <motion.div
                      className="w-full overflow-hidden rounded-md border-[1.5px] border-foreground/45"
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

                  {/* Project Content */}
                  <div className="w-full">
                    <div className="w-full col-span-1"></div>
                    <div className="w-full col-span-4 space-y-8">
                      {/* Overview */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold">Overview</h3>
                        <p className="text-sm md:text-base text-foreground/55 leading-relaxed">
                          In December 2024, BAPE partnered with Don Toliver...
                        </p>
                      </div>
                      {/* Objective */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold">Objective</h3>
                        <p className="text-sm md:text-base text-foreground/55 leading-relaxed">
                          Create a bold, mixed-media commercial...
                        </p>
                      </div>
                      {/* My Role */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold">My Role</h3>
                        <div className="space-y-2 text-sm md:text-base text-foreground/55 leading-relaxed">
                          <p><strong>Assistant Director + Lead Editor</strong></p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Supported on-set direction...</li>
                            <li>Operated camera setups...</li>
                            <li>Led the complete editing workflow...</li>
                            <li>Integrated mixed-media overlays...</li>
                          </ul>
                        </div>
                      </div>

                      {/* Extra Images Grid */}
                      {selectedProject?.thumbnail && (
                        <div className="w-full grid grid-cols-2 gap-8">
                          {/* Reusing thumbnail for demo, ideally these are different images */}
                          {[1, 2].map((i) => (
                            <motion.div
                              key={i}
                              whileHover={{ y: -5 }}
                              className="overflow-hidden border-[1.5px] border-foreground/45"
                            >
                              <img
                                src={thumbnailUrl(selectedProject.thumbnail, "lg")}
                                alt={selectedProject.name}
                                className="w-full aspect-video object-cover hover:scale-110 transition-transform duration-700"
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Approach & Outcome */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold">Creative Approach</h3>
                        <div className="space-y-3 text-sm md:text-base text-foreground/55 leading-relaxed">
                          <p>The campaign leaned into a gritty...</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Rapid cuts + stylized transitions...</li>
                            <li>Mixed-media overlays...</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
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
      <div className="w-full h-full relative col-span-2 flex flex-col gap-3 rounded-xl rounded-l-none scrollbar-hide border-[1.5px] border-foreground/45 overflow-y-auto bg-background">

        <div className="w-full sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          {/* Mobile Select */}
          <Select onValueChange={handleSelectChange} value={selectedProject?._id || ""}>
            <SelectTrigger className="w-full p-3 border-r-0 border-t-0 border-l-0 border-b-[1.5px] border-foreground/45 bg-transparent text-foreground rounded-none focus:ring-0 outline-none">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="rounded-none mt-1 bg-white border-[1.5px] border-foreground/45">
              {data.map((project) => (
                <SelectItem key={project._id} value={project._id} className="cursor-pointer">
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Animated Filter Bar */}
          <div className={`w-full border-b-[1.5px] border-foreground/45 ${allFilters.length > 3 ? "overflow-x-auto scrollbar-hide" : "flex items-center"}`}>
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

        {/* --- FIXED LIST ANIMATION --- */}
        <div className="w-full pt-0 p-2.5 min-h-[200px]">
          {/* mode="wait" ensures the old list is GONE before new one starts */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter} // Triggers the full exit/enter when filter changes
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full space-y-3"
            >
              {filteredProjects.length === 0 ? (
                <motion.div
                  variants={listItemVariants}
                  className="text-center text-foreground/60 py-10"
                >
                  Nothing to show here
                </motion.div>
              ) : (
                filteredProjects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    variants={listItemVariants} // Children use these variants
                    layout // Keeps the smooth sort if order changes within same filter
                  >
                    <ProjectsCard
                      id={project._id}
                      className="h-full"
                      isLast={index === filteredProjects.length - 1}
                      image={thumbnailUrl(project.thumbnail)}
                      title={project.name}
                      subtitle={project.category}
                      onSelect={() => handleProjectSelect(project._id)}
                      isSelected={selectedProject?._id === project._id}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div >
  );
};

export default ProjectsComponent;
