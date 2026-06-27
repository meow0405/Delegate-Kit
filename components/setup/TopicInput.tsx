"use client";

import { inputClass } from "@/components/ui/Field";

export function TopicInput({ value, onChange, id, onBlur, invalid }: { value: string; onChange: (value: string) => void; id?: string; onBlur?: () => void; invalid?: boolean }) {
  return (
    <textarea
      className={`${inputClass} min-h-24 resize-y`}
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Regulating autonomous weapons in armed conflict"
      onBlur={onBlur}
      aria-invalid={invalid}
    />
  );
}
