"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type RebaseAnimation = {
  commitId: string;
  newCommitId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  message: string;
  color: string;
  duration: number;
};

type Props = {
  queue: RebaseAnimation[];
  onAnimationComplete: () => void;
};

function bezierMidpoint(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) {
  // Control points that create a nice arc
  // Shift horizontally away from the midpoint to create a visible curve
  const midY = (fromY + toY) / 2;
  const dx = toX - fromX;
  const offsetX = Math.abs(dx) < 10 ? 80 : dx * 0.3;

  const cp1x = fromX + offsetX;
  const cp1y = fromY + (midY - fromY) * 0.4;
  const cp2x = toX + offsetX * 0.5;
  const cp2y = toY - (toY - midY) * 0.4;

  return { cp1x, cp1y, cp2x, cp2y };
}

function buildBezierPath(anim: RebaseAnimation): string {
  const { cp1x, cp1y, cp2x, cp2y } = bezierMidpoint(
    anim.fromX,
    anim.fromY,
    anim.toX,
    anim.toY
  );
  return `M ${anim.fromX} ${anim.fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${anim.toX} ${anim.toY}`;
}

// Sample points along a cubic bezier for keyframe animation
function sampleBezier(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  steps: number
): { x: number[]; y: number[] } {
  const { cp1x, cp1y, cp2x, cp2y } = bezierMidpoint(fromX, fromY, toX, toY);
  const xs: number[] = [];
  const ys: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x =
      u * u * u * fromX +
      3 * u * u * t * cp1x +
      3 * u * t * t * cp2x +
      t * t * t * toX;
    const y =
      u * u * u * fromY +
      3 * u * u * t * cp1y +
      3 * u * t * t * cp2y +
      t * t * t * toY;
    xs.push(x);
    ys.push(y);
  }
  return { x: xs, y: ys };
}

function GhostNode({
  anim,
  onComplete,
}: {
  anim: RebaseAnimation;
  onComplete: () => void;
}) {
  const SAMPLES = 20;
  const { x: xKeyframes, y: yKeyframes } = sampleBezier(
    anim.fromX,
    anim.fromY,
    anim.toX,
    anim.toY,
    SAMPLES
  );

  // Scale keyframes: start 1, stay 1 during flight, bounce 1.15, settle 1
  const scaleKeyframes = Array(SAMPLES - 1)
    .fill(1)
    .concat([1.15, 1]);

  const opacityKeyframes = [0.3, ...Array(SAMPLES - 1).fill(0.9), 1];

  return (
    <motion.g
      initial={{ x: anim.fromX, y: anim.fromY, scale: 1, opacity: 0 }}
      animate={{
        x: xKeyframes,
        y: yKeyframes,
        scale: scaleKeyframes,
        opacity: opacityKeyframes,
      }}
      transition={{
        duration: anim.duration / 1000,
        ease: "easeInOut",
        times: Array.from(
          { length: SAMPLES + 1 },
          (_, i) => i / SAMPLES
        ),
      }}
      onAnimationComplete={onComplete}
    >
      {/* Ghost glow */}
      <motion.circle
        r={22}
        fill="none"
        stroke={anim.color}
        strokeWidth={2}
        opacity={0.4}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ghost body */}
      <circle
        r={16}
        fill={`color-mix(in oklch, ${anim.color} 30%, #1a1b2e)`}
        stroke={anim.color}
        strokeWidth={2.5}
        strokeDasharray="4 3"
      />

      {/* Inner dot */}
      <circle r={5} fill={anim.color} opacity={0.9} />

      {/* "recriando..." label */}
      <g transform="translate(0, -30)">
        <rect
          x={-72}
          y={-11}
          width={144}
          height={22}
          rx={11}
          fill="rgba(0,0,0,0.75)"
          stroke={anim.color}
          strokeWidth={1}
          opacity={0.9}
        />
        <text
          textAnchor="middle"
          y={4}
          fill={anim.color}
          fontSize={10}
          fontWeight={600}
          fontFamily="var(--font-mono, monospace)"
        >
          recriando {anim.commitId.slice(0, 7)}...
        </text>
      </g>
    </motion.g>
  );
}

export function RebaseAnimationOverlay({ queue, onAnimationComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when queue changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [queue]);

  const handleGhostComplete = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      // Small delay so the final bounce settles visually
      setTimeout(() => {
        onAnimationComplete();
      }, 150);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, queue.length, onAnimationComplete]);

  if (queue.length === 0 || currentIndex >= queue.length) return null;

  const currentAnim = queue[currentIndex];

  return (
    <AnimatePresence mode="wait">
      <GhostNode
        key={`ghost-${currentAnim.commitId}-${currentIndex}`}
        anim={currentAnim}
        onComplete={handleGhostComplete}
      />
    </AnimatePresence>
  );
}
