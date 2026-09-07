import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  "aria-hidden": ariaHidden,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const isAccessibleContainer =
    Boolean(props["aria-label"]) ||
    Boolean(props["aria-labelledby"]) ||
    Boolean(props.role);

  const defaultAriaHidden = isAccessibleContainer ? undefined : "true";

  return (
    <div
      aria-hidden={ariaHidden ?? defaultAriaHidden}
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
