"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Image from "next/image";
import { ElasticGridWrapper } from "@/components/work/parallax";
import { HyperText } from "@/components/hyper-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";
import Link from "@/components/navigations/link";
import { urlFor } from "@/lib/dashboard/sanity-cilent";
import type { Project } from "@/lib/dashboard/queries/projects";

const filterOptions = [
  {
    label: "All",
    value: "all",
    active: true,
  },
  {
    label: "Highlights",
    value: "highlights",
  },
  {
    label: "Music",
    value: "music",
  },
  {
    label: "Photographs",
    value: "performance",
  },
];

const WorksComponent = ({ projects }: { projects: Project[] }) => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <MaxWidthWrapper className="mt-28 relative">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex items-center flex-wrap justify-center gap-5 md:gap-8 pb-16">
          {filterOptions.map((filter, index) => (
            <TabsTrigger
              className={`text-sm uppercase font-medium md:font-normal cursor-pointer ${
                activeTab === filter.value ? "underline decoration-[2.25px] decoration-red-500 underline-offset-4" : ""
              }`}
              key={index}
              value={filter.value}
            >
              {activeTab === filter.value && <span className="text-red-500">[</span>}
              {filter.label}
              {activeTab === filter.value && <span className="text-red-500">]</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <ElasticGridWrapper
            className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 md:gap-16 gap-5"
            baseLag={0.1}
            lagScale={0.15}
            smoothness={0.15}
            dampening={0.85}
            randomOffset={0}
            role="grid"
            aria-label="My elastic grid"
          >
            {projects.map((project: Project) => (
              <Card key={project._id} id={project._id} image={urlFor(project.thumbnail).url()} title={project.name} />
            ))}
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
          </ElasticGridWrapper>
        </TabsContent>
        <TabsContent value="highlights">
          <ElasticGridWrapper
            className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 md:gap-16 gap-5"
            baseLag={0.1}
            lagScale={0.15}
            smoothness={0.15}
            dampening={0.85}
            randomOffset={0}
            role="grid"
            aria-label="My elastic grid"
          >
            {projects.map((project: Project) => (
              <Card key={project._id} id={project._id} image={urlFor(project.thumbnail).url()} title={project.name} />
            ))}
          </ElasticGridWrapper>
        </TabsContent>
        <TabsContent value="music">
          <ElasticGridWrapper
            className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 md:gap-16 gap-5"
            baseLag={0.1}
            lagScale={0.15}
            smoothness={0.15}
            dampening={0.85}
            randomOffset={0}
            role="grid"
            aria-label="My elastic grid"
          >
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
          </ElasticGridWrapper>
        </TabsContent>
        <TabsContent value="performance">
          <ElasticGridWrapper
            className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 md:gap-16 gap-5"
            baseLag={0.1}
            lagScale={0.15}
            smoothness={0.15}
            dampening={0.85}
            randomOffset={0}
            role="grid"
            aria-label="My elastic grid"
          >
            <Card />
            <Card />
            <Card />
          </ElasticGridWrapper>
        </TabsContent>
      </Tabs>
    </MaxWidthWrapper>
  );
};

export default WorksComponent;

const Card = ({ id = "default", title = "Don Toliver For Bape - [December 2024]", image }: { id?: string; title?: string; image?: string }) => {
  return (
    <Link href={`/work/${id}`} className="w-full group flex flex-col cursor-pointer gap-1">
      <Image
        className="w-full h-full object-cover group-hover:brightness-85 transition-all"
        src={image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=270&fit=crop"}
        alt="Work 1"
        width={400}
        height={500}
      />
      <HyperText animateOnHover triggerOnGroupHover playOnce className="text-xs md:text-sm">
        {title}
      </HyperText>
    </Link>
  );
};
