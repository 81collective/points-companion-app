"use client";

import Link from "next/link";
import Image from "next/image";
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
 * TextLogo — Iconic pin mark with wordmark.
 * - Distinctive pin/compass symbol representing guidance.
 * - Compact mode shows just the icon.
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
        "select-none font-semibold tracking-tight leading-none inline-flex items-center gap-2",
        className
      )}
    >
      <Image
        src="/logo-sm.svg"
        alt=""
        width={compact ? 28 : 32}
        height={compact ? 28 : 32}
        className="flex-shrink-0"
        priority
      />
      {!compact && (
        <span className={clsx("text-lg", dark ? "text-white" : "text-neutral-900")}>
          Point<span className="text-sky-500">Advisor</span>
        </span>
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
