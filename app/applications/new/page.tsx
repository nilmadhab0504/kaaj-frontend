"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createApplication } from "@/lib/api";
import type {
  Business,
  PersonalGuarantor,
  BusinessCredit,
  LoanRequest,
  EquipmentDetails,
} from "@/types";
import { Card, CardHeader } from "@/components/ui";
import { FormActions } from "@/components/shared/FormActions";
import { Alert, Input, Select } from "rizzui";
import type { SelectOption } from "rizzui";
import { US_STATES, INDUSTRIES, EQUIPMENT_TYPES, LOAN_TERMS } from "@/config/constants";

const initialBusiness: Business = {
  industry: "",
  state: "",
  yearsInBusiness: 0,
  annualRevenue: 0,
};

const initialGuarantor: PersonalGuarantor = {
  ficoScore: 0,
};

const initialCredit: BusinessCredit = {
  paynetScore: undefined,
};

const initialEquipment: EquipmentDetails = {
  type: "",
  ageYears: undefined,
};

const initialLoan: LoanRequest = {
  amount: 0,
  termMonths: 36,
  equipment: initialEquipment,
};

const industryOptions: SelectOption[] = INDUSTRIES.map((i) => ({ value: i, label: i }));
const stateOptions: SelectOption[] = US_STATES.map((s) => ({ value: s, label: s }));
const equipmentOptions: SelectOption[] = EQUIPMENT_TYPES.map((t) => ({ value: t, label: t }));
const termOptions: SelectOption[] = LOAN_TERMS.map((n) => ({ value: n, label: String(n) }));

/** Get string value from a Select: either a plain string or an option object { value, label }. */
function selectValue(v: string | { value?: string; label?: string } | undefined): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v.value ?? "");
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [business, setBusiness] = useState(initialBusiness);
  const [guarantor, setGuarantor] = useState(initialGuarantor);
  const [businessCredit, setBusinessCredit] = useState(initialCredit);
  const [loanRequest, setLoanRequest] = useState(initialLoan);

  const updateBusiness = (k: keyof Business, v: string | number) =>
    setBusiness((b) => ({ ...b, [k]: v }));
  const updateGuarantor = (k: keyof PersonalGuarantor, v: string | number | boolean | undefined) =>
    setGuarantor((g) => ({ ...g, [k]: v }));
  const updateCredit = (k: keyof BusinessCredit, v: number | undefined) =>
    setBusinessCredit((c) => ({ ...c, [k]: v }));
  const updateLoan = (
    k: keyof LoanRequest,
    v: number | string | EquipmentDetails | undefined
  ) => setLoanRequest((l) => ({ ...l, [k]: v }));
  const updateEquipment = (k: keyof EquipmentDetails, v: string | number | undefined) =>
    setLoanRequest((l) => ({ ...l, equipment: { ...l.equipment, [k]: v } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const app = await createApplication({
        business: {
          ...business,
          industry: selectValue(business.industry),
          state: selectValue(business.state),
        },
        guarantor,
        businessCredit: Object.keys(businessCredit).some(
          (k) =>
            (businessCredit as Record<string, unknown>)[k] !== undefined &&
            (businessCredit as Record<string, unknown>)[k] !== ""
        )
          ? businessCredit
          : undefined,
        loanRequest: {
          ...loanRequest,
          equipment: {
            ...loanRequest.equipment,
            type: selectValue(loanRequest.equipment?.type),
          },
        },
      });
      router.push(`/applications/${app.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create application");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/applications"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Applications
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Loan Application</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <Alert color="danger" size="md">
            {error}
          </Alert>
        )}

        <Card>
          <CardHeader title="Business" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Industry"
              options={industryOptions}
              value={business.industry}
              onChange={(v) => updateBusiness("industry", v as string)}
              placeholder="Select industry"
            />
            <Select
              label="State"
              options={stateOptions}
              value={business.state}
              onChange={(v) => updateBusiness("state", v as string)}
              placeholder="Select state"
            />
            <Input
              label="Years in business"
              type="number"
              min={0}
              max={100}
              value={business.yearsInBusiness || ""}
              onChange={(e) =>
                updateBusiness("yearsInBusiness", Number(e.target.value) || 0)
              }
              required
            />
            <Input
              label="Annual revenue ($)"
              type="number"
              min={0}
              step={1}
              value={business.annualRevenue || ""}
              onChange={(e) =>
                updateBusiness("annualRevenue", Number(e.target.value) || 0)
              }
              className="sm:col-span-2"
              required
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Personal Guarantor" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="FICO score"
              type="number"
              min={300}
              max={850}
              value={guarantor.ficoScore || ""}
              onChange={(e) =>
                updateGuarantor("ficoScore", Number(e.target.value) || 0)
              }
              required
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Business credit (optional)" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="PayNet score"
              type="number"
              min={0}
              max={100}
              value={businessCredit.paynetScore ?? ""}
              onChange={(e) =>
                updateCredit(
                  "paynetScore",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Loan request" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount ($)"
              type="number"
              min={1000}
              step={1}
              value={loanRequest.amount || ""}
              onChange={(e) =>
                updateLoan("amount", Number(e.target.value) || 0)
              }
              required
            />
            <Select
              label="Term (months)"
              options={termOptions}
              value={loanRequest.termMonths}
              onChange={(v) => updateLoan("termMonths", Number(v))}
            />
            <Select
              label="Equipment type"
              options={equipmentOptions}
              value={loanRequest.equipment.type}
              onChange={(v) => updateEquipment("type", v as string)}
              placeholder="Select type"
            />
            <Input
              label="Equipment age (years, optional)"
              type="number"
              min={0}
              max={50}
              value={loanRequest.equipment.ageYears ?? ""}
              onChange={(e) =>
                updateEquipment(
                  "ageYears",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </Card>

        <FormActions
          submitLabel="Save application"
          loadingLabel="Saving…"
          saving={saving}
          cancelHref="/applications"
        />
      </form>
    </div>
  );
}
