"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getLenderPolicy, updateProgram } from "@/lib/api";
import type { LenderPolicyCriteria } from "@/types";
import { Card, CardHeader } from "@/components/ui";
import { FormActions } from "@/components/shared/FormActions";
import { Input, Textarea, Alert } from "rizzui";
import { ProgramCriteriaForm } from "../../ProgramCriteriaForm";

const defaultCriteria: LenderPolicyCriteria = {
  loanAmount: { minAmount: 0, maxAmount: 0 },
};

export default function EditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const lenderId = params.id as string;
  const programId = params.programId as string;
  const [policy, setPolicy] = useState<
    Awaited<ReturnType<typeof getLenderPolicy>>
  >(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [tier, setTier] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<LenderPolicyCriteria>(defaultCriteria);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLenderPolicy(lenderId).then((p) => {
      setPolicy(p);
        const prog = p?.programs.find((x) => x.id === programId);
      if (prog) {
        setName(prog.name);
        setTier(prog.tier ?? "");
        setDescription(prog.description ?? "");
        const c = prog.criteria as unknown as Record<string, unknown> | undefined;
        const loanAmount = (c?.loanAmount ?? c?.loan_amount) as
          | { minAmount?: number; maxAmount?: number }
          | undefined;
        setCriteria({
          ...defaultCriteria,
          ...prog.criteria,
          loanAmount:
            loanAmount?.minAmount != null && loanAmount?.maxAmount != null
              ? { minAmount: loanAmount.minAmount, maxAmount: loanAmount.maxAmount }
              : defaultCriteria.loanAmount,
        });
      }
      setLoading(false);
    });
  }, [lenderId, programId]);

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
      await updateProgram(lenderId, programId, {
        name,
        tier: tier || undefined,
        description: description || undefined,
        criteria,
      });
      router.push(`/lenders/${lenderId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update program"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading program…
      </div>
    );
  }

  const prog = policy?.programs.find((x) => x.id === programId);
  if (!policy || !prog) {
    return (
      <div className="space-y-4">
        <Link
          href={`/lenders/${lenderId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Lender
        </Link>
        <p className="text-muted-foreground">Program not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/lenders/${lenderId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← {policy.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          Edit program: {prog.name}
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
              required
            />
            <Input
              label="Tier (optional)"
              type="text"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="max-w-xs"
            />
            <Textarea
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </Card>

        <Card className="mb-6">
          <CardHeader title="Credit criteria" />
          <ProgramCriteriaForm criteria={criteria} onChange={setCriteria} />
        </Card>

        <FormActions
          submitLabel="Save changes"
          loadingLabel="Saving…"
          saving={saving}
          cancelHref={`/lenders/${lenderId}`}
        />
      </form>
    </div>
  );
}
