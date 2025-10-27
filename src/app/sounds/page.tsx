import SoundsComponent from "./component";
import { getMusics } from "@/lib/dashboard/queries/musics";
import { getFlyers } from "@/lib/dashboard/queries/flyers";
import { getPhotography } from "@/lib/dashboard/queries/photography";
import { Suspense } from "react";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

const SoundsPage = async () => {
  const musics = await getMusics();
  const flyers = await getFlyers();
  const photographs = await getPhotography();

  console.log(flyers);

  const TRACKS = musics.map((music: any, index: number) => ({
    id: index,
    title: music.title,
    artist: "Rohit Patnala",
    src: `/api/proxy-audio?url=${encodeURIComponent(music.trackUrl)}`,
    thumb: music.coverUrl,
  }));

  console.log(TRACKS);

  return (
    <Suspense
      fallback={<MaxWidthWrapper className="h-[100vh] w-full overflow-hidden flex items-center justify-center gap-3">Loading...</MaxWidthWrapper>}
    >
      <SoundsComponent tracks={TRACKS} flyers={flyers} photographs={photographs} />;
    </Suspense>
  );
};

export default SoundsPage;
