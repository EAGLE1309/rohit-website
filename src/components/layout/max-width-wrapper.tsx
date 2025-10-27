import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const MaxWidthWrapper = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={cn("h-full mx-auto max-w-screen-xl px-[16px] xl:px-0 lg:px-3 md:px-3.5", className)}>{children}</div>;
};

export default MaxWidthWrapper;
