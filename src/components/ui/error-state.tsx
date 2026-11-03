import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-20 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
        <AlertTriangle size={24} className="text-error" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
        <p className="mt-1 text-sm text-charcoal-muted max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

