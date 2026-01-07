"use client";

import { useState } from "react";
import type { Project } from "@/lib/dashboard/queries/projects";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProjectsComponent = ({ data }: { data: Project[] }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectSelect = async (projectId: string) => {
    if (!projectId) {
      setSelectedProject(null);
      return;
    }

    // Find the project in the already loaded data to avoid client-side Sanity API calls
    const project = data.find(p => p._id === projectId);

    if (project) {
      setSelectedProject(project);
    } else {
      console.error("Project not found in loaded data");
      setSelectedProject(null);
    }
  };

  const handleSelectChange = (projectId: string) => {
    handleProjectSelect(projectId);
  };

  return (
    <div className="w-full relative h-full grid grid-cols-7">
      <div className="w-full h-full col-span-5 border-[1.5px] border-r-0 border-foreground/45 p-1">
        {selectedProject ? (
          <div className="w-full h-full overflow-y-auto p-4">
            <div className="w-full flex flex-col gap-6">
              {/* Project Header */}
              <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-3xl md:text-5xl font-medium">
                    {(() => {
                      const name = selectedProject?.name || "";
                      const num = name ? String(name.split("").reduce((acc: any, c: any) => acc + c.charCodeAt(0), 0) % 100).padStart(2, "0") : "--";
                      return <span className="text-3xl md:text-5xl font-medium">{num}.</span>;
                    })()}
                  </p>
                </div>
                <div className="w-full col-span-2 md:col-span-3">
                  <div className="text-3xl md:text-5xl uppercase font-medium">{selectedProject?.name}</div>
                </div>
              </div>

              {/* About Section */}
              <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base font-medium">About</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3">
                  <p className="text-sm md:text-base text-foreground/55 leading-relaxed">{selectedProject?.description}</p>
                </div>
              </div>

              {/* Project Details Section */}
              <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base">Project Details</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3 flex flex-col gap-2 text-sm md:text-base text-foreground/55">
                  <p>Category - {selectedProject?.category || "Personal"}</p>
                  <p>Service - Mix Media Video</p>
                  <p>Client - N/A</p>
                  <p>Created - {new Date(selectedProject?._createdAt || "").toLocaleDateString()}</p>
                </div>
              </div>

              {/* Thumbnail Preview */}
              {selectedProject?.thumbnail && (
                <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                  <div className="w-full col-span-1 md:col-span-2">
                    <p className="text-sm md:text-base">Preview</p>
                  </div>
                  <div className="w-full col-span-2 md:col-span-3">
                    <img
                      src={thumbnailUrl(selectedProject.thumbnail, "lg")}
                      alt={selectedProject.name}
                      className="w-full max-w-md border-[1.5px] border-foreground/45"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-foreground/60">Select a project to view details</div>
          </div>
        )}
      </div>
      <div className="w-full h-full relative col-span-2 flex flex-col gap-3 border-[1.5px] border-foreground/45 p-1 overflow-y-auto scrollbar-hide">
        {/* Project Selector */}
        <div className="w-full sticky top-0 z-10 bg-background">
          <Select onValueChange={handleSelectChange} value={selectedProject?._id || ""}>
            <SelectTrigger className="w-full p-2 border-b-[1.5px] border-foreground/45 bg-background text-foreground rounded-none focus:ring-0 focus:ring-offset-0 outline-none">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[1.5px] border-foreground/45 mt-1" align="start" sideOffset={4}>
              {data
                .filter((project: Project) => project.name)
                .sort((a: Project, b: Project) => a.name.localeCompare(b.name))
                .map((project: Project) => (
                  <SelectItem key={project._id} value={project._id} className="rounded-none focus:ring-0 focus:ring-offset-0 outline-none">
                    {project.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Cards */}
        {data.length === 0 ? (
          <div className="col-span-full text-center text-foreground/60">Nothing to show here</div>
        ) : (
          <>
            {data
              .filter((project: Project) => project.name)
              .sort((a: Project, b: Project) => a.name.localeCompare(b.name))
              .map((project: Project) => (
                <ProjectsCard
                  key={project._id}
                  id={project._id}
                  image={thumbnailUrl(project.thumbnail)}
                  title={project.name}
                  subtitle={project.category}
                  onSelect={() => handleProjectSelect(project._id)}
                  isSelected={selectedProject?._id === project._id}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsComponent;

const ProjectsCard = ({
  id,
  image,
  title,
  subtitle,
  onSelect,
  isSelected,
}: {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  onSelect?: () => void;
  isSelected?: boolean;
}) => {
  return (
    <div
      className={`w-full grid grid-cols-5 gap-1 cursor-pointer transition-colors ${isSelected ? "bg-foreground/10 border-[1.5px] border-foreground/45" : "hover:bg-foreground/5"
        }`}
      onClick={onSelect}
    >
      <img className="w-full col-span-2 border-[1.5px] h-[5rem] bg-foreground/5 border-foreground/45 p-1" src={image} alt={""} />
      <p className="w-full text-md font-medium col-span-3">{title}</p>
    </div>
  );
};
