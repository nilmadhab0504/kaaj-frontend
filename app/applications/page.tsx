import Link from "next/link";
import { listApplications } from "@/lib/api";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function ApplicationsPage() {
  const applications = await listApplications();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Loan Applications</h1>
        <Link
          href="/applications/new"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          New Application
        </Link>
      </div>

      <Card>
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            action={
            <Link
              href="/applications/new"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Create your first application
            </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Business</th>
                  <th className="pb-3 pr-4 font-medium">Loan</th>
                  <th className="pb-3 pr-4 font-medium">FICO</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Updated</th>
                  <th className="pb-3 pl-2"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-border last:border-0">
                    <td className="py-4 pr-4">
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {app.business.industry}, {app.business.state}
                      </Link>
                      <p className="text-muted-foreground">
                        {app.business.yearsInBusiness} yrs · $
                        {app.business.annualRevenue.toLocaleString()} revenue
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      ${app.loanRequest.amount.toLocaleString()}
                      <p className="text-muted-foreground">{app.loanRequest.termMonths} mo</p>
                    </td>
                    <td className="py-4 pr-4">{app.guarantor.ficoScore}</td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pl-2">
                      <div className="flex gap-2">
                        <Link
                          href={`/applications/${app.id}`}
                          className="rounded-xl px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary-lighter hover:text-primary"
                        >
                          View
                        </Link>
                        {(app.status === "submitted" || app.status === "completed") && (
                          <Link
                            href={`/applications/${app.id}/results`}
                            className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary-lighter hover:text-primary"
                          >
                            Results
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
