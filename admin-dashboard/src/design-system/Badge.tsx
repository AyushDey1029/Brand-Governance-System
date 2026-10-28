import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "brand" | "success" | "warning" | "danger" | "glow";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  className = "",
}) => {
  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 tracking-tight font-medium",
    md: "text-xs px-2.5 py-1 font-semibold",
    lg: "text-xs px-3.5 py-1.5 font-bold uppercase tracking-wider",
  };

  const variantStyles = {
    neutral:
      "surface-glass-subtle text-[var(--text-secondary)] border border-[var(--border-default)]",
    brand:
      "bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-xs",
    glow:
      "bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] font-bold shadow-glow",
    success:
      "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)] shadow-xs",
    warning:
      "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] shadow-xs",
    danger:
      "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)] shadow-xs",
  };

  const dotColors = {
    neutral: "bg-[var(--text-muted)]",
    brand: "bg-[var(--accent-primary)]",
    glow: "bg-[var(--accent-primary)]",
    success: "bg-[var(--color-success-solid)]",
    warning: "bg-[var(--color-warning-solid)]",
    danger: "bg-[var(--color-danger-solid)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none backdrop-blur-xs transition-all ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};
