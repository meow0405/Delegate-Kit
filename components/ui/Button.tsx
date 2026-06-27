import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-[var(--foreground)] text-[var(--background)] shadow-lg hover:opacity-90",
    secondary: "brand-badge hover:-translate-y-0.5",
    ghost: "text-ink hover:bg-white/12",
    danger: "bg-rose-400 text-slate-950 hover:bg-rose-300",
  };

  return (
    <button
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:saturate-0 disabled:opacity-45 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
