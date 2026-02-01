"use client";

import { Badge } from "rizzui";
import { APPLICATION_STATUS_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = APPLICATION_STATUS_CONFIG[status] ?? {
    color: "secondary" as const,
    variant: "flat" as const,
  };

  return (
    <Badge
      color={config.color}
      variant={config.variant}
      size="sm"
      className={cn("capitalize", className)}
    >
      {status}
    </Badge>
  );
}
