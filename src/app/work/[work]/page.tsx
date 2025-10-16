import { getProjectById, getProjects } from "@/lib/dashboard/queries/projects";
import WorkDetailsComponent from "./component";

const WorkDetailsPage = async ({ params }: { params: { work: string } }) => {
  const { work } = await params;

  const project = await getProjectById(work);
  const allProjects = await getProjects();

  return <WorkDetailsComponent project={project} allProjects={allProjects} />;
};

export default WorkDetailsPage;
