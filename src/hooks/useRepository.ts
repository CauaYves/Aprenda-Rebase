"use client";

import { useState, useCallback, useRef } from "react";
import { GitRepository, parseCommand, executeCommand } from "@/lib/git-engine";
import type { CommandResult, SerializableRepository } from "@/lib/git-engine";

export type RepositorySnapshot = SerializableRepository;

export function useRepository(initialState?: SerializableRepository) {
  const repoRef = useRef<GitRepository | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [snapshot, setSnapshot] = useState<RepositorySnapshot>(() => {
    const repo = initialState
      ? GitRepository.fromSerializable(initialState)
      : new GitRepository();
    repoRef.current = repo;
    return repo.toSerializable();
  });

  const updateSnapshot = useCallback(() => {
    if (repoRef.current) {
      setSnapshot(repoRef.current.toSerializable());
    }
  }, []);

  const processSteps = useCallback(async (steps: SerializableRepository[]) => {
    setIsAnimating(true);
    for (const step of steps) {
      setSnapshot(step);
      await new Promise((resolve) => setTimeout(resolve, 1200)); // 1.2s delay per rewrite step
    }
    updateSnapshot();
    setIsAnimating(false);
  }, [updateSnapshot]);

  const runCommand = useCallback(
    (input: string): CommandResult => {
      if (!repoRef.current) {
        return { success: false, message: "Repository not initialized", type: "error" };
      }

      const parsed = parseCommand(input);
      if (!parsed) {
        return {
          success: false,
          message: `Unknown command: ${input}\nType 'git help' for available commands.`,
          type: "error",
        };
      }

      // Handle interactive rebase specially - return marker
      if (parsed.type === "rebase-interactive") {
        return {
          success: true,
          message: `__INTERACTIVE_REBASE__:${parsed.onto}`,
          type: "info",
        };
      }

      const result = executeCommand(repoRef.current, parsed);
      
      if (result.steps && result.steps.length > 0) {
        processSteps(result.steps);
      } else {
        updateSnapshot();
      }
      
      return result;
    },
    [updateSnapshot]
  );

  const executeInteractiveRebase = useCallback(
    (onto: string, entries: import("@/lib/git-engine").RebaseEntry[]): CommandResult => {
      if (!repoRef.current) {
        return { success: false, message: "Repository not initialized", type: "error" };
      }
      const result = repoRef.current.rebaseInteractive(onto, entries);
      
      if (result.steps && result.steps.length > 0) {
        processSteps(result.steps);
      } else {
        updateSnapshot();
      }
      
      return result;
    },
    [updateSnapshot]
  );

  const reset = useCallback(
    (state: SerializableRepository) => {
      repoRef.current = GitRepository.fromSerializable(state);
      updateSnapshot();
    },
    [updateSnapshot]
  );

  const getRepo = useCallback(() => repoRef.current, []);

  return {
    snapshot,
    isAnimating,
    runCommand,
    executeInteractiveRebase,
    reset,
    getRepo,
  };
}
