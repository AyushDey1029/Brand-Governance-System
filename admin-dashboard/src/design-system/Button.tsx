import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode | React.ElementType;
  rightIcon?: React.ReactNode | React.ElementType;
}

const renderButtonIcon = (iconNode: React.ReactNode | React.ElementType) => {
  if (!iconNode) return null;
  if (React.isValidElement(iconNode)) return iconNode;
  if (typeof iconNode === "function" || (typeof iconNode === "object" && iconNode !== null)) {
    const IconComponent = iconNode as React.ElementType;
    return <IconComponent className="h-4 w-4" />;
  }
  return iconNode as React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  style,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none select-none cursor-pointer active:scale-[0.97]";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-2.5 gap-2.5",
  };

  const variantStyles = {
    primary:
      "accent-bg shadow-[0_4px_20px_-4px_var(--accent-ring)] border-t border-white/25 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_-4px_var(--accent-ring)] active:translate-y-0",
    secondary:
      "surface-glass-subtle text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)] hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0",
    glass:
      "surface-glass text-[var(--text-primary)] border border-[var(--glass-border)] hover:border-[var(--accent-border)] hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0",
    outline:
      "bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-subtle)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 active:translate-y-0",
    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] active:bg-[var(--bg-surface-elevated)]",
    danger:
      "bg-[var(--color-danger-solid)] text-white hover:brightness-105 shadow-[0_4px_16px_-4px_rgba(244,63,94,0.4)] border-t border-white/20 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-4px_rgba(244,63,94,0.5)] active:translate-y-0",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      style={style}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{renderButtonIcon(leftIcon)}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{renderButtonIcon(rightIcon)}</span>}
    </button>
  );
};
