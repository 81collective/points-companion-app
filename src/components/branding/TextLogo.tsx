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
 * TextLogo — Modern minimalist brand mark with logo icon.
 * - Uses Inter font from RootLayout.
 * - Clean sky blue accent for modern feel.
 * - Compact mode shows icon + short mark.
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
        dark ? "text-white" : "text-neutral-900",
        className
      )}
    >
      <Image 
        src="/logo-sm.svg" 
        alt="" 
        width={28} 
        height={28} 
        className="rounded-lg"
        priority
      />
      {!compact && (
        <>
          <span>Point</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-sky-500">
            Advisor
          </span>
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
