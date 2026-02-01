"use client";

import type { LenderPolicyCriteria } from "@/types";
import { Input } from "rizzui";

function commaList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function fromList(arr: string[] | undefined): string {
  return arr?.join(", ") ?? "";
}

interface ProgramCriteriaFormProps {
  criteria: LenderPolicyCriteria;
  onChange: (c: LenderPolicyCriteria) => void;
}

export function ProgramCriteriaForm({ criteria, onChange }: ProgramCriteriaFormProps) {
  const update = (partial: Partial<LenderPolicyCriteria>) => {
    onChange({ ...criteria, ...partial });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Loan min amount ($) *"
          type="number"
          min={0}
          step={1}
          value={criteria.loanAmount?.minAmount ?? ""}
          onChange={(e) =>
            update({
              loanAmount: {
                ...criteria.loanAmount,
                minAmount: Number(e.target.value) || 0,
                maxAmount: criteria.loanAmount?.maxAmount ?? 0,
              },
            })
          }
          required
        />
        <Input
          label="Loan max amount ($) *"
          type="number"
          min={0}
          step={1}
          value={criteria.loanAmount?.maxAmount ?? ""}
          onChange={(e) =>
            update({
              loanAmount: {
                ...criteria.loanAmount,
                minAmount: criteria.loanAmount?.minAmount ?? 0,
                maxAmount: Number(e.target.value) || 0,
              },
            })
          }
          required
        />
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">FICO score</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Min score (300–850)"
            type="number"
            min={300}
            max={850}
            value={criteria.fico?.minScore ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (!raw) {
                update({ fico: undefined });
                return;
              }
              const minScore = Number(raw);
              update({
                fico: criteria.fico
                  ? { ...criteria.fico, minScore, maxScore: criteria.fico.maxScore }
                  : { minScore },
              });
            }}
            placeholder="e.g. 680"
          />
          <Input
            label="Max score (optional)"
            type="number"
            min={300}
            max={850}
            value={criteria.fico?.maxScore ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (!raw) {
                if (!criteria.fico) return;
                update({
                  fico: { ...criteria.fico, maxScore: undefined },
                });
                return;
              }
              const maxScore = Number(raw);
              update({
                fico: {
                  ...(criteria.fico ?? { minScore: 300 }),
                  minScore: criteria.fico?.minScore ?? 300,
                  maxScore,
                },
              });
            }}
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">PayNet score</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Min score (0–100)"
            type="number"
            min={0}
            max={100}
            value={criteria.paynet?.minScore ?? ""}
            onChange={(e) =>
              update({
                paynet: {
                  ...criteria.paynet,
                  minScore: e.target.value ? Number(e.target.value) : undefined,
                  maxScore: criteria.paynet?.maxScore,
                },
              })
            }
          />
          <Input
            label="Max score (optional)"
            type="number"
            min={0}
            max={100}
            value={criteria.paynet?.maxScore ?? ""}
            onChange={(e) =>
              update({
                paynet: {
                  ...criteria.paynet,
                  minScore: criteria.paynet?.minScore,
                  maxScore: e.target.value ? Number(e.target.value) : undefined,
                },
              })
            }
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">Time in business</h4>
        <Input
          label="Minimum years"
          type="number"
          min={0}
          max={100}
          value={criteria.timeInBusiness?.minYears ?? ""}
          onChange={(e) =>
            update({
              timeInBusiness: e.target.value
                ? { minYears: Number(e.target.value) }
                : undefined,
            })
          }
          placeholder="e.g. 2"
          className="max-w-xs"
        />
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">
          Geographic restrictions
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Allowed states (comma-separated, e.g. CA, TX)"
            value={fromList(criteria.geographic?.allowedStates)}
            onChange={(e) =>
              update({
                geographic: {
                  ...criteria.geographic,
                  allowedStates: commaList(e.target.value).length
                    ? commaList(e.target.value)
                    : undefined,
                  excludedStates: criteria.geographic?.excludedStates,
                },
              })
            }
          />
          <Input
            label="Excluded states (comma-separated)"
            value={fromList(criteria.geographic?.excludedStates)}
            onChange={(e) =>
              update({
                geographic: {
                  ...criteria.geographic,
                  allowedStates: criteria.geographic?.allowedStates,
                  excludedStates: commaList(e.target.value).length
                    ? commaList(e.target.value)
                    : undefined,
                },
              })
            }
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">
          Industry restrictions
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Allowed industries (comma-separated)"
            value={fromList(criteria.industry?.allowedIndustries)}
            onChange={(e) =>
              update({
                industry: {
                  ...criteria.industry,
                  allowedIndustries: commaList(e.target.value).length
                    ? commaList(e.target.value)
                    : undefined,
                  excludedIndustries: criteria.industry?.excludedIndustries,
                },
              })
            }
          />
          <Input
            label="Excluded industries (e.g. Trucking)"
            value={fromList(criteria.industry?.excludedIndustries)}
            onChange={(e) =>
              update({
                industry: {
                  ...criteria.industry,
                  allowedIndustries: criteria.industry?.allowedIndustries,
                  excludedIndustries: commaList(e.target.value).length
                    ? commaList(e.target.value)
                    : undefined,
                },
              })
            }
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">
          Equipment restrictions
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Allowed types (comma-separated)"
            value={fromList(criteria.equipment?.allowedTypes)}
            onChange={(e) =>
              update({
                equipment: {
                  ...criteria.equipment,
                  allowedTypes: commaList(e.target.value).length
                    ? commaList(e.target.value)
                    : undefined,
                  excludedTypes: criteria.equipment?.excludedTypes,
                  maxEquipmentAgeYears: criteria.equipment?.maxEquipmentAgeYears,
                },
              })
            }
          />
          <Input
            label="Excluded types"
            value={fromList(criteria.equipment?.excludedTypes)}
            onChange={(e) =>
              update({
                equipment: {
                  ...criteria.equipment,
                  allowedTypes: criteria.equipment?.allowedTypes,
                  excludedTypes: commaList(e.target.value).length
                    ? commaList(e.target.value)
                    : undefined,
                  maxEquipmentAgeYears: criteria.equipment?.maxEquipmentAgeYears,
                },
              })
            }
          />
          <Input
            label="Max equipment age (years)"
            type="number"
            min={0}
            max={50}
            value={criteria.equipment?.maxEquipmentAgeYears ?? ""}
            onChange={(e) =>
              update({
                equipment: {
                  ...criteria.equipment,
                  maxEquipmentAgeYears: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                },
              })
            }
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">
          Minimum revenue
        </h4>
        <Input
          label="Minimum annual revenue ($)"
          type="number"
          min={0}
          step={1}
          value={criteria.minRevenue ?? ""}
          onChange={(e) =>
            update({
              minRevenue: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="max-w-xs"
        />
      </div>
    </div>
  );
}
