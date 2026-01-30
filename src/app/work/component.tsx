"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState, useMemo } from "react";
import Link from "@/components/navigations/link";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import type { Project } from "@/lib/dashboard/queries/projects";
import type { Photography } from "@/lib/dashboard/queries/photography";
import { motion, AnimatePresence } from "motion/react";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Branded // Commercial", value: "commercial" },
  { label: "Events", value: "events" },
  { label: "Personal", value: "personal" },
  { label: "Photography", value: "photography" },
  { label: "Projects", value: "projects" },
  { label: "Archives", value: "archives" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const WorksComponent = ({ projects, photography }: { projects: Project[]; photography: Photography[] }) => {
  const [activeTab, setActiveTab] = useState("all");

  const shuffledProjects = useMemo(() => shuffleArray(projects), [projects]);
  const shuffledPhotography = useMemo(() => shuffleArray(photography), [photography]);

  return (
    <MaxWidthWrapper className="pt-28 relative">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-[75%] mx-auto flex justify-between md:justify-evenly flex-wrap items-center pb-10 md:pb-20 md:pt-8 gap-2.5">
          {filterOptions.map((filter, index) => (
            <TabsTrigger
              className={`text-sm uppercase font-medium md:font-normal cursor-pointer ${activeTab === filter.value ? "" : ""}`}
              key={index}
              value={filter.value}
            >
              {filter.label}
              {activeTab === filter.value ? <span>&nbsp;[&nbsp;•&nbsp;]</span> : <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;]</span>}
            </TabsTrigger>
          ))}
        </TabsList>
        {filterOptions.map((filter) => (
          <TabsContent key={filter.value} value={filter.value}>
            <AnimatePresence mode="wait">
              {activeTab === filter.value && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.03,
                        staggerDirection: 1,
                      },
                    },
                  }}
                >
                  <div className="w-full columns-2 md:columns-3 lg:columns-5 mb-12 gap-3 md:gap-8 space-y-3 md:space-y-8!">
                    {filter.value === "all" ? (
                      projects.length === 0 && photography.length === 0 ? (
                        <div className="w-full flex items-center justify-center h-64 text-center text-foreground/60 font-mono" style={{ columnSpan: 'all' }}>Nothing to show here</div>
                      ) : (
                        <>
                          {shuffledProjects.map((project: Project) => (
                            <Card
                              key={project._id}
                              id={project._id}
                              image={thumbnailUrl(project.thumbnail)}
                              title={project.name}
                              subtitle={[...project.category].sort()}
                            />
                          ))}
                        </>
                      )
                    ) : filter.value === "photography" ? (
                      photography.length === 0 ? (
                        <div className="w-full flex items-center justify-center h-64 text-center text-foreground/60 font-mono" style={{ columnSpan: 'all' }}>Nothing to show here</div>
                      ) : (
                        shuffledPhotography.map((photo: Photography) => (
                          <Card
                            key={photo._id}
                            id={photo._id}
                            isPhoto
                            noBadge
                            image={thumbnailUrl(photo.image)}
                            title={photo.name}
                            subtitle="PHOTOGRAPHY"
                          />
                        ))
                      )
                    ) : projects.some((project: Project) => project.category.includes(filter.value)) ? (
                      shuffledProjects
                        .filter((project: Project) => project.category.includes(filter.value))
                        .map((project: Project) => (
                          <Card
                            key={project._id}
                            id={project._id}
                            image={thumbnailUrl(project.thumbnail)}
                            title={project.name}
                            subtitle={[...project.category].sort()}
                          />
                        ))
                    ) : (
                      <div className="w-full flex items-center justify-center h-64 text-center text-foreground/60 font-mono" style={{ columnSpan: 'all' }}>Nothing to show here</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </MaxWidthWrapper>
  );
};

export default WorksComponent;

const Card = ({
  id = "default",
  title,
  subtitle,
  isPhoto = false,
  noBadge = false,
  image,
}: {
  id?: string;
  title?: string;
  subtitle?: string | string[] | null;
  isPhoto?: boolean;
  noBadge?: boolean;
  image?: string;
}) => {
  const hasTitle = Boolean(title?.trim());
  const subtitleString = Array.isArray(subtitle)
    ? subtitle.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')
    : subtitle;
  const hasSubtitle = Boolean(subtitleString?.trim()) && subtitleString?.trim().toLowerCase() !== "none";
  const shouldRenderMeta = !isPhoto && (hasTitle || hasSubtitle);
  const subtitleText = hasSubtitle ? subtitleString?.trim() : "";

  return (
    <motion.div
      className={`w-full group relative flex flex-col items-start ${isPhoto ? '' : 'bg-foreground/5'} text-left gap-3 break-inside-avoid mb-4`}
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    >
      {!noBadge && isPhoto && <div className="absolute py-0.5 px-1 text-xs z-[1] top-2 left-2 font-medium bg-white">PHOTO</div>}
      <Link href={isPhoto ? `/photography/${id}` : `/work/${id}`} className="w-full flex flex-col items-start text-left gap-3">
        <div className="overflow-hidden w-full">
          <Image
            className="w-full h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            src={image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=270&fit=crop"}
            alt="Work 1"
            width={400}
            height={400}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
        {!isPhoto && <div className="flex flex-col items-start text-left p-2 pt-0 gap-1">
          {shouldRenderMeta && (
            <>
              {hasTitle && <p className="text-xs md:text-sm uppercase font-medium text-foreground">{title?.trim()}</p>}
              {subtitleText && <span className="text-xs md:text-sm font-mono text-foreground/75">{subtitleText}</span>}
            </>
          )}
        </div>
        }
      </Link>
    </motion.div>
  );
};
