"use client";

import { UserRound, X } from "lucide-react";
import { useState } from "react";
import { inputClass } from "@/components/ui/Field";
import { getCountryMatch } from "@/lib/countries";

export function CountryRosterInput({
  roster,
  onChange,
  id,
}: {
  roster: string[];
  onChange: (roster: string[]) => void;
  id?: string;
}) {
  const [bulkText, setBulkText] = useState(roster.join("\n"));

  function parseRoster(value: string) {
    return Array.from(
      new Set(
        value
          .split(/\n|,/)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  }

  function removeEntry(entry: string) {
    const next = roster.filter((item) => item !== entry);
    setBulkText(next.join("\n"));
    onChange(next);
  }

  return (
    <div className="grid gap-3">
      <textarea
        id={id}
        className={`${inputClass} min-h-28 resize-y`}
        value={bulkText}
        onChange={(event) => {
          setBulkText(event.target.value);
          onChange(parseRoster(event.target.value));
        }}
        placeholder={"Brazil\nFrance\nKenya\nJapan\nDelegate name"}
      />
      {roster.length ? (
        <div className="flex flex-wrap gap-2">
          {roster.map((entry) => {
            const country = getCountryMatch(entry);
            return (
              <span
                key={entry}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-ink shadow-sm"
              >
                {country?.flag ? (
                  <span className="text-base" aria-hidden="true">{country.flag}</span>
                ) : (
                  <UserRound size={15} aria-hidden="true" />
                )}
                <span>{country?.name ?? entry}</span>
                <button
                  type="button"
                  className="focus-ring rounded-full p-0.5 text-muted hover:bg-[var(--tile)] hover:text-ink"
                  onClick={() => removeEntry(entry)}
                  aria-label={`Remove ${entry}`}
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
