import WorkComponent from "./component";
import { getProjects } from "@/lib/dashboard/queries/projects";

const WorksPage = async () => {
  const projects = await getProjects();

  return <WorkComponent projects={projects} />;
};

export default WorksPage;
