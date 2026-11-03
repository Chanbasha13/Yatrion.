import { LoadingState } from "@/components/ui/loading-state";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <LoadingState message="Preparing your journey…" />
    </div>
  );
}

