"use client";

import { useState, useCallback, useRef } from "react";
import { GitRepository, parseCommand, executeCommand } from "@/lib/git-engine";
import type { CommandResult, SerializableRepository } from "@/lib/git-engine";

export type RepositorySnapshot = SerializableRepository;

export function useRepository(initialState?: SerializableRepository) {
  const repoRef = useRef<GitRepository | null>(null);

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

      if (parsed.type === "rebase-interactive") {
        return {
          success: true,
          message: `__INTERACTIVE_REBASE__:${parsed.onto}`,
          type: "info",
        };
      }

      const result = executeCommand(repoRef.current, parsed);
      updateSnapshot();
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
      updateSnapshot();
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
    runCommand,
    executeInteractiveRebase,
    reset,
    getRepo,
  };
}
