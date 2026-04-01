"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Level } from "@/lib/levels";
import type { ValidationResult } from "@/lib/git-engine/validation";
import { levels } from "@/lib/levels";
import { formatWithHighlights } from "@/lib/formatters";

type ChallengePanelProps = {
  level: Level;
  currentLevelId: number;
  showHint: boolean;
  hintIndex: number;
  showSolution: boolean;
  validationResults: ValidationResult[];
  isCompleted: boolean;
  onNextHint: () => void;
  onToggleSolution: () => void;
  onReset: () => void;
  onValidate: () => void;
  onGoToLevel: (id: number) => void;
};

const difficultyColors = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

const difficultyLabels = {
  beginner: "iniciante",
  intermediate: "intermediário",
  advanced: "avançado",
};

export function ChallengePanel({
  level,
  currentLevelId,
  showHint,
  hintIndex,
  showSolution,
  validationResults,
  isCompleted,
  onNextHint,
  onToggleSolution,
  onReset,
  onValidate,
  onGoToLevel,
}: ChallengePanelProps) {
  return (
    <motion.div
      className="flex flex-col h-full rounded-xl overflow-hidden border border-white/5"
      style={{
        background: "linear-gradient(180deg, rgba(13,14,28,0.95) 0%, rgba(10,11,22,0.98) 100%)",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className={difficultyColors[level.difficulty]}
          >
            {difficultyLabels[level.difficulty]}
          </Badge>
          <Badge variant="outline" className="bg-white/5 text-gray-400 border-white/10">
            Nível {level.id}
          </Badge>
        </div>
        <h2 className="text-lg font-bold text-white">
          {level.titlePt}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">{level.title}</p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-5 space-y-5">
          {/* Level selector */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Níveis
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              {levels.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onGoToLevel(l.id)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 ${
                    l.id === currentLevelId
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {l.id}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Descrição
            </h3>
            <div className="space-y-2">
              {level.description.map((text, i) => (
                <p key={i} className="text-sm text-gray-300 leading-relaxed">
                  {formatWithHighlights(text)}
                </p>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              🎯 Objetivos
            </h3>
            <ul className="space-y-1.5">
              {level.objectives.map((obj, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="text-cyan-400 mt-0.5 shrink-0">▸</span>
                  <span>{formatWithHighlights(obj)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Validation Results */}
          <AnimatePresence>
            {validationResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Validação
                </h3>
                <div className="space-y-1">
                  {validationResults.map((r, i) => (
                    <motion.div
                      key={i}
                      className={`text-xs px-3 py-2 rounded-lg ${
                        r.passed
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {formatWithHighlights(r.message)}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>



          {/* Hints */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  💡 Dicas
                </h3>
                <div className="space-y-1.5">
                  {level.hints.slice(0, hintIndex + 1).map((hint, i) => (
                    <motion.p
                      key={i}
                      className="text-sm text-amber-300/80 bg-amber-500/10 px-3 py-2 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {formatWithHighlights(hint)}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Solution */}
          <AnimatePresence>
            {showSolution && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  📋 Solução
                </h3>
                <div className="bg-white/5 rounded-lg p-3 font-mono text-xs space-y-1">
                  {level.solution.map((cmd, i) => (
                    <motion.div
                      key={i}
                      className="text-cyan-400"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      $ {cmd}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Action buttons */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02] space-y-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="flex-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            ↺ Reiniciar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onNextHint}
            className="flex-1 bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
          >
            💡 Dica
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleSolution}
            className="flex-1 bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20"
          >
            {showSolution ? "Ocultar" : "Ver"} Solução
          </Button>
          <Button
            size="sm"
            onClick={onValidate}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
          >
            ✓ Validar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
