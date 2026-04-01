"use client";

import { motion } from "framer-motion";

type BranchLineProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  isNew?: boolean;
};

export function BranchLine({ x1, y1, x2, y2, color, isNew = false }: BranchLineProps) {
  // Calculate control points for curved lines
  const midY = (y1 + y2) / 2;
  const dx = Math.abs(x2 - x1);
  const curveStrength = Math.min(dx * 0.5, 40);

  const path =
    dx < 5
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} C ${x1} ${midY - curveStrength}, ${x2} ${midY + curveStrength}, ${x2} ${y2}`;

  return (
    <motion.path
      d={path}
      stroke={color}
      strokeWidth={2.5}
      fill="none"
      strokeLinecap="round"
      opacity={0.6}
      initial={isNew ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 0.6 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{
        pathLength: { duration: 0.6, ease: "easeOut" },
        opacity: { duration: 0.3 },
      }}
    />
  );
}
