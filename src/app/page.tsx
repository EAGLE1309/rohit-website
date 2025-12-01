import type { Metadata } from "next";
import ArcLabels from "@/components/arc-label";
import { HoverGif } from "@/components/hover-gif";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

export const metadata: Metadata = {
  title: "Rohit Patnala | Visual Artist & Creative Director",
  description:
    "Welcome to the portfolio of Rohit Patnala - a multidisciplinary visual artist, DJ, and creative director based in Houston, Texas. Explore creative works, photography, and music.",
  keywords: ["Rohit Patnala portfolio", "visual artist Houston", "creative director Texas", "RO6IT", "multidisciplinary artist"],
  openGraph: {
    title: "Rohit Patnala | Visual Artist & Creative Director",
    description: "Welcome to the portfolio of Rohit Patnala - a multidisciplinary visual artist, DJ, and creative director based in Houston, Texas.",
    url: "https://rohit.solithix.com",
  },
  alternates: {
    canonical: "https://rohit.solithix.com",
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
