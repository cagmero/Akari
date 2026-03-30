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
        "rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden",
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
    variant?: "default" | "accent" | "dark" | "subtle";
    icon?: React.ElementType;
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default:
      "liquid-glass liquid-glass-hover text-[#3b4044]",
    accent:
      "bg-gradient-to-r from-[#d95000] to-[#ffb43f] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    dark:
      "bg-gradient-to-r from-[#3b4044] to-[#4a5056] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    subtle:
      "bg-[#3b4044]/5 text-[#3b4044] hover:bg-[#3b4044]/10 border border-[#3b4044]/10",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "rounded-2xl px-10 py-5 font-black text-sm transition-all duration-300",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        "flex items-center justify-center gap-2",
        variantClasses[variant as keyof typeof variantClasses],
        className
      )}
      {...props}
    >
      {props.children}
      {props.icon && <props.icon className="w-4 h-4" />}
    </button>
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
      "w-full bg-white/40 border border-white/60 rounded-2xl px-8 py-5 text-2xl font-black",
      "outline-none focus:ring-2 focus:ring-[#e3be81]/50 focus:border-[#e3be81]/30",
      "transition-all duration-300 placeholder:text-[#3b4044]/25",
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
        "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em]",
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
    <div className="text-center max-w-4xl mx-auto px-6 mb-16 md:mb-24">
      {badge && (
        <GlassBadge className="mb-8 text-[#3b4044]/60">
          <div className="w-2 h-2 rounded-full bg-[#d95000] shadow-[0_0_10px_rgba(217,80,0,0.6)]" />
          {badge}
        </GlassBadge>
      )}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-10">
        {title}{" "}
        {highlight && (
          <span className={cn("gradient-text-accent", highlightClass)}>
            {highlight}
          </span>
        )}
      </h1>
      {description && (
        <p className="text-[#3b4044]/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-bold">
          {description}
        </p>
      )}
    </div>
  );
}
