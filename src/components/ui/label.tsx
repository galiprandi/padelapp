import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requiredIndicator?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, requiredIndicator, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-semibold text-foreground flex items-center gap-1",
        className
      )}
      {...props}
    >
      {children}
      {requiredIndicator && (
        <span className="text-destructive" aria-hidden>
          {requiredIndicator}
        </span>
      )}
    </label>
  )
);
Label.displayName = "Label";

export { Label };
