import Link from "next/link";
import { listApplications, listLenderPolicies } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui";

export default async function HomePage() {
  const [applications, lenders] = await Promise.all([
    listApplications(),
    listLenderPolicies(),
  ]);

  const submitted = applications.filter((a) => a.status !== "draft");
  const drafts = applications.filter((a) => a.status === "draft");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Lender Matching Platform
        </h1>
        <Link
          href="/applications/new"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          New Application
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader title="Applications" />
          <p className="text-3xl font-semibold text-foreground">
            {applications.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {submitted.length} submitted, {drafts.length} draft
          </p>
          <Link
            href="/applications"
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-blue-lighter"
          >
            View all
          </Link>
        </Card>

        <Card>
          <CardHeader title="Lender Policies" />
          <p className="text-3xl font-semibold text-foreground">
            {lenders.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Active credit policies
          </p>
          <Link
            href="/lenders"
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-blue-lighter"
          >
            Manage policies
          </Link>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader title="Quick actions" />
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/applications/new"
                className="font-medium text-primary hover:underline"
              >
                Submit a new loan application
              </Link>
            </li>
            <li>
              <Link
                href="/applications"
                className="font-medium text-primary hover:underline"
              >
                View and run underwriting on applications
              </Link>
            </li>
            <li>
              <Link
                href="/lenders"
                className="font-medium text-primary hover:underline"
              >
                View or edit lender policies
              </Link>
            </li>
          </ul>
        </Card>
      </div>

      {submitted.length > 0 && (
        <Card>
          <CardHeader
            title="Recent applications"
            action={
              <Link
                href="/applications"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            }
          />
          <ul className="divide-y divide-border">
            {submitted.slice(0, 5).map((app) => (
              <li key={app.id} className="flex items-center justify-between py-3 first:pt-0">
                <div>
                  <Link
                    href={`/applications/${app.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {app.business.industry} · {app.business.state} · $
                    {app.loanRequest.amount.toLocaleString()}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {app.status} · Updated {new Date(app.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/applications/${app.id}/results`}
                  className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-blue-lighter"
                >
                  Results
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
