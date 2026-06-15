import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}

export function PageShell({ children, className, wide }: PageShellProps) {
  return (
    <div
      className={cn(
        "relative mx-auto animate-slide-up px-4 py-8 md:py-12",
        wide ? "max-w-7xl" : "max-w-6xl",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  label?: string;
  title: string;
  action?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  action,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div>
        {label && <p className="section-label mb-1">{label}</p>}
        <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
