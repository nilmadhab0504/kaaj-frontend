"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLender, parseLenderPdf, type ParsedProgram } from "@/lib/api";
import type { LenderPolicyCriteria } from "@/types";
import { Card, CardHeader } from "@/components/ui";
import { FormActions } from "@/components/shared/FormActions";
import { Button, Input, Alert } from "rizzui";
import { ProgramCriteriaForm } from "@/app/lenders/[id]/programs/ProgramCriteriaForm";

const defaultCriteria: LenderPolicyCriteria = {
  loanAmount: { minAmount: 10000, maxAmount: 500000 },
};

function createEmptyProgram(): ParsedProgram & { id: string } {
  return {
    id: `prog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "Standard Program",
    tier: undefined,
    criteria: { ...defaultCriteria },
  };
}

export default function NewLenderPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [programs, setPrograms] = useState<(ParsedProgram & { id: string })[]>([
    createEmptyProgram(),
  ]);

  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSlugFromName = () => {
    if (!slug && name) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setParseSuccess(false);
    setParsing(true);
    try {
      const result = await parseLenderPdf(file);
      setName(result.suggestedName);
      setSlug(result.suggestedSlug);
      if (result.programs && result.programs.length > 0) {
        setPrograms(
          result.programs.map((p) => {
            const base = createEmptyProgram();
            return {
              ...base,
              name: p.name,
              tier: p.tier,
              criteria: {
                ...defaultCriteria,
                ...p.criteria,
                loanAmount:
                  p.criteria?.loanAmount ?? defaultCriteria.loanAmount,
              },
            };
          })
        );
      } else {
        setPrograms([createEmptyProgram()]);
      }
      setParseSuccess(true);
    } catch (err) {
      setParseError(
        err instanceof Error
          ? err.message
          : "Failed to parse PDF. Please enter the details manually below."
      );
    } finally {
      setParsing(false);
      e.target.value = "";
    }
  };

  const updateProgram = (idx: number, updates: Partial<ParsedProgram>) => {
    setPrograms((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, ...updates } : p))
    );
  };

  const addProgram = () => {
    setPrograms((prev) => {
      const next = prev.length + 1;
      const newProg = createEmptyProgram();
      newProg.name = `Tier ${next}`;
      newProg.tier = String(next);
      return [...prev, newProg];
    });
  };

  const removeProgram = (idx: number) => {
    if (programs.length <= 1) return;
    setPrograms((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const invalid = programs.find(
      (p) =>
        !p.criteria?.loanAmount ||
        (p.criteria.loanAmount.minAmount === 0 &&
          p.criteria.loanAmount.maxAmount === 0)
    );
    if (invalid) {
      setSubmitError(
        `Loan amount min and max are required for "${invalid.name}".`
      );
      return;
    }
    setSaving(true);
    try {
      const policy = await createLender({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        programs: programs.map((p) => ({
          name: p.name,
          tier: p.tier || undefined,
          criteria: p.criteria,
        })),
      });
      router.push(`/lenders/${policy.id}`);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create lender"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/lenders"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Lender policies
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Add lender</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a PDF to auto-fill the form, or enter the details manually
          below. PDFs with multiple tiers (Tier 1, Tier 2, etc.) will be parsed
          as separate programs.
        </p>
      </div>

      <Card>
        <CardHeader title="Upload PDF (optional)" />
        <p className="mb-4 text-sm text-muted-foreground">
          Upload your lender guideline PDF and we&apos;ll try to extract the
          details including multiple tiers/programs. If parsing fails, enter the
          information manually below.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="solid"
          size="md"
          onClick={() => fileInputRef.current?.click()}
          disabled={parsing}
          isLoading={parsing}
        >
          {parsing ? "Parsing…" : "Choose PDF"}
        </Button>
        {parseSuccess && (
          <Alert color="success" size="md" className="mt-3">
            ✓ PDF parsed successfully. {programs.length} program(s) extracted.
            Review and edit below before submitting.
          </Alert>
        )}
        {parseError && (
          <Alert color="danger" size="md" className="mt-3">
            {parseError}
          </Alert>
        )}
      </Card>

      <form onSubmit={handleSubmit}>
        {submitError && (
          <Alert color="danger" size="md" className="mb-4">
            {submitError}
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader title="Lender details" />
          <div className="space-y-4">
            <Input
              label="Name *"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSlugFromName}
              placeholder="e.g. Acme Equipment Finance"
              required
            />
            <Input
              label="Slug (auto-generated from name) *"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. acme-equipment-finance"
              required
            />
          </div>
        </Card>

        {programs.map((program, idx) => (
          <Card key={program.id} className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <CardHeader title={`Program ${idx + 1}: ${program.name}`} />
              <div className="flex gap-2">
                {programs.length > 1 && (
                  <Button
                    type="button"
                    variant="flat"
                    size="md"
                    onClick={() => removeProgram(idx)}
                    className="bg-red-lighter text-red hover:bg-red/20"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Set loan amount min/max and other criteria (FICO, PayNet, time in
              business, geographic, industry, equipment).
            </p>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Program name *"
                  type="text"
                  value={program.name}
                  onChange={(e) => updateProgram(idx, { name: e.target.value })}
                  placeholder="e.g. Tier 1"
                  required
                />
                <Input
                  label="Tier (optional)"
                  type="text"
                  value={program.tier ?? ""}
                  onChange={(e) =>
                    updateProgram(idx, { tier: e.target.value || undefined })
                  }
                  placeholder="e.g. 1 or A"
                />
              </div>
              <ProgramCriteriaForm
                criteria={program.criteria}
                onChange={(c) => updateProgram(idx, { criteria: c })}
              />
            </div>
          </Card>
        ))}

        <div className="mb-6">
          <Button type="button" variant="outline" size="md" onClick={addProgram}>
            + Add program
          </Button>
        </div>

        <FormActions
          submitLabel="Create lender"
          loadingLabel="Creating…"
          saving={saving}
          cancelHref="/lenders"
        />
      </form>
    </div>
  );
}
