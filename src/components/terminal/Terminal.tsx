"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TerminalLine } from "@/hooks/useTerminal";
import { formatWithHighlights } from "@/lib/formatters";

type TerminalProps = {
  lines: TerminalLine[];
  onCommand: (command: string) => void;
  getPreviousCommand: () => string;
  getNextCommand: () => string;
  disabled?: boolean;
};

const lineColors: Record<TerminalLine["type"], string> = {
  input: "text-cyan-400",
  output: "text-gray-300",
  error: "text-red-400",
  success: "text-emerald-400",
  info: "text-blue-400",
  warning: "text-amber-400",
  system: "text-violet-400",
};

export function Terminal({
  lines,
  onCommand,
  getPreviousCommand,
  getNextCommand,
  disabled = false,
}: TerminalProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [lines]);

  // Focus input on click
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || disabled) return;
      onCommand(input.trim());
      setInput("");
    },
    [input, onCommand, disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = getPreviousCommand();
        if (prev) setInput(prev);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setInput(getNextCommand());
      }
    },
    [getPreviousCommand, getNextCommand]
  );

  return (
    <motion.div
      className="flex flex-col h-full rounded-xl overflow-hidden border border-white/5"
      style={{
        background: "linear-gradient(180deg, rgba(13,14,28,0.95) 0%, rgba(10,11,22,0.98) 100%)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onClick={handleContainerClick}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-500 font-mono ml-2">simulador-git-rebase</span>
      </div>

      {/* Terminal content */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-1 font-mono text-sm">
          {lines.map((line) => (
            <motion.div
              key={line.id}
              className={`${lineColors[line.type]} whitespace-pre-wrap break-all leading-relaxed`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
            >
              {formatWithHighlights(line.content)}
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Input line */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-white/[0.02]"
      >
        <span className="text-emerald-400 font-mono text-sm font-bold shrink-0">
          ~/repo $
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 bg-transparent outline-none text-gray-200 font-mono text-sm placeholder:text-gray-600 disabled:opacity-50"
          placeholder={disabled ? "processando..." : "digite um comando git..."}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
        <motion.div
          className="w-2 h-4 bg-emerald-400"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        />
      </form>
    </motion.div>
  );
}
