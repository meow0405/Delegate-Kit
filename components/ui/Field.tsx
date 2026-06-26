type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "focus-ring input-surface min-h-11 rounded-md px-3 py-2 text-sm placeholder:text-soft";
