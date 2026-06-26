"use client";

import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { countryOptions } from "@/lib/countries";
import { inputClass } from "@/components/ui/Field";

export function CountryAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return countryOptions.slice(0, 10);
    return countryOptions
      .filter((country) => country.name.toLowerCase().includes(query) || country.code.toLowerCase() === query)
      .slice(0, 10);
  }, [value]);
  const trimmedValue = value.trim();
  const exactMatch = matches.some((option) => option.name.toLowerCase() === trimmedValue.toLowerCase());

  return (
    <div className="relative">
      <input
        className={inputClass}
        value={value}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (trimmedValue) {
              onChange(trimmedValue);
              setOpen(false);
            }
          }
        }}
        placeholder="Search portfolio, country, territory, party, or person"
        autoComplete="off"
      />
      {open ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-[var(--line)] bg-[var(--panel-strong)] p-1 shadow-2xl">
          {trimmedValue && !exactMatch ? (
            <button
              type="button"
              className="focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-[var(--tile)]"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(trimmedValue);
                setOpen(false);
              }}
            >
              <UserRound size={16} aria-hidden="true" />
              <span>Use custom portfolio: {trimmedValue}</span>
            </button>
          ) : null}
          {matches.map((country) => (
            <button
              key={country.code}
              type="button"
              className="focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-[var(--tile)]"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(country.name);
                setOpen(false);
              }}
            >
              {country.flag ? (
                <span className="text-lg" aria-hidden="true">{country.flag}</span>
              ) : (
                <UserRound size={16} aria-hidden="true" />
              )}
              <span>{country.name}</span>
              <span className="ml-auto text-[0.65rem] uppercase tracking-[0.14em] text-soft">{country.kind}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
