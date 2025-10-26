"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { type CSSProperties, type ElementType, memo, useMemo } from "react";

export type TextShimmerProps = {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

const ShimmerComponent = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) => {
  const dynamicSpread = useMemo(
    () => (children?.length ?? 0) * spread,
    [children, spread],
  );

  const shimmerProps = {
    animate: { backgroundPosition: "0% center" },
    className: cn(
      "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
      "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
      className,
    ),
    style: {
      "--spread": `${dynamicSpread}px`,
      backgroundImage: "var(--bg),linear-gradient(90deg,#0000,#0000)",
      backgroundSize: "250% 100%,auto",
      backgroundRepeat: "no-repeat,padding-box",
      backgroundPosition: "0% center",
    } as CSSProperties,
    transition: {
      duration,
      ease: "linear" as const,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  };

  // Render the appropriate component based on the 'as' prop
  if (Component === "span") {
    return <motion.span {...shimmerProps}>{children}</motion.span>;
  }
  if (Component === "div") {
    return <motion.div {...shimmerProps}>{children}</motion.div>;
  }
  if (Component === "h1") {
    return <motion.h1 {...shimmerProps}>{children}</motion.h1>;
  }
  if (Component === "h2") {
    return <motion.h2 {...shimmerProps}>{children}</motion.h2>;
  }
  if (Component === "h3") {
    return <motion.h3 {...shimmerProps}>{children}</motion.h3>;
  }

  // Default to p
  return <motion.p {...shimmerProps}>{children}</motion.p>;
};

export const Shimmer = memo(ShimmerComponent);
