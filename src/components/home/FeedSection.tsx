import { cn } from "@/lib/utils";

interface FeedSectionProps {
  title: string;
  label?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function FeedSection({
  title,
  label,
  action,
  children,
  className,
  noPadding,
}: FeedSectionProps) {
  return (
    <section className={cn("border-b border-white/[0.06] last:border-b-0", className)}>
      <div className="flex items-end justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          {label && (
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-red-400/80">
              {label}
            </p>
          )}
          <h2 className="font-display text-lg font-bold text-white md:text-xl">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className={cn(!noPadding && "px-2 pb-4 md:px-4 md:pb-5")}>
        {children}
      </div>
    </section>
  );
}
