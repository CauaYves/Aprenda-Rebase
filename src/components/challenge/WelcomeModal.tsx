"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitGraph } from "@/components/graph/GitGraph";
import { useRepository } from "@/hooks/useRepository";
import type { SerializableRepository } from "@/lib/git-engine/types";

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const tutorialInitialState: SerializableRepository = {
  commits: [
    { id: "c1", message: "Initial commit", parents: [], timestamp: 1000, branch: "develop" },
    { id: "c2", message: "Add Header", parents: ["c1"], timestamp: 2000, branch: "develop" },
    { id: "c3", message: "Add Auth", parents: ["c2"], timestamp: 4000, branch: "develop" },
    { id: "f1", message: "Build Feature UI", parents: ["c2"], timestamp: 3000, branch: "user/jhon/1243-integracao" },
    { id: "f2", message: "Integrate API", parents: ["f1"], timestamp: 3500, branch: "user/jhon/1243-integracao" },
  ],
  branches: [
    { name: "develop", tip: "c3" },
    { name: "user/jhon/1243-integracao", tip: "f2" },
  ],
  head: { type: "branch", name: "user/jhon/1243-integracao" },
  commitOrder: ["c1", "c2", "c3", "f1", "f2"],
};

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { snapshot, runCommand, reset } = useRepository(tutorialInitialState);
  const [hasRebased, setHasRebased] = useState(false);

  const handleRunRebase = () => {
    runCommand("git rebase develop");
    setHasRebased(true);
  };

  const handleReset = () => {
    reset(tutorialInitialState);
    setHasRebased(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-[#1e1e2e] border border-white/10 rounded-xl shadow-2xl max-w-7xl w-full max-h-[96vh] flex flex-col md:flex-row overflow-hidden"
          >
            {/* Left Column: Text Info */}
            <div className="p-8 md:w-1/2 flex flex-col space-y-6 text-gray-300 font-sans overflow-y-auto border-r border-white/10">
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  Bem-vindo ao Git Rebase Simulator!
                </h1>
                <p className="text-gray-400 text-base">
                  Entendendo a reescrita de histórico na prática.
                </p>
              </div>

              <section>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-emerald-400">#</span> O que é o Rebase?
                </h2>
                <p className="leading-relaxed text-sm">
                  O <strong>Git Rebase</strong> pega uma série de commits e os <span className="text-emerald-300">"reaplica"</span> um por um em cima de uma nova base de código. Ele não une linhas, ele literalmente <em>reescreve a história</em> temporal.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-cyan-400">#</span> Por que e Quando utilizar?
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
                  <li><strong>Histórico Limpo:</strong> Evita "nós" de merge que dificultam a leitura visual.</li>
                  <li><strong>Antes do PR:</strong> Alinhe seu código atrasado com o da <code>main</code> mais atual da equipe, resolvendo conflitos antes na sua máquina.</li>
                  <li><strong className="text-amber-400">Aviso Crítico:</strong> NUNCA dê rebase em branches que outras pessoas já publicaram e usam. Ele altera "Hashes" de commits!</li>
                </ul>
              </section>
              
              <section className="bg-black/20 p-5 rounded-lg border border-white/5 text-sm">
                <h2 className="text-lg font-bold text-white mb-3">O Simulador (à direita)</h2>
                <p className="mb-3">
                  A equipe subiu novidades na `develop`, fazendo com que os commits da sua `feature` ficassem para trás. Em vez de dar Merge, dê um Rebase!
                </p>
                <div className="space-y-4">
                  <button
                    onClick={handleRunRebase}
                    disabled={hasRebased}
                    className="w-full px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded transition-colors"
                  >
                    {hasRebased ? "Rebase Concluído ✓" : "▶ Executar `git rebase develop`"}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={false}
                    className="w-full px-6 py-2 bg-transparent border border-gray-600 hover:border-gray-400 text-white rounded transition-colors"
                  >
                    ↺ Reiniciar Animação
                  </button>
                </div>
              </section>

              <div className="pt-4 flex justify-center mt-auto">
                <button
                  onClick={onClose}
                  className="px-8 py-3 w-full bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors border border-white/10"
                >
                  Ir para as Fases do Jogo →
                </button>
              </div>
            </div>

            {/* Right Column: Live Git Graph */}
            <div className="md:w-1/2 bg-[#181825] flex justify-center relative p-8">
               <div className="absolute inset-x-0 top-6 text-center text-gray-500 font-mono text-sm z-10">
                 Demonstração Interativa
               </div>
               <div className="w-full h-full border border-white/10 rounded overflow-hidden relative bg-[#0f0f17]">
                 <GitGraph snapshot={snapshot} />
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
