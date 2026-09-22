import {
  getSkeletonAriaAttributes,
  getSkeletonClasses,
} from "./skeleton-utils";

export function Skeleton({
  className,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  role,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ariaAttrs = getSkeletonAriaAttributes({
    "aria-hidden": ariaHidden,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    role,
  });

  return (
    <div
      {...ariaAttrs}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={getSkeletonClasses(className)}
      {...props}
    />
  );
}
