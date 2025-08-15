"use client";

import Link from "next/link";
import clsx from "clsx";

type TextLogoProps = {
  className?: string;
  href?: string;
  withLink?: boolean;
  compact?: boolean;
  "aria-label"?: string;
};

/**
 * TextLogo — a simple, modern, text-based brand mark.
 * - Uses Inter font from RootLayout.
 * - Gradient accent on the second word for subtle branding.
 * - Compact mode shows a short mark on very small screens.
 */
export default function TextLogo({
  className,
  href = "/",
  withLink = true,
  compact,
  "aria-label": ariaLabel = "PointAdvisor",
}: TextLogoProps) {
  const content = (
    <span
      aria-label={ariaLabel}
      className={clsx(
        "select-none font-extrabold tracking-tight leading-none",
        "text-white",
        className
      )}
    >
      {/* When compact, prefer short mark on very small screens */}
      <span className={clsx({ hidden: compact })}>Point</span>
      <span className={clsx({ hidden: compact })}> </span>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
        {compact ? "PA" : "Advisor"}
      </span>
    </span>
  );

  if (!withLink) return content;
  return (
    <Link href={href} className="inline-flex items-center gap-2" aria-label={ariaLabel} prefetch>
      {content}
    </Link>
  );
}
