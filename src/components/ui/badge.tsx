import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "outline";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-forest/10 text-forest",
  accent: "bg-gold/15 text-gold",
  success: "bg-success/10 text-success",
  outline: "bg-transparent text-charcoal-muted border border-border",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

