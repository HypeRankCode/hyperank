import Link from "next/link";
import { cn } from "@/lib/utils";

export type SettingsIconId =
  | "camera"
  | "avatar"
  | "locker"
  | "social"
  | "privacy"
  | "profile"
  | "dashboard";

function SettingsIcon({
  id,
  className,
}: {
  id: SettingsIconId;
  className?: string;
}) {
  const props = {
    className: cn("h-5 w-5", className),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true,
  };

  switch (id) {
    case "camera":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9a2 2 0 012-2h2l1-2h8l1 2h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <circle cx="12" cy="13" r="3.25" />
        </svg>
      );
    case "avatar":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.25" />
          <path
            strokeLinecap="round"
            d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
          />
        </svg>
      );
    case "locker":
      return (
        <svg {...props}>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path strokeLinecap="round" d="M8 10V7a4 4 0 118 0v3" />
        </svg>
      );
    case "social":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h6M7 16h8"
          />
          <rect x="3" y="5" width="18" height="14" rx="2" />
        </svg>
      );
    case "privacy":
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l7 4v5c0 4.418-3.134 7.943-7 9-3.866-1.057-7-4.582-7-9V7l7-4z"
          />
        </svg>
      );
    case "profile":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
  }
}

interface SettingsLinkCardProps {
  href: string;
  title: string;
  description: string;
  icon: SettingsIconId;
  meta?: string;
  external?: boolean;
}

export function SettingsLinkCard({
  href,
  title,
  description,
  icon,
  meta,
  external,
}: SettingsLinkCardProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="surface-card-hover group flex items-start gap-4 rounded-2xl p-5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-colors group-hover:border-red-500/40 group-hover:bg-red-500/15 group-hover:text-red-300">
        <SettingsIcon id={icon} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display font-bold group-hover:text-red-400">
            {title}
          </p>
          {meta && (
            <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
              {meta}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      <svg
        className="mt-1 h-4 w-4 shrink-0 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-red-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

interface SettingsSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ children, className }: SettingsSectionProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>
  );
}
