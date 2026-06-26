"use client";

import { Edit3, Info } from "lucide-react";
import { inputClass } from "@/components/ui/Field";
import { committeeOptions, getCommitteeRule } from "@/lib/committees/unRules";

export function CommitteePicker({
  value,
  onChange,
  customName,
  customDescription,
  onCustomNameChange,
  onCustomDescriptionChange,
}: {
  value: string;
  onChange: (value: string) => void;
  customName: string;
  customDescription: string;
  onCustomNameChange: (value: string) => void;
  onCustomDescriptionChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <button
        type="button"
        onClick={() => onChange("custom")}
        className={`focus-ring rounded-lg border p-4 text-left transition ${
          value === "custom" ? "border-pink-300 bg-pink-300/18" : "surface-tile hover:-translate-y-0.5"
        }`}
      >
        <span className="block text-sm font-bold text-ink">Custom committee</span>
        <span className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted">
          <Edit3 size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          Add your own committee name, mandate, procedure, and context for the kit.
        </span>
      </button>
      {value === "custom" ? (
        <div className="grid gap-4 rounded-lg border border-[var(--line)] bg-[var(--tile)] p-4 sm:col-span-2 lg:col-span-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-muted">
            <span>Custom committee name</span>
            <input
              className={inputClass}
              value={customName}
              onChange={(event) => onCustomNameChange(event.target.value)}
              placeholder="e.g. Crisis Cabinet, School Board, Futuristic UNSC"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-muted">
            <span>Committee explanation</span>
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={customDescription}
              onChange={(event) => onCustomDescriptionChange(event.target.value)}
              placeholder="Describe the mandate, procedure, powers, scope, and what delegates should optimize for."
            />
          </label>
        </div>
      ) : null}
      {committeeOptions.map((committee) => {
        const active = committee.id === value;
        return (
          <button
            key={committee.id}
            type="button"
            onClick={() => onChange(committee.id)}
            className={`focus-ring rounded-lg border p-4 text-left transition ${
              active ? "border-pink-300 bg-pink-300/18" : "surface-tile hover:-translate-y-0.5"
            }`}
          >
            <span className="block text-sm font-bold text-ink">{committee.name}</span>
            <span className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted">
              <Info size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              {getCommitteeRule(committee.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
