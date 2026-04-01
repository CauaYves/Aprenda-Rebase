import * as React from "react";

export function formatWithHighlights(text: string): React.ReactNode[] {
  const parts = text.split(/('[^']+')/);
  return parts.map((part, i) => {
    if (part.startsWith("'") && part.endsWith("'")) {
      return (
        <span
          key={i}
          className="text-cyan-400 font-mono font-bold bg-cyan-500/10 px-1 py-0.5 rounded"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
