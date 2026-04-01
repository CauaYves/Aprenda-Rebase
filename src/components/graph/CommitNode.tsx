"use client";

import { motion } from "framer-motion";

type CommitNodeProps = {
  x: number;
  y: number;
  id: string;
  message: string;
  isHead: boolean;
  branchColor: string;
  branchLabels?: string[];
  headBranchName?: string;
  originX?: number;
  originY?: number;
};

export function CommitNode({
  x,
  y,
  id,
  message,
  isHead,
  branchColor,
  branchLabels = [],
  headBranchName,
  originX,
  originY,
}: CommitNodeProps) {
  const radius = isHead ? 18 : 14;

  const hasOrigin = originX !== undefined && originY !== undefined;
  
  const initialProps = hasOrigin
    ? {
        scale: 1,
        opacity: 0,
        x: originX,
        y: originY,
        zIndex: 50,
      }
    : { scale: 0, opacity: 0, x, y };

  return (
    <motion.g
      initial={initialProps}
      animate={{ scale: 1, opacity: 1, x, y }}
      transition={{
        type: "spring",
        stiffness: hasOrigin ? 80 : 200,
        damping: hasOrigin ? 12 : 20,
        mass: hasOrigin ? 1.5 : 1,
        delay: hasOrigin ? 0.3 : 0,
      }}
    >
      {/* Glow effect for HEAD */}
      {isHead && (
        <motion.circle
          r={radius + 8}
          fill="none"
          stroke={branchColor}
          strokeWidth={2}
          opacity={0.3}
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Outer ring */}
      <motion.circle
        r={radius + 3}
        fill={isHead ? branchColor : "transparent"}
        opacity={isHead ? 0.15 : 0}
        transition={{ duration: 0.3 }}
      />

      {/* Main circle */}
      <motion.circle
        r={radius}
        fill={`color-mix(in oklch, ${branchColor} 20%, var(--commit-bg, #1a1b2e))`}
        stroke={branchColor}
        strokeWidth={isHead ? 3 : 2}
        whileHover={{ scale: 1.15, strokeWidth: 3 }}
        transition={{ duration: 0.2 }}
        style={{ cursor: "pointer" }}
      />

      {/* Inner dot */}
      <circle r={4} fill={branchColor} opacity={0.8} />

      {/* Commit hash */}
      <text
        x={radius + 12}
        y={-2}
        textAnchor="start"
        fill="var(--text-secondary, #8b8fa3)"
        fontSize={10}
        fontFamily="var(--font-mono, monospace)"
      >
        {id.slice(0, 7)}
      </text>

      {/* Commit message */}
      <text
        x={radius + 12}
        y={12}
        textAnchor="start"
        fill="var(--text-tertiary, #6b6f83)"
        fontSize={9}
        fontFamily="var(--font-sans, sans-serif)"
      >
        {message.length > 20 ? message.slice(0, 18) + "…" : message}
      </text>

      {/* Branch labels */}
      {branchLabels.map((label, i) => {
        const isHeadBranch = label === headBranchName;
        const maxDisplayLength = 35;
        const truncatedLabel = label.length > maxDisplayLength ? label.slice(0, maxDisplayLength - 3) + "..." : label;
        const displayText = isHeadBranch ? `HEAD → ${truncatedLabel}` : truncatedLabel;
        const width = displayText.length * 6 + 16;
        
        return (
          <g key={label} transform={`translate(0, ${-(radius + 14 + i * 22)})`}>
            <motion.rect
              x={-width / 2}
              y={-10}
              width={width}
              height={20}
              rx={10}
              fill={isHeadBranch ? branchColor : `color-mix(in oklch, ${branchColor} 15%, transparent)`}
              stroke={branchColor}
              strokeWidth={1}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            />
            <text
              textAnchor="middle"
              y={4}
              fill={isHeadBranch ? "#fff" : branchColor}
              fontSize={10}
              fontWeight={isHeadBranch ? 700 : 500}
              fontFamily="var(--font-mono, monospace)"
            >
              {displayText}
            </text>
          </g>
        );
      })}
    </motion.g>
  );
}
