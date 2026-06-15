import type { ProfilePose } from "@/lib/avatar/studio";
import { cn } from "@/lib/utils";

const POSE_PATHS: Record<ProfilePose, React.ReactNode> = {
  default: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 8v5M8 11h8M9 20l3-7 3 7M8 14l-2 4M16 14l2 4" />
    </>
  ),
  wave: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 8v5M8 11h8M9 20l3-7 3 7M16 8l2-2 2 2-2 2" />
    </>
  ),
  flex: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 8v4M8 12l-2-2 2-2M16 12l2-2-2-2M9 20l3-6 3 6" />
    </>
  ),
  peace: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 8v5M8 11h8M9 20l3-7 3 7M7 10l2 2M17 10l-2 2" />
    </>
  ),
  stance: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 8v4M7 11h10M8 20l4-8 4 8M7 14l-1 3M17 14l1 3" />
    </>
  ),
};

export function PoseIcon({
  pose,
  className,
}: {
  pose: ProfilePose;
  className?: string;
}) {
  return (
    <svg
      className={cn("h-6 w-6", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {POSE_PATHS[pose]}
    </svg>
  );
}
