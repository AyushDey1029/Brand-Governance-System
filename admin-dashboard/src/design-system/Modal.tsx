import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Dialog Window with Cinematic Glass & Specular Edge */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} surface-glass surface-glass-highlight rounded-2xl border border-[var(--glass-border)] shadow-2xl overflow-hidden z-10 transition-all transform duration-200 animate-in zoom-in-95`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-start justify-between relative z-10">
          <div>
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-[var(--bg-surface-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-3 relative z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
