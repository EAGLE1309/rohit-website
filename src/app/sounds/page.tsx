import dynamic from "next/dynamic";
import { getMusics } from "@/lib/dashboard/queries/musics";
import { getFlyers } from "@/lib/dashboard/queries/flyers";
import { getPhotography } from "@/lib/dashboard/queries/photography";

const SoundsComponent = dynamic(() => import("./component"));

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

  return <SoundsComponent tracks={TRACKS} flyers={flyers} photographs={photographs} />;
};

export default SoundsPage;
