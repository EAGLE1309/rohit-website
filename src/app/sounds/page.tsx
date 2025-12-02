import type { Metadata } from "next";
import SoundsComponent from "./component";
import { getMusics } from "@/lib/dashboard/queries/musics";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { getFlyers } from "@/lib/dashboard/queries/flyers";
import { getPhotography } from "@/lib/dashboard/queries/photography";
import { Suspense } from "react";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

export const metadata: Metadata = {
  title: "Sounds & Music",
  description:
    "Listen to DJ mixes, music productions, and soundscapes by Rohit Patnala. Explore flyers, event visuals, and the sonic side of RO6IT's creative practice.",
  keywords: ["Rohit Patnala music", "DJ mixes", "RO6IT sounds", "Houston DJ", "music production", "event flyers", "soundcloud"],
  openGraph: {
    title: "Sounds & Music | Rohit Patnala",
    description: "Listen to DJ mixes, music productions, and soundscapes by Rohit Patnala. Explore the sonic side of RO6IT's creative practice.",
    url: "https://rohit.solithix.com/sounds",
  },
  alternates: {
    canonical: "https://rohit.solithix.com/sounds",
  },
};

const SoundsPage = async () => {
  const musics = await getMusics();
  const flyers = await getFlyers();
  const photographs = await getPhotography();

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
      <SoundsComponent tracks={TRACKS} flyers={flyers} photographs={photographs} />;
    </Suspense>
  );
};

export default SoundsPage;
