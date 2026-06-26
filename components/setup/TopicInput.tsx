"use client";

import { inputClass } from "@/components/ui/Field";

export function TopicInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      className={`${inputClass} min-h-24 resize-y`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Enter the agenda"
    />
  );
}
