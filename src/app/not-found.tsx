import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20 text-center container-content">
      <h1 className="font-[family-name:var(--font-playfair)] text-6xl font-bold text-forest-dark">
        404
      </h1>
      <p className="text-lg text-charcoal-muted max-w-md">
        This trail doesn&apos;t exist. Let&apos;s get you back on the path.
      </p>
      <Link href="/">
        <Button variant="primary" size="lg">
          Return Home
        </Button>
      </Link>
    </div>
  );
}

