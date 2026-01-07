import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import ProjectsComponent from "./components/projects";
import { getProjects } from "@/lib/dashboard/queries/projects";

const ProjectsPage = async () => {
  const projects = await getProjects();

  return (
    <MaxWidthWrapper className="overflow-hidden h-[90vh] md:h-[calc(100vh-6.125rem)] py-1 mt-[5.6875rem] relative flex items-center justify-center">
      <ProjectsComponent data={projects} />
    </MaxWidthWrapper>
  );
};

export default ProjectsPage;
