"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { RebaseAction, RebaseEntry, Commit } from "@/lib/git-engine/types";

type InteractiveRebaseModalProps = {
  isOpen: boolean;
  commits: Commit[];
  onConfirm: (entries: RebaseEntry[]) => void;
  onCancel: () => void;
};

const actionColors: Record<RebaseAction, string> = {
  pick: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  squash: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  drop: "bg-red-500/20 text-red-400 border-red-500/30",
  reword: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  edit: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

const actionLabels: Record<RebaseAction, string> = {
  pick: "pick",
  squash: "squash",
  drop: "drop",
  reword: "reword",
  edit: "edit",
};

type EntryState = {
  commitId: string;
  action: RebaseAction;
  message: string;
  originalMessage: string;
};

export function InteractiveRebaseModal({
  isOpen,
  commits,
  onConfirm,
  onCancel,
}: InteractiveRebaseModalProps) {
  const initialEntries = useMemo(
    () =>
      commits.map((c) => ({
        commitId: c.id,
        action: "pick" as RebaseAction,
        message: c.message,
        originalMessage: c.message,
      })),
    [commits]
  );

  const [entries, setEntries] = useState<EntryState[]>(initialEntries);

  // Reset entries when commits change
  useMemo(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const cycleAction = (index: number) => {
    const actions: RebaseAction[] = ["pick", "squash", "drop", "reword", "edit"];
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i !== index) return e;
        const currentIdx = actions.indexOf(e.action);
        const nextAction = actions[(currentIdx + 1) % actions.length];
        return { ...e, action: nextAction };
      })
    );
  };

  const handleConfirm = () => {
    const rebaseEntries: RebaseEntry[] = entries.map((e) => ({
      action: e.action,
      commitId: e.commitId,
      newMessage: e.action === "reword" ? e.message : undefined,
    }));
    onConfirm(rebaseEntries);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl mx-4 rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,21,40,0.98) 0%, rgba(13,14,28,0.99) 100%)",
            }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">
                Rebase Interativo
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Clique no badge de ação para alternar entre: pick → squash → drop →
                reword → edit
              </p>
            </div>

            {/* Commit list */}
            <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
              <Reorder.Group
                axis="y"
                values={entries}
                onReorder={setEntries}
                className="space-y-2"
              >
                {entries.map((entry, index) => (
                  <Reorder.Item
                    key={entry.commitId}
                    value={entry}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-grab active:cursor-grabbing"
                  >
                    {/* Drag handle */}
                    <div className="text-gray-600 shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="5" cy="4" r="1.5" />
                        <circle cx="11" cy="4" r="1.5" />
                        <circle cx="5" cy="8" r="1.5" />
                        <circle cx="11" cy="8" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="11" cy="12" r="1.5" />
                      </svg>
                    </div>

                    {/* Action badge */}
                    <button
                      onClick={() => cycleAction(index)}
                      className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-bold border transition-all ${actionColors[entry.action]}`}
                    >
                      {actionLabels[entry.action]}
                    </button>

                    {/* Commit hash */}
                    <span className="text-gray-500 font-mono text-xs shrink-0">
                      {entry.commitId.slice(0, 7)}
                    </span>

                    {/* Message */}
                    {entry.action === "reword" ? (
                      <input
                        type="text"
                        value={entry.message}
                        onChange={(e) =>
                          setEntries((prev) =>
                            prev.map((en, i) =>
                              i === index
                                ? { ...en, message: e.target.value }
                                : en
                            )
                          )
                        }
                        className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1 text-sm text-blue-300 outline-none font-mono"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className={`flex-1 text-sm truncate ${
                          entry.action === "drop"
                            ? "text-gray-600 line-through"
                            : "text-gray-300"
                        }`}
                      >
                        {entry.message}
                      </span>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
              >
                Aplicar Rebase
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
