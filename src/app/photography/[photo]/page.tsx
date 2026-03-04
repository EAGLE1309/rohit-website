import type { Metadata } from "next";
import PhotographyDetailsComponent from "./component";
import { getPhotographyById } from "@/lib/dashboard/queries/photography";
import { fullImageUrl } from "@/lib/dashboard/sanity-cilent";

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

  // Get dynamic image URL, fallback to home.png
  const photographyImage = photography.image
    ? fullImageUrl(photography.image, 1200)
    : "https://ro6it.com/home.png";

  return {
    title: photography.name || "Photograph",
    description:
      photography.description || `${photography.name} - Photography by Rohit Patnala.`,
    keywords: [photography.name, "Rohit Patnala photography", "visual art", "RO6IT photos", "Houston photographer", "creative photography"],
    openGraph: {
      title: `${photography.name} | Rohit Patnala`,
      description: photography.description || `${photography.name} - Photography by Rohit Patnala.`,
      url: `https://ro6it.com/photography/${photo}`,
      siteName: "Rohit Patnala",
      images: [
        {
          url: photographyImage,
          width: 1200,
          height: 630,
          alt: `${photography.name} - Photography by Rohit Patnala`,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${photography.name} | Rohit Patnala`,
      description: photography.description || `${photography.name} - Photography by Rohit Patnala (RO6IT).`,
      images: [photographyImage],
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
