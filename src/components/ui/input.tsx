"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autoSelect?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, autoSelect, onFocus, onClick, ...props }, ref) => {
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (autoSelect) {
        event.currentTarget.select();
      }
      if (type === "date" || type === "time") {
        if (typeof event.currentTarget.showPicker === "function") {
          try {
            event.currentTarget.showPicker();
          } catch {
            // Ignored if browser restricts programmatic showPicker
          }
        }
      }
      onFocus?.(event);
    };

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
      if (type === "date" || type === "time") {
        if (typeof event.currentTarget.showPicker === "function") {
          try {
            event.currentTarget.showPicker();
          } catch {
            // Ignored if browser restricts programmatic showPicker
          }
        }
      }
      onClick?.(event);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-card px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-search-cancel-button]:hidden",
          className,
        )}
        ref={ref}
        onFocus={handleFocus}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
