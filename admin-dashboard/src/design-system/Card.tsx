import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "tactile" | "subtle";
  hoverable?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "glass",
  hoverable = false,
  glow = false,
  onClick,
}) => {
  const variantStyles = {
    glass: "surface-glass surface-glass-highlight",
    tactile: "surface-glass surface-glass-highlight surface-tactile cursor-pointer",
    subtle: "surface-glass-subtle",
    default: "bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs",
  };

  const hoverStyle = hoverable ? "surface-tactile cursor-pointer" : "";
  const glowStyle = glow ? "ring-1 ring-[var(--accent-ring)] shadow-glow" : "";

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl relative transition-all duration-200 overflow-hidden ${variantStyles[variant]} ${hoverStyle} ${glowStyle} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`px-6 py-4 border-b border-[var(--border-subtle)] relative z-10 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
}> = ({ children, className = "", as: Tag = "h3" }) => {
  return (
    <Tag className={`font-display text-base font-bold text-[var(--text-primary)] tracking-tight ${className}`}>
      {children}
    </Tag>
  );
};

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <p className={`text-xs text-[var(--text-secondary)] mt-1 leading-relaxed ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return <div className={`p-6 relative z-10 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div
      className={`px-6 py-3.5 bg-[var(--bg-surface-subtle)] border-t border-[var(--border-subtle)] rounded-b-2xl flex items-center justify-between relative z-10 ${className}`}
    >
      {children}
    </div>
  );
};
