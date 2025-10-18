"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

function Slider({
  className,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  icons,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { icons: React.ReactNode[] }) {
  // internal state for controlled slider
  const [value, setValue] = React.useState<number[]>(defaultValue || [min]);

  const handleChange = (newValue: number[]) => {
    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  const { theme } = useTheme();

  return (
    <SliderPrimitive.Root
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={handleChange}
      className={cn("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Track className={`relative grow overflow-hidden rounded-full h-8 ${theme === "dark" ? "bg-white/5" : "bg-black/5"}`}>
        <SliderPrimitive.Range className="bg-black/15 absolute h-8" />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb
        className={`pointer-events-none transition-transform duration-100 bg-background size-[33px] flex items-center justify-center shrink-0 rounded-full focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 ${
          theme === "dark" ? "bg-white/15" : ""
        }`}
      >
        {icons[value[0]]}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
}

export { Slider };
