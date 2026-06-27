type FieldProps = {
  label: string;
  description?: string;
  required?: boolean;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, description, required, htmlFor, error, children }: FieldProps) {
  return (
    <div className="grid gap-2 text-sm font-semibold text-muted">
      {htmlFor ? <label htmlFor={htmlFor}>{label}{required ? <span className="ml-1 text-rose-500" aria-hidden="true">*</span> : null}</label> : <span>{label}{required ? <span className="ml-1 text-rose-500" aria-hidden="true">*</span> : null}</span>}
      {description ? <span className="-mt-1 text-xs font-normal leading-5 text-soft">{description}</span> : null}
      {children}
      {error ? <span className="text-xs font-semibold text-rose-500" role="alert">{error}</span> : null}
    </div>
  );
}

export const inputClass =
  "focus-ring input-surface min-h-11 w-full rounded-md px-3 py-2 text-sm placeholder:text-soft";
