import Link from "next/link";
import { listLenderPolicies } from "@/lib/api";
import { Card } from "@/components/ui";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function LendersPage() {
  const lenders = await listLenderPolicies();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Lender policies</h1>
        <Link
          href="/lenders/new"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Add lender
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        View and edit credit policies. Add lenders and programs, or edit criteria
        (FICO, PayNet, loan amount, time in business, geographic, industry,
        equipment).
      </p>

      <Card>
        {lenders.length === 0 ? (
          <EmptyState
            title="No lender policies loaded"
            description="Import lender guidelines (PDF) to create policies."
          />
        ) : (
          <ul className="divide-y divide-border">
            {lenders.map((lender) => (
              <li
                key={lender.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0"
              >
                <div>
                  <Link
                    href={`/lenders/${lender.id}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {lender.name}
                  </Link>
                  {lender.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {lender.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lender.programs.length} program
                    {lender.programs.length !== 1 ? "s" : ""}
                    {lender.sourceDocument && ` · ${lender.sourceDocument}`}
                  </p>
                </div>
                <Link
                  href={`/lenders/${lender.id}`}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary-lighter hover:text-primary"
                >
                  View / Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
