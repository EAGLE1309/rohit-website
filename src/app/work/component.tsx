"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Image from "next/image";
import { ParallaxGridWrapper } from "@/components/work/parallax";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";
import Link from "@/components/navigations/link";
import { urlFor } from "@/lib/dashboard/sanity-cilent";
import type { Project } from "@/lib/dashboard/queries/projects";
import type { Photography } from "@/lib/dashboard/queries/photography";
import { motion, AnimatePresence } from "motion/react";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Selected", value: "selected" },
  { label: "Personal", value: "personal" },
  { label: "Photography", value: "photography" },
  { label: "Projects", value: "projects" },
  { label: "Archives", value: "archives" },
];

const WorksComponent = ({ projects, photography }: { projects: Project[]; photography: Photography[] }) => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <MaxWidthWrapper className="pt-28 relative">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-[75%] mx-auto flex justify-evenly flex-wrap items-center pb-20 pt-8">
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
        {filterOptions.map((filter, index) => (
          <TabsContent key={filter.value} value={filter.value}>
            <AnimatePresence mode="wait">
              {activeTab === filter.value && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.02 } },
                  }}
                >
                  <ParallaxGridWrapper className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-28 md:gap-y-16">
                    {filter.value === "all" ? (
                      projects.length === 0 && photography.length === 0 ? (
                        <div className="col-span-full text-center text-foreground/60">Nothing to show here</div>
                      ) : (
                        <>
                          {projects.map((project: Project) => (
                            <Card
                              key={project._id}
                              id={project._id}
                              image={urlFor(project.thumbnail).url()}
                              title={project.name}
                              subtitle={project.category}
                            />
                          ))}
                          {photography.map((photo: Photography) => (
                            <Card
                              key={photo._id}
                              id={photo._id}
                              isPhoto
                              image={urlFor(photo.image).url()}
                              title={photo.name}
                              subtitle="PHOTOGRAPHY"
                            />
                          ))}
                        </>
                      )
                    ) : filter.value === "photography" ? (
                      photography.length === 0 ? (
                        <div className="col-span-full text-center text-foreground/60">Nothing to show here</div>
                      ) : (
                        photography.map((photo: Photography) => (
                          <Card
                            key={photo._id}
                            id={photo._id}
                            isPhoto
                            noBadge
                            image={urlFor(photo.image).url()}
                            title={photo.name}
                            subtitle="PHOTOGRAPHY"
                          />
                        ))
                      )
                    ) : projects.some((project: Project) => project.category === filter.value) ? (
                      projects.map(
                        (project: Project) =>
                          project.category === filter.value && (
                            <Card
                              key={project._id}
                              id={project._id}
                              image={urlFor(project.thumbnail).url()}
                              title={project.name}
                              subtitle={project.category}
                            />
                          )
                      )
                    ) : (
                      <div className="col-span-full w-full text-center text-foreground/60">Nothing to show here</div>
                    )}
                  </ParallaxGridWrapper>
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
  title = "Don Toliver For Bape - [December 2024]",
  subtitle,
  isPhoto = false,
  noBadge = false,
  image,
}: {
  id?: string;
  title?: string;
  subtitle?: string | null;
  isPhoto?: boolean;
  noBadge?: boolean;
  image?: string;
}) => {
  const fallbackSubtitle = isPhoto ? "PHOTOGRAPHY" : "PERSONAL";
  return (
    <motion.div
      className="w-full group relative flex flex-col items-center text-center gap-3"
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    >
      {!noBadge && isPhoto && <div className="absolute py-0.5 px-1 text-xs z-[1] top-2 left-2 font-medium bg-white">PHOTO</div>}
      <Link href={isPhoto ? `/photography/${id}` : `/work/${id}`} className="w-full flex flex-col items-center text-center gap-3">
        <div className="overflow-hidden">
          <Image
            className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            src={image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=270&fit=crop"}
            alt="Work 1"
            width={400}
            height={500}
          />
        </div>
        <div className="flex flex-col items-center text-center gap-1">
          <p className="text-xs uppercase font-medium text-foreground">{title}</p>
          <span className="text-[12px] uppercase text-foreground/55">{(subtitle || fallbackSubtitle || "").trim()}</span>
        </div>
      </Link>
    </motion.div>
  );
};
