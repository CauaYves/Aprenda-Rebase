"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type LevelCompleteModalProps = {
  isOpen: boolean;
  currentLevelId: number;
  totalLevels: number;
  onNextLevel: () => void;
  onReset: () => void;
};

export function LevelCompleteModal({
  isOpen,
  currentLevelId,
  totalLevels,
  onNextLevel,
  onReset,
}: LevelCompleteModalProps) {
  const isLastLevel = currentLevelId >= totalLevels;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm mx-4 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl shadow-emerald-500/10"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,21,40,0.95) 0%, rgba(13,14,28,0.98) 100%)",
            }}
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Celebration Effect Header */}
            <div className="h-24 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <motion.div
                className="text-5xl drop-shadow-lg"
                animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                🎉
              </motion.div>
            </div>

            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Nível Completo!
              </h2>
              <p className="text-sm text-gray-400 mb-6 font-medium">
                {isLastLevel
                  ? "Parabéns! Você completou todos os níveis disponíveis."
                  : "Ótimo trabalho resolvendo o histórico do Git. Preparado para o próximo desafio?"}
              </p>

              <div className="flex flex-col gap-3">
                {!isLastLevel && (
                  <Button
                    onClick={onNextLevel}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 text-base shadow-lg shadow-emerald-500/20"
                  >
                    Próximo Nível →
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="w-full bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                >
                  ↻ Refazer este nível
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
