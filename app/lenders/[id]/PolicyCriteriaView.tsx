import type { LenderPolicyCriteria } from "@/types";

export function PolicyCriteriaView({ criteria }: { criteria: LenderPolicyCriteria }) {
  const items: { label: string; value: string }[] = [];

  if (criteria.fico) {
    const f = criteria.fico;
    if (f.tiered?.length) {
      items.push({
        label: "FICO (tiered)",
        value: f.tiered.map((t) => `${t.programName}: ≥ ${t.minScore}`).join("; "),
      });
    } else {
      items.push({
        label: "FICO minimum",
        value: `≥ ${f.minScore}${f.maxScore != null ? `, ≤ ${f.maxScore}` : ""}`,
      });
    }
  }

  if (criteria.paynet) {
    const p = criteria.paynet;
    const parts: string[] = [];
    if (p.minScore != null) parts.push(`≥ ${p.minScore}`);
    if (p.maxScore != null) parts.push(`≤ ${p.maxScore}`);
    if (parts.length) items.push({ label: "PayNet score", value: parts.join(", ") });
  }

  items.push({
    label: "Loan amount",
    value: `$${criteria.loanAmount.minAmount.toLocaleString()} – $${criteria.loanAmount.maxAmount.toLocaleString()}`,
  });

  if (criteria.timeInBusiness) {
    items.push({
      label: "Time in business",
      value: `≥ ${criteria.timeInBusiness.minYears} years`,
    });
  }

  if (criteria.geographic) {
    const g = criteria.geographic;
    if (g.allowedStates?.length) {
      items.push({ label: "States allowed", value: g.allowedStates.join(", ") });
    }
    if (g.excludedStates?.length) {
      items.push({ label: "States excluded", value: g.excludedStates.join(", ") });
    }
  }

  if (criteria.industry) {
    const i = criteria.industry;
    if (i.allowedIndustries?.length) {
      items.push({ label: "Industries allowed", value: i.allowedIndustries.join(", ") });
    }
    if (i.excludedIndustries?.length) {
      items.push({ label: "Industries excluded", value: i.excludedIndustries.join(", ") });
    }
  }

  if (criteria.equipment) {
    const e = criteria.equipment;
    if (e.allowedTypes?.length) {
      items.push({ label: "Equipment allowed", value: e.allowedTypes.join(", ") });
    }
    if (e.excludedTypes?.length) {
      items.push({ label: "Equipment excluded", value: e.excludedTypes.join(", ") });
    }
    if (e.maxEquipmentAgeYears != null) {
      items.push({ label: "Max equipment age", value: `≤ ${e.maxEquipmentAgeYears} years` });
    }
  }

  if (criteria.minRevenue != null) {
    items.push({
      label: "Minimum revenue",
      value: `$${criteria.minRevenue.toLocaleString()}`,
    });
  }

  if (criteria.customRules?.length) {
    items.push({
      label: "Custom rules",
      value: criteria.customRules.map((r) => r.name).join("; "),
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No criteria defined.</p>;
  }

  return (
    <dl className="grid gap-2 text-sm sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
