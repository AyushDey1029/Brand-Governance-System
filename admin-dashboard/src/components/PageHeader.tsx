import React, { useState, useRef, useEffect } from "react";
import { Info, X, ChevronRight, Cpu } from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";

export interface PageHeaderProps {
  icon: React.ReactNode | React.ElementType;
  title: string;
  description: string;
  technicalDetails?: string;
  actions?: React.ReactNode;
  isAdmin?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  description,
  technicalDetails,
  actions,
  isAdmin: propIsAdmin,
}) => {
  const { activeRole } = useWorkspace();
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : (activeRole === "OWNER" || activeRole === "BRAND_MANAGER" || activeRole === "SUPER_ADMIN");
  const [techOpen, setTechOpen] = useState(false);
  const techRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (techRef.current && !techRef.current.contains(e.target as Node)) {
        setTechOpen(false);
      }
    };
    if (techOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [techOpen]);

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="h-5 w-5 text-[var(--accent-primary)]" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)] min-h-[72px] max-h-none md:max-h-[120px]">
      {/* Left: Icon, Title H1 & Description */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-primary)] shrink-0 mt-0.5 shadow-xs">
          {renderIcon()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[26px] sm:text-[28px] font-bold text-[var(--text-primary)] tracking-tight leading-tight font-sans">
              {title}
            </h1>

            {/* Technical details popover (ADMIN only) */}
            {isAdmin && technicalDetails && (
              <div className="relative inline-block" ref={techRef}>
                <button
                  type="button"
                  onClick={() => setTechOpen(!techOpen)}
                  aria-label="View technical architecture details"
                  title="Technical Architecture Details"
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)]"
                >
                  <Cpu className="h-3 w-3 text-[var(--accent-primary)]" />
                  <span>Technical details</span>
                </button>

                {techOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-72 p-3 surface-glass surface-glass-highlight border border-[var(--border-default)] rounded-xl shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)] mb-2">
                      <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 text-[12px]">
                        <Cpu className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                        Under The Hood
                      </span>
                      <button
                        type="button"
                        onClick={() => setTechOpen(false)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed font-mono text-[11px]">
                      {technicalDetails}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)] mt-0.5 leading-normal max-w-2xl line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Right: Primary and Secondary Action Buttons */}
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

