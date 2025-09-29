import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className,
  children,
  hover = false,
  ...props
}, ref) => {
  return (
    <div
      className={cn(
        "card",
        hover && "hover:scale-[1.01] cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;