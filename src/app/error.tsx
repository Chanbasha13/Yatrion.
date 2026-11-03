"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <ErrorState
        title="Something went wrong"
        message="We couldn't load this page. Please try again."
        onRetry={reset}
      />
    </div>
  );
}

