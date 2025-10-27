import PhotographyDetailsComponent from "./component";
import { getPhotographyById, getPhotography } from "@/lib/dashboard/queries/photography";

const PhotographyDetailsPage = async ({ params }: { params: { photo: string } }) => {
  const { photo } = await params;

  const photography = await getPhotographyById(photo);

  const allPhotography = await getPhotography();

  return <PhotographyDetailsComponent photo={photography} allPhotography={allPhotography} />;
};

export default PhotographyDetailsPage;
