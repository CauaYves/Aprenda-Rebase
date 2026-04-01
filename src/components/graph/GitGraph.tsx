"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommitNode } from "./CommitNode";
import { BranchLine } from "./BranchLine";
import { RebaseAnimationOverlay } from "./RebaseAnimationOverlay";
import type { RebaseAnimation } from "./RebaseAnimationOverlay";
import type { RepositorySnapshot } from "@/hooks/useRepository";

// Color palette for branches
const BRANCH_COLORS: Record<string, string> = {
  develop: "#2dd4bf", // Cyan
  "user/jhon/1243-integracao": "#a78bfa",   // Purple
  "user/eu/15844-fix-autenticacao/17400-correcao-token": "#f472b6", // Pink
  "user/eu/16001-epic-payment/18002-adicionar-stripe": "#c084fc", // Lavender
  "user/eu/16200-refatoracao-ui/18500-atualizar-botoes": "#fbbf24", // Yellow
  "user/eu/16500-otimizacao/19001-a": "#fb923c", // Orange
  "user/eu/16500-otimizacao/19002-b": "#34d399",  // Green
  hotfix: "#ef4444",     // Red
  release: "#facc15",    // Yellow
};

const DEFAULT_COLORS = [
  "#a78bfa", "#fb923c", "#34d399", "#f472b6",
  "#facc15", "#ef4444", "#60a5fa", "#c084fc",
];

function getBranchColor(name: string): string {
  if (BRANCH_COLORS[name]) return BRANCH_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

type CommitData = {
  id: string;
  message: string;
  parents: string[];
  timestamp: number;
  branch?: string;
  copiedFrom?: string;
};

type LayoutNode = {
  id: string;
  x: number;
  y: number;
  commit: CommitData;
  column: number;
  branchLabels: string[];
};

type LayoutEdge = {
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  key: string;
};

type GitGraphProps = {
  snapshot: RepositorySnapshot;
  onStepAnimationComplete?: () => void;
};

export function GitGraph({ snapshot, onStepAnimationComplete }: GitGraphProps) {
  const prevSnapshotRef = useRef<RepositorySnapshot | null>(null);
  const [animationQueue, setAnimationQueue] = useState<RebaseAnimation[]>([]);
  const [fadingCommitIds, setFadingCommitIds] = useState<Set<string>>(new Set());

  const layout = useMemo(() => {
    const commits = snapshot.commits;
    const branches = snapshot.branches;
    const head = snapshot.head;

    if (commits.length === 0) {
      return { nodes: [] as LayoutNode[], edges: [] as LayoutEdge[], width: 200, height: 200 };
    }

    const commitMap = new Map(commits.map((c) => [c.id, c]));

    const branchNames = [...new Set(commits.map((c) => c.branch).filter(Boolean) as string[])];
    branchNames.sort((a, b) => {
      if (a === "develop" || a === "master") return -1;
      if (b === "develop" || b === "master") return 1;
      return a.localeCompare(b);
    });

    const branchColumnMap = new Map<string, number>();
    branchNames.forEach((name, i) => branchColumnMap.set(name, i));

    const visited = new Set<string>();
    const topoOrder: string[] = [];

    function dfs(id: string) {
      if (visited.has(id)) return;
      visited.add(id);
      const commit = commitMap.get(id);
      if (!commit) return;
      for (const parentId of commit.parents) {
        dfs(parentId);
      }
      topoOrder.push(id);
    }

    for (const branch of branches) {
      dfs(branch.tip);
    }
    for (const commit of commits) {
      dfs(commit.id);
    }

    const colSpacing = 280;
    const rowSpacing = 130;
    const paddingX = 100;
    const paddingY = 90;

    const branchTipMap = new Map<string, string[]>();
    for (const branch of branches) {
      if (!branchTipMap.has(branch.tip)) {
        branchTipMap.set(branch.tip, []);
      }
      branchTipMap.get(branch.tip)!.push(branch.name);
    }

    const nodes: LayoutNode[] = [];
    const positions = new Map<string, { x: number; y: number }>();

    topoOrder.forEach((id, rowIndex) => {
      const commit = commitMap.get(id)!;
      const column = commit.branch ? (branchColumnMap.get(commit.branch) ?? 0) : 0;
      const x = paddingX + column * colSpacing;
      const y = paddingY + rowIndex * rowSpacing;

      positions.set(id, { x, y });

      nodes.push({
        id,
        x,
        y,
        commit,
        column,
        branchLabels: branchTipMap.get(id) ?? [],
      });
    });

    const edges: LayoutEdge[] = [];
    for (const commit of commits) {
      const toPos = positions.get(commit.id);
      if (!toPos) continue;

      for (const parentId of commit.parents) {
        const fromPos = positions.get(parentId);
        if (!fromPos) continue;

        const parentCommit = commitMap.get(parentId);
        const color = getBranchColor(commit.branch || parentCommit?.branch || "develop");

        edges.push({
          fromId: parentId,
          toId: commit.id,
          fromX: fromPos.x,
          fromY: fromPos.y,
          toX: toPos.x,
          toY: toPos.y,
          color,
          key: `${parentId}-${commit.id}`,
        });
      }
    }

    const maxCol = Math.max(...nodes.map((n) => n.column), 0);
    const width = Math.max(paddingX * 2 + maxCol * colSpacing + 60, 300);
    const height = Math.max(paddingY * 2 + (topoOrder.length - 1) * rowSpacing + 60, 200);

    return { nodes, edges, width, height, positions };
  }, [snapshot]);

  // Detect new commits with copiedFrom and generate animation queue
  useEffect(() => {
    const prev = prevSnapshotRef.current;
    prevSnapshotRef.current = snapshot;

    if (!prev) return;

    // Find new commits in this snapshot that have copiedFrom
    const prevIds = new Set(prev.commits.map((c) => c.id));
    const newCopiedCommits = snapshot.commits.filter(
      (c) => !prevIds.has(c.id) && c.copiedFrom
    );

    if (newCopiedCommits.length === 0) {
      // No new rebased commits — just signal done immediately
      onStepAnimationComplete?.();
      return;
    }

    // Build prev layout positions for origin lookup
    const prevCommitMap = new Map(prev.commits.map((c) => [c.id, c]));
    const prevBranchNames = [...new Set(prev.commits.map((c) => c.branch).filter(Boolean) as string[])];
    prevBranchNames.sort((a, b) => {
      if (a === "develop" || a === "master") return -1;
      if (b === "develop" || b === "master") return 1;
      return a.localeCompare(b);
    });
    const prevBranchColumnMap = new Map<string, number>();
    prevBranchNames.forEach((name, i) => prevBranchColumnMap.set(name, i));

    const prevVisited = new Set<string>();
    const prevTopo: string[] = [];
    function prevDfs(id: string) {
      if (prevVisited.has(id)) return;
      prevVisited.add(id);
      const c = prevCommitMap.get(id);
      if (!c) return;
      for (const pid of c.parents) prevDfs(pid);
      prevTopo.push(id);
    }
    for (const b of prev.branches) prevDfs(b.tip);
    for (const c of prev.commits) prevDfs(c.id);

    const colSpacing = 280;
    const rowSpacing = 130;
    const paddingX = 100;
    const paddingY = 90;

    const prevPositions = new Map<string, { x: number; y: number }>();
    prevTopo.forEach((id, i) => {
      const c = prevCommitMap.get(id);
      if (!c) return;
      const col = c.branch ? (prevBranchColumnMap.get(c.branch) ?? 0) : 0;
      prevPositions.set(id, {
        x: paddingX + col * colSpacing,
        y: paddingY + i * rowSpacing,
      });
    });

    // Build animation queue
    const queue: RebaseAnimation[] = [];
    const fadingIds = new Set<string>();

    for (const newCommit of newCopiedCommits) {
      const originId = newCommit.copiedFrom!;
      const originPos = prevPositions.get(originId);
      const destPos = layout.positions?.get(newCommit.id);

      if (!originPos || !destPos) continue;

      fadingIds.add(originId);

      queue.push({
        commitId: originId,
        newCommitId: newCommit.id,
        fromX: originPos.x,
        fromY: originPos.y,
        toX: destPos.x,
        toY: destPos.y,
        message: newCommit.message,
        color: getBranchColor(newCommit.branch || "develop"),
        duration: 700,
      });
    }

    if (queue.length > 0) {
      setFadingCommitIds(fadingIds);
      setAnimationQueue(queue);
    } else {
      onStepAnimationComplete?.();
    }
  }, [snapshot]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOverlayComplete = useCallback(() => {
    setAnimationQueue([]);
    setFadingCommitIds(new Set());
    onStepAnimationComplete?.();
  }, [onStepAnimationComplete]);

  const headCommitId = useMemo(() => {
    const head = snapshot.head;
    if (head.type === "branch") {
      return snapshot.branches.find((b) => b.name === head.name)?.tip;
    }
    return head.commitId;
  }, [snapshot]);

  const headBranchName = snapshot.head.type === "branch" ? (snapshot.head as { type: "branch"; name: string }).name : undefined;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar">
      <motion.svg
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="max-w-full max-h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Grid background pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--grid-color, rgba(255,255,255,0.03))"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Draw edges first (behind nodes) */}
        <AnimatePresence>
          {layout.edges.map((edge) => (
            <BranchLine
              key={edge.key}
              x1={edge.fromX}
              y1={edge.fromY}
              x2={edge.toX}
              y2={edge.toY}
              color={edge.color}
            />
          ))}
        </AnimatePresence>

        {/* Draw nodes */}
        <AnimatePresence>
          {layout.nodes.map((node) => (
            <CommitNode
              key={node.id}
              x={node.x}
              y={node.y}
              id={node.id}
              message={node.commit.message}
              isHead={node.id === headCommitId}
              branchColor={getBranchColor(node.commit.branch || "develop")}
              branchLabels={node.branchLabels}
              headBranchName={headBranchName}
              isFading={fadingCommitIds.has(node.id)}
            />
          ))}
        </AnimatePresence>

        {/* Ghost node animation overlay */}
        <RebaseAnimationOverlay
          queue={animationQueue}
          onAnimationComplete={handleOverlayComplete}
        />
      </motion.svg>
    </div>
  );
}
