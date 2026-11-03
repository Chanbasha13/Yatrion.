import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading…", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-20", className)}>
      <Loader2 size={28} className="animate-spin text-forest" />
      <p className="text-sm text-charcoal-muted">{message}</p>
    </div>
  );
}

