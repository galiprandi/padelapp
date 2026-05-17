import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autoSelect?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, autoSelect, onFocus, ...props }, ref) => {
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (autoSelect) {
        event.currentTarget.select();
      }
      onFocus?.(event);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-full border border-input bg-background px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
