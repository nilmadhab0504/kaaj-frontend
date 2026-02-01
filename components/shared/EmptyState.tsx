"use client";

import { Empty, EmptyBoxIcon } from "rizzui";
import { type ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  title = "No data",
  description,
  action,
}: EmptyStateProps) {
  return (
    <Empty
      image={<EmptyBoxIcon className="mx-auto h-16 w-16 text-muted" />}
      text={title}
      textAs="p"
      className="py-12"
    >
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Empty>
  );
}
