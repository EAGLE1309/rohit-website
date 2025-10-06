"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

type CharacterSet = string[] | readonly string[];

interface HyperTextProps extends MotionProps {
  /** The text content to be animated */
  children: string;
  /** Optional className for styling */
  className?: string;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Component to render as - defaults to div */
  as?: React.ElementType;
  /** Whether to trigger animation on hover */
  animateOnHover?: boolean;
  /** Whether to play hover animation only once */
  playOnce?: boolean;
  /** Whether to trigger animation on parent group hover */
  triggerOnGroupHover?: boolean;
  /** Custom character set for scramble effect. Defaults to uppercase alphabet */
  characterSet?: CharacterSet;
}

const DEFAULT_CHARACTER_SET = Object.freeze("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")) as readonly string[];

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

export function HyperText({
  children,
  className,
  duration = 800,
  delay = 0,
  as: Component = "div",
  animateOnHover = true,
  playOnce = false,
  triggerOnGroupHover = false,
  characterSet = DEFAULT_CHARACTER_SET,
  ...props
}: HyperTextProps) {
  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayText, setDisplayText] = useState<string[]>(() => children.split(""));
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGroupHovered, setIsGroupHovered] = useState(false);
  const iterationCount = useRef(0);
  const elementRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      // If playOnce is true and animation has already played, don't animate again
      if (playOnce && hasAnimated.current) {
        return;
      }
      iterationCount.current = 0;
      setIsAnimating(true);
    }
  };

  // Handle group hover animation
  useEffect(() => {
    if (!triggerOnGroupHover) return;

    const handleGroupHover = () => {
      if (!isGroupHovered && !isAnimating) {
        // If playOnce is true and animation has already played, don't animate again
        if (playOnce && hasAnimated.current) {
          return;
        }
        setIsGroupHovered(true);
        iterationCount.current = 0;
        setIsAnimating(true);
      }
    };

    const handleGroupLeave = () => {
      setIsGroupHovered(false);
    };

    const parentElement = elementRef.current?.closest(".group");
    if (parentElement) {
      parentElement.addEventListener("mouseenter", handleGroupHover);
      parentElement.addEventListener("mouseleave", handleGroupLeave);

      return () => {
        parentElement.removeEventListener("mouseenter", handleGroupHover);
        parentElement.removeEventListener("mouseleave", handleGroupLeave);
      };
    }
  }, [triggerOnGroupHover, isAnimating, isGroupHovered, playOnce]);

  // Handle scramble animation
  useEffect(() => {
    if (!isAnimating) return;

    const maxIterations = children.length;
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      iterationCount.current = progress * maxIterations;

      setDisplayText((currentText) =>
        currentText.map((letter, index) =>
          letter === " " ? letter : index <= iterationCount.current ? children[index] : characterSet[getRandomInt(characterSet.length)]
        )
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        hasAnimated.current = true;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [children, duration, isAnimating, characterSet]);

  return (
    <MotionComponent ref={elementRef} className={cn("overflow-hidden py-2 text-4xl", className)} onMouseEnter={handleAnimationTrigger} {...props}>
      <AnimatePresence>
        {displayText.map((letter, index) => (
          <motion.span key={index} className={cn("", letter === " " ? "w-3" : "")}>
            {letter.toUpperCase()}
          </motion.span>
        ))}
      </AnimatePresence>
    </MotionComponent>
  );
}
