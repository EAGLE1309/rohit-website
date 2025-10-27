"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type Props = React.ComponentProps<typeof SliderPrimitive.Root> & {
  icons: React.ReactNode[];
  defaultValue?: number[];
};

function Slider({
  className,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  icons,
  onValueChange,
  value: controlledValue, // capture controlled value if passed
  ...props
}: Props) {
  // If parent passes `value`, act as a controlled component.
  // Otherwise fall back to internal state initialized from defaultValue.
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<number[]>(defaultValue ?? [min]);

  // Sync internal value if defaultValue changes (rare) - optional safety
  React.useEffect(() => {
    if (!isControlled && defaultValue) setInternalValue(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const value = isControlled ? (controlledValue as number[]) : internalValue;

  const handleChange = (newValue: number[]) => {
    if (!isControlled) setInternalValue(newValue);
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
      {...props} // okay to spread remaining props (but value is already set above)
    >
      <SliderPrimitive.Track className={`relative grow overflow-hidden rounded-full h-8 ${theme === "dark" ? "bg-white/5" : "bg-black/5"}`}>
        <SliderPrimitive.Range className="bg-black/15 absolute h-8" />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb
        // removed pointer-events-none so touch interactions work reliably on mobile
        className={`transition-transform duration-100 size-[33px] flex items-center justify-center shrink-0 rounded-full focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 ${
          theme === "dark" ? "bg-white/15" : "bg-foreground text-background"
        }`}
      >
        {/* value[0] is safe because value is always an array here */}
        {icons[value[0]]}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
}

export { Slider };
