import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── GlassCard ─── */
export const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "strong" | "subtle" }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClass =
    variant === "strong"
      ? "liquid-glass-strong"
      : variant === "subtle"
      ? "liquid-glass-subtle"
      : "liquid-glass";

  return (
    <div
      ref={ref}
      className={cn(
        variantClass,
        "rounded-3xl p-6 md:p-8 relative overflow-hidden",
        className
      )}
      {...props}
    />
  );
});
GlassCard.displayName = "GlassCard";

/* ─── GlassButton ─── */
export const GlassButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "accent" | "dark";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default:
      "liquid-glass liquid-glass-hover text-[#3b4044]",
    accent:
      "bg-gradient-to-r from-[#d95000] to-[#e67e22] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
    dark:
      "bg-gradient-to-r from-[#3b4044] to-[#4a5056] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "rounded-2xl px-6 py-3.5 font-semibold text-sm transition-all duration-300",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
GlassButton.displayName = "GlassButton";

/* ─── GlassInput ─── */
export const GlassInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full bg-white/40 border border-white/50 rounded-2xl px-5 py-4 text-lg font-medium",
      "outline-none focus:ring-2 focus:ring-[#e3be81]/60 focus:border-[#e3be81]/40",
      "transition-all duration-300 placeholder:text-[#3b4044]/30",
      className
    )}
    {...props}
  />
));
GlassInput.displayName = "GlassInput";

/* ─── GlassBadge ─── */
export function GlassBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold",
        "liquid-glass-subtle",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ─── SectionHeading ─── */
export function SectionHeading({
  badge,
  title,
  highlight,
  highlightClass,
  description,
}: {
  badge?: string;
  title: string;
  highlight?: string;
  highlightClass?: string;
  description?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {badge && (
        <GlassBadge className="mb-5 text-[#3b4044]/60">
          <div className="w-1.5 h-1.5 rounded-full bg-[#d95000]" />
          {badge}
        </GlassBadge>
      )}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
        {title}{" "}
        {highlight && (
          <span className={highlightClass || "gradient-text-accent"}>
            {highlight}
          </span>
        )}
      </h1>
      {description && (
        <p className="text-[#3b4044]/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
