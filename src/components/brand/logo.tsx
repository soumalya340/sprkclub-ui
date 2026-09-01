import Link from "next/link";
import { cn } from "@/lib/utils";

export function SparkMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-6", className)}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M16 1.5 18.7 13.3 30.5 16 18.7 18.7 16 30.5 13.3 18.7 1.5 16 13.3 13.3Z"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-foreground no-underline",
        className,
      )}
    >
      <SparkMark className="size-5" />
      <span className="font-wordmark text-xl leading-none tracking-tight">sprkclub</span>
    </Link>
  );
}
