"use client";

import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitGraph } from "@/components/graph/GitGraph";
import { Terminal } from "@/components/terminal/Terminal";
import { ChallengePanel } from "@/components/challenge/ChallengePanel";
import { InteractiveRebaseModal } from "@/components/rebase/InteractiveRebaseModal";
import { LevelCompleteModal } from "@/components/challenge/LevelCompleteModal";
import { useRepository } from "@/hooks/useRepository";
import { useTerminal } from "@/hooks/useTerminal";
import { useLevel } from "@/hooks/useLevel";
import type { Commit, RebaseEntry } from "@/lib/git-engine/types";
import { getLevel, levels } from "@/lib/levels";

export default function Home() {
  const {
    currentLevel,
    currentLevelId,
    showHint,
    hintIndex,
    showSolution,
    validationResults,
    isCompleted,
    validate,
    nextHint,
    toggleSolution,
    goToLevel,
    resetLevel,
  } = useLevel(1);

  const { snapshot, runCommand, executeInteractiveRebase, reset, getRepo } =
    useRepository(currentLevel?.initialState);

  const {
    lines,
    addInputLine,
    addResultLine,
    addSystemLine,
    clear,
    getPreviousCommand,
    getNextCommand,
  } = useTerminal();

  // Interactive rebase state
  const [rebaseModalOpen, setRebaseModalOpen] = useState(false);
  const [rebaseOnto, setRebaseOnto] = useState("");
  const [rebaseCommits, setRebaseCommits] = useState<Commit[]>([]);

  const handleCommand = useCallback(
    (input: string) => {
      addInputLine(input);

      // Handle clear command
      if (input.trim() === "clear") {
        clear();
        return;
      }

      const result = runCommand(input);

      // Check for interactive rebase marker
      if (result.message.startsWith("__INTERACTIVE_REBASE__:")) {
        const onto = result.message.split(":")[1];
        setRebaseOnto(onto);

        // Get commits to show in modal
        const repo = getRepo();
        if (repo) {
          const headId = repo.getHeadCommitId();
          const ontoBranch = repo.getBranch(onto);
          const ontoId = ontoBranch ? ontoBranch.tip : onto;

          // Find commits between onto and HEAD
          const allCommits = repo.getAllCommits();
          const commitMap = new Map(allCommits.map((c) => [c.id, c]));

          // Walk from HEAD backwards to find commits not reachable from onto
          const ontoAncestors = new Set<string>();
          const queue = [ontoId];
          while (queue.length > 0) {
            const id = queue.shift()!;
            if (ontoAncestors.has(id)) continue;
            ontoAncestors.add(id);
            const commit = commitMap.get(id);
            if (commit) queue.push(...commit.parents);
          }

          const commitsToRebase: Commit[] = [];
          const walkQueue = [headId];
          const visited = new Set<string>();
          while (walkQueue.length > 0) {
            const id = walkQueue.shift()!;
            if (visited.has(id) || ontoAncestors.has(id)) continue;
            visited.add(id);
            const commit = commitMap.get(id);
            if (commit) {
              commitsToRebase.push(commit);
              walkQueue.push(...commit.parents);
            }
          }

          // Reverse for chronological order
          commitsToRebase.reverse();
          setRebaseCommits(commitsToRebase);
          setRebaseModalOpen(true);
          addSystemLine(
            "Rebase interativo iniciado. Configure seus commits no modal..."
          );
        }
        return;
      }

      addResultLine(result);
    },
    [addInputLine, addResultLine, addSystemLine, runCommand, getRepo, clear]
  );

  const handleInteractiveRebaseConfirm = useCallback(
    (entries: RebaseEntry[]) => {
      const result = executeInteractiveRebase(rebaseOnto, entries);
      addResultLine(result);
      setRebaseModalOpen(false);
      setRebaseCommits([]);
    },
    [executeInteractiveRebase, rebaseOnto, addResultLine]
  );

  const handleInteractiveRebaseCancel = useCallback(() => {
    setRebaseModalOpen(false);
    setRebaseCommits([]);
    addSystemLine("Rebase interativo cancelado.");
  }, [addSystemLine]);

  const handleReset = useCallback(() => {
    if (currentLevel) {
      reset(currentLevel.initialState);
      resetLevel();
      clear();
      addSystemLine(`Nível ${currentLevel.id} reiniciado. Boa sorte! 🚀`);
    }
  }, [currentLevel, reset, resetLevel, clear, addSystemLine]);

  const handleValidate = useCallback(() => {
    const repo = getRepo();
    if (repo) {
      const passed = validate(repo);
      if (passed) {
        addSystemLine("🎉 Todos os objetivos completados! Nível concluído!");
      } else {
        addSystemLine("❌ Alguns objetivos ainda não foram atingidos. Continue tentando!");
      }
    }
  }, [getRepo, validate, addSystemLine]);

  const handleGoToLevel = useCallback(
    (id: number) => {
      goToLevel(id);
      const lvl = getLevel(id);
      if (lvl) {
        reset(lvl.initialState);
        clear();
        addSystemLine(
          `Nível ${id}: ${lvl.titlePt}. Digite 'git help' para ver os comandos.`
        );
      }
    },
    [goToLevel, reset, clear, addSystemLine]
  );

  if (!currentLevel) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Carregando...
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header
        className="shrink-0 px-6 py-3 border-b border-white/5 glass"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between max-w-[1920px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              G
            </motion.div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                Simulador de Git Rebase
              </h1>
              <p className="text-[10px] text-gray-500">
                Aprenda git rebase visualmente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono">
                ↑↓
              </kbd>
              <span>histórico</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono ml-2">
                Enter
              </kbd>
              <span>executar</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Challenge Panel */}
        <motion.div
          className="w-80 shrink-0 p-3 overflow-hidden flex flex-col"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ChallengePanel
            level={currentLevel}
            currentLevelId={currentLevelId}
            showHint={showHint}
            hintIndex={hintIndex}
            showSolution={showSolution}
            validationResults={validationResults}
            isCompleted={isCompleted}
            onNextHint={nextHint}
            onToggleSolution={toggleSolution}
            onReset={handleReset}
            onValidate={handleValidate}
            onGoToLevel={handleGoToLevel}
          />
        </motion.div>

        {/* Center: Git Graph */}
        <motion.div
          className="flex-1 p-3 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            className="h-full rounded-xl border border-white/5 overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(13,14,28,0.95) 0%, rgba(10,11,22,0.98) 100%)",
            }}
          >
            <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">
                grafo-de-commits
              </span>
              <div className="flex items-center gap-2 text-[10px] text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  main
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  feature
                </span>
              </div>
            </div>
            <div className="h-[calc(100%-40px)]">
              <GitGraph snapshot={snapshot} />
            </div>
          </div>
        </motion.div>

        {/* Right: Terminal */}
        <motion.div
          className="w-96 shrink-0 p-3 overflow-hidden"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Terminal
            lines={lines}
            onCommand={handleCommand}
            getPreviousCommand={getPreviousCommand}
            getNextCommand={getNextCommand}
          />
        </motion.div>
      </div>

      {/* Interactive Rebase Modal */}
      <InteractiveRebaseModal
        isOpen={rebaseModalOpen}
        commits={rebaseCommits}
        onConfirm={handleInteractiveRebaseConfirm}
        onCancel={handleInteractiveRebaseCancel}
      />

      {/* Level Complete Modal */}
      <LevelCompleteModal
        isOpen={isCompleted}
        currentLevelId={currentLevelId}
        totalLevels={levels.length}
        onNextLevel={() => handleGoToLevel(currentLevelId + 1)}
        onReset={handleReset}
      />
    </main>
  );
}
