import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const ProgressBar = forwardRef(({ 
  className, 
  value = 0, 
  max = 100,
  variant = "default",
  ...props 
}, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const baseClasses = "w-full bg-gray-200 rounded-full h-2 overflow-hidden";
  
  const variants = {
    default: "bg-gradient-to-r from-primary-500 to-primary-400",
    success: "bg-gradient-to-r from-green-500 to-green-400",
    warning: "bg-gradient-to-r from-amber-500 to-amber-400",
    danger: "bg-gradient-to-r from-red-500 to-red-400"
  };
  
  const getVariantByPercentage = (pct) => {
    if (pct >= 100) return variants.danger;
    if (pct >= 80) return variants.warning;
    return variants.success;
  };
  
  const progressVariant = variant === "default" ? getVariantByPercentage(percentage) : variants[variant];
  
  return (
    <div
      className={cn(baseClasses, className)}
      ref={ref}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-500 ease-out", progressVariant)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;