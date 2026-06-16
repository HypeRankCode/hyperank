import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hype/50 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-hype text-white hover:brightness-110 shadow-hype-sm hover:shadow-hype",
        secondary:
          "border border-[var(--border-bright)] bg-transparent text-[var(--text-1)] hover:border-hype hover:bg-hype/10",
        outline:
          "border border-[var(--border-bright)] bg-transparent text-[var(--text-1)] hover:border-hype/60 hover:bg-hype/5",
        ghost:
          "text-[var(--text-2)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-1)]",
        dead: "border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text-2)] hover:border-[var(--border-bright)] hover:text-[var(--text-1)]",
        glow: "btn-ghost-glow",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        hero: "h-12 px-8 text-base min-h-[48px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
