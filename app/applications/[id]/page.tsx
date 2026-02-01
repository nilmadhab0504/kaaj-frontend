import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui";
import { RunUnderwritingButton } from "./RunUnderwritingButton";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/applications"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            ← Applications
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Application {app.id}
          </h1>
          <StatusBadge status={app.status} />
        </div>
        <div className="flex gap-2">
          {(app.status === "draft" ||
            app.status === "submitted" ||
            app.status === "completed") && (
            <RunUnderwritingButton applicationId={app.id} />
          )}
          {(app.status === "submitted" || app.status === "completed") && (
            <Link
              href={`/applications/${app.id}/results`}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              View match results
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Business" />
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Industry</dt>
              <dd className="font-medium text-foreground">{app.business.industry}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">State</dt>
              <dd className="font-medium text-foreground">{app.business.state}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Years in business</dt>
              <dd className="font-medium text-foreground">
                {app.business.yearsInBusiness}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Annual revenue</dt>
              <dd className="font-medium text-foreground">
                ${app.business.annualRevenue.toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Personal guarantor" />
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">FICO score</dt>
              <dd className="font-medium text-foreground">
                {app.guarantor.ficoScore}
              </dd>
            </div>
            {app.guarantor.hasBankruptcy !== undefined && (
              <div>
                <dt className="text-muted-foreground">Bankruptcy</dt>
                <dd className="font-medium text-foreground">
                  {app.guarantor.hasBankruptcy ? "Yes" : "No"}
                </dd>
              </div>
            )}
            {app.guarantor.hasTaxLiens !== undefined && (
              <div>
                <dt className="text-muted-foreground">Tax liens</dt>
                <dd className="font-medium text-foreground">
                  {app.guarantor.hasTaxLiens ? "Yes" : "No"}
                </dd>
              </div>
            )}
            {app.guarantor.hasJudgments !== undefined && (
              <div>
                <dt className="text-muted-foreground">Judgments</dt>
                <dd className="font-medium text-foreground">
                  {app.guarantor.hasJudgments ? "Yes" : "No"}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {app.businessCredit && (
          <Card>
            <CardHeader title="Business credit" />
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {app.businessCredit.paynetScore != null && (
                <div>
                  <dt className="text-muted-foreground">PayNet score</dt>
                  <dd className="font-medium text-foreground">
                    {app.businessCredit.paynetScore}
                  </dd>
                </div>
              )}
              {app.businessCredit.tradeLinesCount != null && (
                <div>
                  <dt className="text-muted-foreground">Trade lines</dt>
                  <dd className="font-medium text-foreground">
                    {app.businessCredit.tradeLinesCount}
                  </dd>
                </div>
              )}
              {app.businessCredit.averageTradeAgeMonths != null && (
                <div>
                  <dt className="text-muted-foreground">Avg trade age (mo)</dt>
                  <dd className="font-medium text-foreground">
                    {app.businessCredit.averageTradeAgeMonths}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardHeader title="Loan request" />
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium text-foreground">
                ${app.loanRequest.amount.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Term</dt>
              <dd className="font-medium text-foreground">
                {app.loanRequest.termMonths} months
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Equipment type</dt>
              <dd className="font-medium text-foreground">
                {app.loanRequest.equipment.type}
              </dd>
            </div>
            {app.loanRequest.equipment.ageYears != null && (
              <div>
                <dt className="text-muted-foreground">Equipment age</dt>
                <dd className="font-medium text-foreground">
                  {app.loanRequest.equipment.ageYears} years
                </dd>
              </div>
            )}
            {app.loanRequest.equipment.cost != null && (
              <div>
                <dt className="text-muted-foreground">Equipment cost</dt>
                <dd className="font-medium text-foreground">
                  ${app.loanRequest.equipment.cost.toLocaleString()}
                </dd>
              </div>
            )}
            {app.loanRequest.purpose && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Purpose</dt>
                <dd className="font-medium text-foreground">
                  {app.loanRequest.purpose}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Created {new Date(app.createdAt).toLocaleString()}
        {" · "}
        Updated {new Date(app.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
