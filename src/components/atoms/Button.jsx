import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  className,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  children,
  ...props
}, ref) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "text-slate-600 hover:text-primary-600 hover:bg-slate-100 transition-all duration-200",
    danger: "bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <ApperIcon name={icon} className="h-4 w-4" />
          )}
          {children}
          {icon && iconPosition === "right" && (
            <ApperIcon name={icon} className="h-4 w-4" />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;