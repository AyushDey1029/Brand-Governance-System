import React, {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--text-secondary)] tracking-tight"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border surface-glass-subtle px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--bg-app)] transition-all duration-200 ease-out ${
            error
              ? "border-[var(--color-danger-solid)] focus:border-[var(--color-danger-solid)] focus:ring-[var(--color-danger-border)]"
              : "border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-ring)]"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger-text)]">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--text-secondary)] tracking-tight"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border surface-glass-subtle px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--bg-app)] transition-all duration-200 ease-out ${
            error
              ? "border-[var(--color-danger-solid)] focus:border-[var(--color-danger-solid)] focus:ring-[var(--color-danger-border)]"
              : "border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-ring)]"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger-text)]">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--text-secondary)] tracking-tight"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border surface-glass-subtle px-3.5 py-2.5 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--bg-app)] transition-all duration-200 ease-out ${
            error
              ? "border-[var(--color-danger-solid)] focus:border-[var(--color-danger-solid)] focus:ring-[var(--color-danger-border)]"
              : "border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-ring)]"
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-[var(--color-danger-text)]">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
