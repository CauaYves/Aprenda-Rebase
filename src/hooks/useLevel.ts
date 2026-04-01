"use client";

import { useState, useCallback } from "react";
import { getLevel, type Level } from "@/lib/levels";
import { validateAll, type ValidationResult } from "@/lib/git-engine/validation";
import type { GitRepository } from "@/lib/git-engine";

export function useLevel(initialLevelId: number = 1) {
  const [currentLevelId, setCurrentLevelId] = useState(initialLevelId);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentLevel = getLevel(currentLevelId);

  const validate = useCallback(
    (repo: GitRepository): boolean => {
      if (!currentLevel) return false;
      const { allPassed, results } = validateAll(repo, currentLevel.validationRules);
      setValidationResults(results);
      if (allPassed) {
        setIsCompleted(true);
      }
      return allPassed;
    },
    [currentLevel]
  );

  const nextHint = useCallback(() => {
    if (!currentLevel) return;
    setShowHint(true);
    setHintIndex((prev) => Math.min(prev + 1, currentLevel.hints.length - 1));
  }, [currentLevel]);

  const toggleSolution = useCallback(() => {
    setShowSolution((prev) => !prev);
  }, []);

  const goToLevel = useCallback((id: number) => {
    setCurrentLevelId(id);
    setShowHint(false);
    setHintIndex(0);
    setShowSolution(false);
    setValidationResults([]);
    setIsCompleted(false);
  }, []);

  const resetLevel = useCallback(() => {
    setShowHint(false);
    setHintIndex(0);
    setShowSolution(false);
    setValidationResults([]);
    setIsCompleted(false);
  }, []);

  return {
    currentLevel: currentLevel as Level,
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
  };
}
