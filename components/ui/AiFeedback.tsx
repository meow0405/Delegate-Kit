"use client";

import { RotateCcw, ThumbsDown } from "lucide-react";
import { useState } from "react";

export function AiFeedback({ onUndo, label = "AI suggestion" }: { onUndo?: () => void; label?: string }) {
  const [reported, setReported] = useState(false);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3" aria-label={`${label} controls`}>
      {onUndo ? (
        <button type="button" className="feedback-button" onClick={onUndo}>
          <RotateCcw size={14} /> Undo
        </button>
      ) : null}
      <button type="button" className="feedback-button" onClick={() => setReported(true)} disabled={reported}>
        <ThumbsDown size={14} /> {reported ? "Feedback noted" : "This was wrong"}
      </button>
      <span className="text-xs text-soft">Review AI output before using it in committee</span>
    </div>
  );
}
