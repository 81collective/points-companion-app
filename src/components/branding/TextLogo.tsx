"use client";

import Link from "next/link";
import clsx from "clsx";

type TextLogoProps = {
  className?: string;
  href?: string;
  withLink?: boolean;
  compact?: boolean;
  dark?: boolean;
  "aria-label"?: string;
};

/**
 * TextLogo — Pure text-based minimalist wordmark.
 * - "Point" in brand sky blue, "Advisor" in neutral.
 * - Compact mode shows just "P" letter.
 */
export default function TextLogo({
  className,
  href = "/",
  withLink = true,
  compact,
  dark = true,
  "aria-label": ariaLabel = "PointAdvisor",
}: TextLogoProps) {
  const content = (
    <span
      aria-label={ariaLabel}
      className={clsx(
        "select-none font-semibold tracking-tight leading-none inline-flex items-center",
        className
      )}
    >
      {compact ? (
        <span className="text-sky-500 text-xl font-bold">P</span>
      ) : (
        <>
          <span className="text-sky-500">Point</span>
          <span className={dark ? "text-white" : "text-neutral-900"}>Advisor</span>
        </>
      )}
    </span>
  );

  if (!withLink) return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label={ariaLabel} prefetch>
      {content}
    </Link>
  );
}
