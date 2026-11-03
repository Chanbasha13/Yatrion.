import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = "Nothing here yet",
  message = "Check back later for updates.",
  children,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-20 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory-warm">
        {icon ?? <Inbox size={24} className="text-charcoal-muted" />}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
        <p className="mt-1 text-sm text-charcoal-muted max-w-md">{message}</p>
      </div>
      {children}
    </div>
  );
}

