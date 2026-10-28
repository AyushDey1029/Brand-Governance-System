import React from "react";
import { FolderOpen, Search, Inbox, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  preset?: "default" | "search" | "inbox" | "rules" | "shield" | "audit";
  className?: string;
}

/**
 * EmptyState
 * 
 * Premium, restrained empty state with abstract geometric ambient depth
 * and clear actionable guidance for the next workflow step.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  preset = "default",
  className = "",
}) => {
  const getDefaultIcon = () => {
    switch (preset) {
      case "search":
        return <Search className="h-6 w-6 text-[var(--accent-primary)]" />;
      case "inbox":
        return <Inbox className="h-6 w-6 text-[var(--accent-primary)]" />;
      case "rules":
        return <ShieldAlert className="h-6 w-6 text-amber-400" />;
      case "shield":
        return <CheckCircle2 className="h-6 w-6 text-emerald-400" />;
      case "audit":
        return <FileText className="h-6 w-6 text-[var(--accent-primary)]" />;
      default:
        return <FolderOpen className="h-6 w-6 text-[var(--accent-primary)]" />;
    }
  };

  const renderIcon = () => {
    if (!icon) return getDefaultIcon();
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="h-6 w-6 text-[var(--accent-primary)]" />;
    }
    return icon as React.ReactNode;
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-subtle)]/60 backdrop-blur-xs overflow-hidden transition-all duration-200 group hover:border-[var(--accent-border)] ${className}`}
    >
      {/* Abstract Concentric Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 select-none">
        <div className="h-48 w-48 rounded-full border border-[var(--accent-border)]/20" />
        <div className="absolute h-32 w-32 rounded-full border border-[var(--accent-border)]/30" />
      </div>

      {/* Decorative Icon Container with Light Halo */}
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-[var(--accent-primary)]/20 blur-md group-hover:scale-110 transition-transform duration-300" />
        <div className="relative h-14 w-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)] shadow-md group-hover:-translate-y-0.5 transition-transform duration-200">
          {renderIcon()}
        </div>
      </div>

      <h4 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-[var(--text-secondary)] max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>

      {(action || (actionLabel && onAction)) && (
        <div className="mt-5 relative z-10 animate-in fade-in duration-200">
          {action ? (
            action
          ) : (
            <Button variant="secondary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
