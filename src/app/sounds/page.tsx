import SoundsComponent from "./component";
import { getMusics } from "@/lib/dashboard/queries/musics";

const SoundsPage = async () => {
  const musics = await getMusics();

  const TRACKS = musics.map((music: any, index: number) => ({
    id: index,
    title: music.title,
    artist: "Rohit Patnala",
    src: `/api/proxy-audio?url=${encodeURIComponent(music.trackUrl)}`,
    thumb: music.coverUrl,
  }));

  console.log(TRACKS);

  return <SoundsComponent TRACKS={TRACKS} />;
};

export default SoundsPage;
