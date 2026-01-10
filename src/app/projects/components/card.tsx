import React from "react";

const ProjectsCard = ({
  id,
  image,
  title,
  subtitle,
  className,
  isLast,
  onSelect,
  isSelected,
}: {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  className?: string;
  isLast?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}) => {
  return (
    <div
      className={`w-full grid grid-cols-5 gap-1 cursor-pointer transition-all ${isSelected ? "border-[1.5px] border-foreground/45 p-1" : "hover:bg-foreground/5"
        } ${className} ${isLast ? "rounded-b-lg" : ""}`}
      onClick={onSelect}
    >
      <img className="w-full col-span-2 h-[5rem] object-cover bg-foreground/5 border-foreground/45" src={image} alt={""} />
      <p className="w-full text-md font-medium col-span-3">{title}</p>
    </div>
  );
};
export default ProjectsCard;