"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getLenderPolicy, updateLenderPolicy } from "@/lib/api";
import type { LenderPolicy } from "@/types";
import { Card, CardHeader } from "@/components/ui";
import { FormActions } from "@/components/shared/FormActions";
import { Input, Textarea, Alert } from "rizzui";

export default function LenderEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [policy, setPolicy] = useState<LenderPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLenderPolicy(id)
      .then(setPolicy)
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;
    setError(null);
    setSaving(true);
    try {
      await updateLenderPolicy(id, {
        name: policy.name,
        description: policy.description,
      });
      router.push(`/lenders/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading policy…</p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="space-y-4">
        <Link
          href="/lenders"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Lender policies
        </Link>
        <p className="text-muted-foreground">Policy not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/lenders/${id}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← {policy.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Edit policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update basic policy info. Criteria editing can be extended per
          program.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert color="danger" size="md" className="mb-4">
            {error}
          </Alert>
        )}

        <Card>
          <CardHeader title="Policy details" />
          <div className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={policy.name}
              onChange={(e) =>
                setPolicy((p) => (p ? { ...p, name: e.target.value } : p))
              }
              required
            />
            <Textarea
              label="Description"
              value={policy.description ?? ""}
              onChange={(e) =>
                setPolicy((p) =>
                  p ? { ...p, description: e.target.value } : p
                )
              }
              rows={3}
              placeholder="Brief description of the lender policy"
            />
          </div>
        </Card>

        <div className="mt-6">
          <FormActions
            submitLabel="Save changes"
            loadingLabel="Saving…"
            saving={saving}
            cancelHref={`/lenders/${id}`}
          />
        </div>
      </form>
    </div>
  );
}
