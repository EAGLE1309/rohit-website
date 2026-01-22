import React from "react";

const ProjectsCard = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  image,
  title,
  subtitle,
  service,
  className,
  onSelect,
  isSelected,
}: {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  service: string;
  className?: string;
  onSelect?: () => void;
  isSelected?: boolean;
}) => {
  return (
    <div
      className={`w-full grid grid-cols-5 gap-1 cursor-pointer transition-all ${isSelected ? "border-[1.5px] border-foreground" : "hover:bg-foreground/5"
        } ${className}`}
      onClick={onSelect}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-full col-span-2 h-[5rem] object-cover bg-foreground/5" src={image} alt={""} />
      <div className={"flex flex-col justify-between col-span-3" + (isSelected ? " pb-1" : "")}>
        <p className="w-full text-md font-medium">{title}</p>
        <p className="w-full text-sm font-normal">{subtitle.slice(0, 1).toUpperCase() + subtitle.slice(1)}</p>
        <p className="w-fit text-sm font-medium bg-foreground text-background p-1">{service}</p>
      </div>
    </div>
  );
};
export default ProjectsCard;