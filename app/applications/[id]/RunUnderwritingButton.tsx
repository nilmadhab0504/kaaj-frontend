"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startUnderwriting } from "@/lib/api";
import { Button } from "rizzui";

export function RunUnderwritingButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      await startUnderwriting(applicationId);
      router.push(`/applications/${applicationId}/results`);
      router.refresh();
    } catch {
      router.push(`/applications/${applicationId}/results`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="solid"
      size="md"
      onClick={handleRun}
      disabled={loading}
      isLoading={loading}
    >
      {loading ? "Running…" : "Run underwriting"}
    </Button>
  );
}
