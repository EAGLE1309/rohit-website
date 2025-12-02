import type { Metadata } from "next";
import PhotographyDetailsComponent from "./component";
import { getPhotographyById } from "@/lib/dashboard/queries/photography";

type Props = {
  params: Promise<{ photo: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { photo } = await params;
  const photography = await getPhotographyById(photo);

  if (!photography) {
    return {
      title: "Photo Not Found",
      description: "The requested photograph could not be found.",
    };
  }

  return {
    title: photography.name,
    description:
      photography.description || `${photography.name} - Photography by Rohit Patnala. Visual art capturing moments through the lens of RO6IT.`,
    keywords: [photography.name, "Rohit Patnala photography", "visual art", "RO6IT photos", "Houston photographer", "creative photography"],
    openGraph: {
      title: `${photography.name} | Rohit Patnala`,
      description: photography.description || `${photography.name} - Photography by Rohit Patnala.`,
      url: `https://ro6it.com/photography/${photo}`,
      siteName: "Rohit Patnala",
      images: [
        {
          url: "https://ro6it.com/home.png",
          width: 1200,
          height: 630,
          alt: `${photography.name} - Featured by Rohit Patnala`,
        },
      ],
      type: "article",
    },
    alternates: {
      canonical: `https://ro6it.com/photography/${photo}`,
    },
  };
}

const PhotographyDetailsPage = async ({ params }: Props) => {
  const { photo } = await params;

  const photography = await getPhotographyById(photo);

  return <PhotographyDetailsComponent photo={photography} />;
};

export default PhotographyDetailsPage;
