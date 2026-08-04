import React from "react";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={`space-y-4 text-left ${className}`}>
      {(title || description) && (
        <div className="pb-2 border-b border-base-200">
          {title && (
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/85">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[11px] text-base-content/50 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}
