import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        info:
          "border-transparent bg-info text-info-foreground hover:bg-info/80",
        // Status-specific variants with theme-aware colors
        backlog:
          "bg-muted text-muted-foreground border-border",
        saved:
          "bg-muted text-muted-foreground border-border",
        toApply:
          "bg-primary/15 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/40",
        applied:
          "bg-info/15 text-info border-info/30 dark:bg-info/20 dark:border-info/40",
        assessment:
          "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
        interview:
          "bg-warning/15 text-warning border-warning/30 dark:bg-warning/20 dark:border-warning/40",
        offer:
          "bg-success/15 text-success border-success/30 dark:bg-success/20 dark:border-success/40",
        rejected:
          "bg-destructive/15 text-destructive border-destructive/30 dark:bg-destructive/20 dark:border-destructive/40",
        withdrawn:
          "bg-destructive/15 text-destructive border-destructive/30 dark:bg-destructive/20 dark:border-destructive/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };