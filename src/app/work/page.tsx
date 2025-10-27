import WorkComponent from "./component";
import { getProjects } from "@/lib/dashboard/queries/projects";
import { getPhotography } from "@/lib/dashboard/queries/photography";

const WorksPage = async () => {
  const projects = await getProjects();
  const photography = await getPhotography();

  return <WorkComponent projects={projects} photography={photography} />;
};

export default WorksPage;
