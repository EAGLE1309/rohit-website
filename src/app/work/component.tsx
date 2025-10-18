"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Image from "next/image";
import { ParallaxGridWrapper } from "@/components/work/parallax";
import { HyperText } from "@/components/hyper-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";
import Link from "@/components/navigations/link";
import { urlFor } from "@/lib/dashboard/sanity-cilent";
import type { Project } from "@/lib/dashboard/queries/projects";
import { motion, AnimatePresence } from "motion/react";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Highlights", value: "highlights" },
  { label: "Personal", value: "personal" },
  { label: "Photography", value: "photography" },
  { label: "Projects", value: "projects" },
  { label: "Archives", value: "archives" },
];

const WorksComponent = ({ projects }: { projects: Project[] }) => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <MaxWidthWrapper className="mt-28 relative">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 grid-rows-2 place-items-start gap-5 md:gap-0 pb-16">
          {filterOptions.map((filter, index) => (
            <TabsTrigger
              className={`text-sm uppercase font-medium md:font-normal cursor-pointer ${activeTab === filter.value ? "" : ""}`}
              key={index}
              value={filter.value}
            >
              {filter.label}
              {activeTab === filter.value ? (
                <span className="text-red-500 relative">
                  &nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="after:absolute after:h-[2px] after:top-1/2 after:-translate-y-1/2 after:w-[28px] after:bg-current after:left-0" />]
                </span>
              ) : (
                <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</span>
              )}
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
                  <ParallaxGridWrapper className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 md:gap-16 gap-5">
                    {projects.map((project: Project, index: number) => (
                      <Card key={project._id} id={project._id} image={urlFor(project.thumbnail).url()} title={project.name} />
                    ))}
                    {Array.from({ length: (index + 1) * 5 }).map((_, i) => (
                      <Card key={i} />
                    ))}
                  </ParallaxGridWrapper>{" "}
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

const Card = ({ id = "default", title = "Don Toliver For Bape - [December 2024]", image }: { id?: string; title?: string; image?: string }) => {
  return (
    <motion.div
      className="w-full group flex flex-col cursor-pointer gap-1"
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    >
      <Link href={`/work/${id}`} className="w-full group flex flex-col cursor-pointer gap-1">
        <div className="w-full h-full">
          <Image
            className="w-full h-full object-cover group-hover:brightness-85 transition-all"
            src={image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=270&fit=crop"}
            alt="Work 1"
            width={400}
            height={500}
          />
        </div>
        <HyperText animateOnHover triggerOnGroupHover playOnce className="text-xs md:text-sm">
          {title}
        </HyperText>
      </Link>
    </motion.div>
  );
};
