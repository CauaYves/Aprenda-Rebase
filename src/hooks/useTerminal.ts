"use client";

import { useState, useCallback } from "react";
import type { CommandResult } from "@/lib/git-engine";

export type TerminalLine = {
  id: number;
  content: string;
  type: "input" | "output" | "error" | "success" | "info" | "warning" | "system";
};

let lineIdCounter = 0;

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: lineIdCounter++,
      content: "Bem-vindo ao Simulador de Git Rebase! Digite 'git help' para ver os comandos disponíveis.",
      type: "system",
    },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addLine = useCallback((content: string, type: TerminalLine["type"]) => {
    setLines((prev) => [...prev, { id: lineIdCounter++, content, type }]);
  }, []);

  const addInputLine = useCallback(
    (input: string) => {
      addLine(`$ ${input}`, "input");
      setHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
    },
    [addLine]
  );

  const addResultLine = useCallback(
    (result: CommandResult) => {
      if (result.message) {
        addLine(result.message, result.type);
      }
    },
    [addLine]
  );

  const addSystemLine = useCallback(
    (content: string) => {
      addLine(content, "system");
    },
    [addLine]
  );

  const clear = useCallback(() => {
    setLines([]);
    lineIdCounter = 0;
  }, []);

  const getPreviousCommand = useCallback(() => {
    if (history.length === 0) return "";
    const newIndex =
      historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
    setHistoryIndex(newIndex);
    return history[newIndex] || "";
  }, [history, historyIndex]);

  const getNextCommand = useCallback(() => {
    if (historyIndex === -1) return "";
    const newIndex = historyIndex + 1;
    if (newIndex >= history.length) {
      setHistoryIndex(-1);
      return "";
    }
    setHistoryIndex(newIndex);
    return history[newIndex] || "";
  }, [history, historyIndex]);

  return {
    lines,
    addInputLine,
    addResultLine,
    addSystemLine,
    clear,
    getPreviousCommand,
    getNextCommand,
  };
}
