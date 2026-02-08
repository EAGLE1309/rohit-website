import type { Metadata } from "next";
import ArcLabels from "@/components/arc-label";
import { HoverGif } from "@/components/hover-gif";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

export const metadata: Metadata = {
  title: "Rohit Patnala | Visual Artist, DJ & Creative Director — Houston",
  description:
    "Portfolio of Rohit Patnala (RO6IT) — a multidisciplinary visual artist, DJ, and creative director, based in Houston, Texas. Explore visual art, photography, music, graphic design, and creative direction.",
  keywords: [
    "Rohit Patnala portfolio",
    "visual artist Houston",
    "creative director Texas",
    "RO6IT",
    "multidisciplinary artist",
    "Houston DJ",
    "South Asian diaspora artist",
    "photography portfolio",
  ],
  openGraph: {
    title: "Rohit Patnala | Visual Artist, DJ & Creative Director",
    description:
      "Portfolio of Rohit Patnala (RO6IT) — multidisciplinary visual artist, DJ, and creative director based in Houston, Texas.",
    url: "https://ro6it.com",
    siteName: "Rohit Patnala",
    images: [
      {
        url: "https://ro6it.com/home.png",
        width: 1200,
        height: 630,
        alt: "Rohit Patnala — Visual Artist, DJ & Creative Director",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rohit Patnala | Visual Artist, DJ & Creative Director",
    description:
      "Portfolio of Rohit Patnala (RO6IT) — multidisciplinary visual artist, DJ, and creative director based in Houston, Texas.",
    images: ["https://ro6it.com/home.png"],
  },
  alternates: {
    canonical: "https://ro6it.com",
  },
};

const Home = () => {
  return (
    <MaxWidthWrapper className="overflow-hidden h-[90vh] md:h-[100vh] relative flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <p className="text-sm md:text-lg font-medium uppercase">[Rohit Patnala]</p>
        <div className="flex justify-center items-center">
          <h1 className="md:text-[250px] text-7xl leading-0 font-medium uppercase">RO</h1>
          <HoverGif staticSrc="/home.png" gifSrc="/home.gif" className="w-[80px] h-[60px] md:w-[230px] md:h-[200px] object-cover" alt="" />
          <h1 className="md:text-[250px] text-7xl leading-0 font-medium uppercase">6IT</h1>
        </div>
        <p className="text-sm md:text-lg whitespace-nowrap max text-center font-medium uppercase">
          *multidisciplinary visual artist <br /> *creative director
        </p>
      </div>
      <div className="absolute flex flex-col bottom-12 md:bottom-1">
        <ArcLabels
          liveClock
          useWeekdayLabels
          autoRotateTodayToTop
          twelveHour
          showSeconds
          rx={100}
          ry={60}
          labels={["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]}
          centerText="12:45AM"
        />
      </div>
    </MaxWidthWrapper>
  );
};

export default Home;
