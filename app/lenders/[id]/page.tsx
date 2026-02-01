import Link from "next/link";
import { notFound } from "next/navigation";
import { getLenderPolicy } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui";
import { PolicyCriteriaView } from "./PolicyCriteriaView";

const btnPrimary =
  "inline-flex items-center justify-center rounded-[var(--border-radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark";
const btnOutline =
  "inline-flex items-center justify-center rounded-[var(--border-radius)] border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50";
const btnOutlineSm =
  "inline-flex items-center justify-center rounded-[var(--border-radius)] border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50";

export default async function LenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const policy = await getLenderPolicy(id);
  if (!policy) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/lenders"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Lender policies
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {policy.name}
          </h1>
          {policy.description && (
            <p className="mt-1 text-muted-foreground">{policy.description}</p>
          )}
          {policy.sourceDocument && (
            <p className="mt-1 text-xs text-muted-foreground">
              Source: {policy.sourceDocument}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/lenders/${id}/edit`} className={btnPrimary}>
            Edit policy
          </Link>
          <Link href="/lenders" className={btnOutline}>
            Back to list
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Policy overview"
          action={
            <span className="text-xs text-muted-foreground">
              Updated {new Date(policy.updatedAt).toLocaleDateString()}
            </span>
          }
        />
        <p className="text-sm text-muted-foreground">
          Edit lender details or add/edit programs and their criteria (FICO,
          PayNet, loan amount, time in business, geographic, industry,
          equipment).
        </p>
      </Card>

      <div className="flex justify-end">
        <Link href={`/lenders/${id}/programs/new`} className={btnPrimary}>
          Add program
        </Link>
      </div>

      {policy.programs.map((program) => (
        <Card key={program.id}>
          <CardHeader
            title={program.name}
            action={
              <div className="flex items-center gap-2">
                {program.tier && (
                  <span className="rounded-full bg-blue-lighter px-2.5 py-0.5 text-xs font-medium text-blue">
                    Tier {program.tier}
                  </span>
                )}
                <Link
                  href={`/lenders/${id}/programs/${program.id}/edit`}
                  className={btnOutlineSm}
                >
                  Edit rules
                </Link>
              </div>
            }
          />
          {program.description && (
            <p className="mb-4 text-sm text-muted-foreground">
              {program.description}
            </p>
          )}
          <PolicyCriteriaView criteria={program.criteria} />
        </Card>
      ))}
    </div>
  );
}
