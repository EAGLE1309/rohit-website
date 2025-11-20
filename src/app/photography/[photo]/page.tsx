import PhotographyDetailsComponent from "./component";
import { getPhotographyById } from "@/lib/dashboard/queries/photography";

const PhotographyDetailsPage = async ({ params }: { params: { photo: string } }) => {
  const { photo } = await params;

  const photography = await getPhotographyById(photo);

  return <PhotographyDetailsComponent photo={photography} />;
};

export default PhotographyDetailsPage;
