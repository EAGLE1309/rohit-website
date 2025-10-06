import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Image from "next/image";
import { ElasticGridWrapper } from "@/components/work/parallax";
import { HyperText } from "@/components/hyper-text";

const filterOptions = [
  {
    label: "All",
    value: "all",
    active: true,
  },
  {
    label: "Highlights",
    value: "visual",
  },
  {
    label: "Music",
    value: "music",
  },
  {
    label: "Photographs",
    value: "performance",
  },
];

const WorkPage = () => {
  return (
    <MaxWidthWrapper className="mt-28 relative">
      <div className="w-full flex items-center justify-center gap-8 pb-16">
        {filterOptions.map((filter, index) => (
          <p
            className={`text-sm uppercase cursor-pointer ${
              filter?.active ? "underline decoration-[2.25px] decoration-red-500 underline-offset-4" : ""
            }`}
            key={index}
          >
            <span className={`${filter.active ? "text-red-500" : ""}`}>[</span>
            {filter.label}
            <span className={`${filter.active ? "text-red-500" : ""}`}>]</span>
          </p>
        ))}
      </div>
      <ElasticGridWrapper
        className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-16"
        baseLag={0.1}
        lagScale={0.15}
        smoothness={0.15}
        dampening={0.85}
        randomOffset={30}
        role="grid"
        aria-label="My elastic grid"
      >
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </ElasticGridWrapper>
    </MaxWidthWrapper>
  );
};

export default WorkPage;

const Card = () => {
  return (
    <div className="w-full group flex flex-col cursor-pointer gap-1">
      <Image
        className="w-full h-full object-cover group-hover:brightness-85 transition-all"
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=270&fit=crop"
        alt="Work 1"
        width={400}
        height={500}
      />
      <HyperText animateOnHover triggerOnGroupHover playOnce className="text-sm">
        Don Toliver For Bape - [December 2024]
      </HyperText>
    </div>
  );
};
