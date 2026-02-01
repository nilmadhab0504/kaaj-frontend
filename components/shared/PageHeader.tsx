"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  backHref,
  backLabel = "Back",
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {backLabel}
          </Link>
        )}
        <h1 className={cn("text-2xl font-bold text-foreground", backHref && "mt-1")}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
