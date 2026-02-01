"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createProgram } from "@/lib/api";
import type { LenderPolicyCriteria } from "@/types";
import { Card, CardHeader } from "@/components/ui";
import { FormActions } from "@/components/shared/FormActions";
import { Input, Textarea, Alert } from "rizzui";
import { ProgramCriteriaForm } from "../ProgramCriteriaForm";

const defaultCriteria: LenderPolicyCriteria = {
  loanAmount: { minAmount: 10000, maxAmount: 500000 },
};

export default function NewProgramPage() {
  const params = useParams();
  const router = useRouter();
  const lenderId = params.id as string;
  const [name, setName] = useState("");
  const [tier, setTier] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<LenderPolicyCriteria>(defaultCriteria);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      !criteria.loanAmount ||
      (criteria.loanAmount.minAmount === 0 && criteria.loanAmount.maxAmount === 0)
    ) {
      setError("Loan amount min and max are required.");
      return;
    }
    setSaving(true);
    try {
      await createProgram(lenderId, {
        name,
        tier: tier || undefined,
        description: description || undefined,
        criteria,
      });
      router.push(`/lenders/${lenderId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create program"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/lenders/${lenderId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Lender
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          Add program
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert color="danger" size="md" className="mb-4">
            {error}
          </Alert>
        )}
        <Card className="mb-6">
          <CardHeader title="Program details" />
          <div className="space-y-4">
            <Input
              label="Name *"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard Program"
              required
            />
            <Input
              label="Tier (optional)"
              type="text"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              placeholder="e.g. A"
              className="max-w-xs"
            />
            <Textarea
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of the program"
            />
          </div>
        </Card>

        <Card className="mb-6">
          <CardHeader title="Credit criteria" />
          <p className="mb-4 text-sm text-muted-foreground">
            Loan amount min/max are required. Set other criteria as needed
            (FICO, PayNet, time in business, geographic, industry, equipment,
            min revenue).
          </p>
          <ProgramCriteriaForm criteria={criteria} onChange={setCriteria} />
        </Card>

        <FormActions
          submitLabel="Create program"
          loadingLabel="Creating…"
          saving={saving}
          cancelHref={`/lenders/${lenderId}`}
        />
      </form>
    </div>
  );
}
