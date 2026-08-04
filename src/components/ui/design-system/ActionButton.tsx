import React from "react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "error" | "success" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function ActionButton({
  children,
  variant = "outline",
  size = "sm",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ActionButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case "primary":
        return "btn-primary text-white";
      case "error":
        return "btn-error text-white";
      case "success":
        return "btn-success text-white";
      case "ghost":
        return "btn-ghost text-base-content";
      case "outline":
      default:
        return "btn-outline border-base-300 text-base-content hover:bg-base-200";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "xs":
        return "btn-xs";
      case "sm":
        return "btn-sm";
      case "lg":
        return "btn-lg";
      case "md":
      default:
        return "btn-md";
    }
  };

  return (
    <button
      disabled={disabled || loading}
      className={`btn rounded-md font-semibold tracking-wide shadow-none border transition active:scale-[0.98] ${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs mr-1" />
      ) : icon ? (
        <span className="mr-1.5 shrink-0 flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
