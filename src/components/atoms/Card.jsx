import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className, 
  children, 
  hoverable = false,
  ...props 
}, ref) => {
  const baseClasses = "bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300";
  const hoverClasses = hoverable ? "card-hover cursor-pointer" : "";
  
  return (
    <div
      className={cn(baseClasses, hoverClasses, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;