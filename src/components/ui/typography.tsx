import { cn } from "@/lib/utils";

/* ── Heading ── */
type HeadingLevel = "h1" | "h2" | "h3" | "h4";

const headingSizes: Record<HeadingLevel, string> = {
  h1: "text-3xl sm:text-4xl lg:text-5xl",
  h2: "text-2xl sm:text-3xl lg:text-4xl",
  h3: "text-xl sm:text-2xl",
  h4: "text-lg sm:text-xl",
};

interface HeadingProps {
  as?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

export function Heading({ as: Tag = "h2", children, className }: HeadingProps) {
  return (
    <Tag
      className={cn(
        "font-[family-name:var(--font-playfair)] font-bold text-forest-dark",
        headingSizes[Tag],
        className
      )}
    >
      {children}
    </Tag>
  );
}

/* ── Section wrapper with consistent spacing ── */
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 sm:py-20 lg:py-24", className)}>
      <div className="container-content">{children}</div>
    </section>
  );
}

