import type { Metadata } from "next";
import SoundsComponent from "./component";
import { getMusics } from "@/lib/dashboard/queries/musics";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { getFlyers } from "@/lib/dashboard/queries/flyers";
import { getPhotography } from "@/lib/dashboard/queries/photography";
import { Suspense } from "react";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { getGallery } from "@/lib/dashboard/queries/gallery";

export const metadata: Metadata = {
  title: "Sounds & Music",
  description:
    "Listen to DJ mixes, music productions, and soundscapes by Rohit Patnala. Explore flyers, event visuals, and the sonic side of RO6IT's creative practice.",
  keywords: ["Rohit Patnala music", "DJ mixes", "RO6IT sounds", "Houston DJ", "music production", "event flyers", "soundcloud"],
  openGraph: {
    title: "Sounds & Music | Rohit Patnala",
    description: "Listen to DJ mixes, music productions, and soundscapes by Rohit Patnala. Explore the sonic side of RO6IT's creative practice.",
    url: "https://ro6it.com/sounds",
    siteName: "Rohit Patnala",
    images: [
      {
        url: "https://ro6it.com/home.png",
        width: 1200,
        height: 630,
        alt: "RO6IT Sounds & Music showcase",
      },
    ],
  },
  alternates: {
    canonical: "https://ro6it.com/sounds",
  },
};

const SoundsPage = async () => {
  const musics = await getMusics();
  const flyers = await getFlyers();
  const gallery = await getGallery();

  const TRACKS = musics.map((music: any, index: number) => ({
    id: index,
    title: music.title,
    artist: "Rohit Patnala",
    src: `/api/proxy-audio?url=${encodeURIComponent(music.trackUrl)}`,
    // Optimize cover images - 200px WebP at 70% quality
    thumb: music.cover ? thumbnailUrl(music.cover, "sm") : "/home.png",
  }));

  return (
    <Suspense
      fallback={<MaxWidthWrapper className="h-[100vh] w-full overflow-hidden flex items-center justify-center gap-3">Loading...</MaxWidthWrapper>}
    >
      <SoundsComponent tracks={TRACKS} flyers={flyers} gallery={gallery} />;
    </Suspense>
  );
};

export default SoundsPage;
