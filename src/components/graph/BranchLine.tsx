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
  const dy = y2 - y1;
  const dx = Math.abs(x2 - x1);
  const isDifferentColumn = dx >= 5;
  // Use a fixed max shift height to clear the column fast (usually around rowSpacing)
  const shiftY = Math.min(Math.abs(dy), 130);
  const signY = dy > 0 ? 1 : -1;

  let path;
  if (!isDifferentColumn) {
    path = `M ${x1} ${y1} L ${x2} ${y2}`;
  } else {
    // Curve into the target column within the first 'shiftY' pixels
    const endCurveY = y1 + shiftY * signY;
    path = `M ${x1} ${y1} C ${x1} ${y1 + shiftY * 0.45 * signY}, ${x2} ${y1 + shiftY * 0.55 * signY}, ${x2} ${endCurveY}`;
    // If there is still distance to travel vertically, draw a straight line
    if (Math.abs(dy) > shiftY + 1) {
      path += ` L ${x2} ${y2}`;
    }
  }

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
