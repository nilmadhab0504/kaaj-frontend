"use client";

import Link from "next/link";
import { Button } from "rizzui";

interface FormActionsProps {
  readonly submitLabel: string;
  readonly loadingLabel?: string;
  readonly saving: boolean;
  readonly cancelHref: string;
  readonly cancelLabel?: string;
}

export function FormActions({
  submitLabel,
  loadingLabel,
  saving,
  cancelHref,
  cancelLabel = "Cancel",
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      <Button
        type="submit"
        variant="solid"
        size="md"
        disabled={saving}
        isLoading={saving}
        className="px-4 py-2.5 text-sm font-medium"
      >
        {saving ? (loadingLabel ?? `${submitLabel}…`) : submitLabel}
      </Button>
      <Button
        as={Link}
        href={cancelHref}
        variant="outline"
        size="md"
        type="button"
        className="rounded-[var(--border-radius)] border border-border px-4 py-2.5 text-sm font-medium"
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
