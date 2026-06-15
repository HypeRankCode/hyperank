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
        "relative mx-auto animate-slide-up px-4 py-10 md:py-12 lg:px-6",
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
        "mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-5",
        className
      )}
    >
      <div>
        {label && <p className="section-label mb-2">{label}</p>}
        <h2 className="font-display text-2xl font-semibold text-zinc-50 md:text-[1.75rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
