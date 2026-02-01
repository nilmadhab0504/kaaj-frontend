import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication, getApplicationRuns, getMatchResults } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui";
import type { LenderMatchResult, CriterionResult } from "@/types";

function StatusBadge({
  eligible,
  children,
}: {
  eligible: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        eligible ? "bg-green-lighter text-green" : "bg-red-lighter text-red"
      }`}
    >
      {children}
    </span>
  );
}

export default async function MatchResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [app, runs, results] = await Promise.all([
    getApplication(id),
    getApplicationRuns(id),
    getMatchResults(id),
  ]);

  if (!app) notFound();

  const latestRun = runs[0];
  const isRunning = latestRun?.status === "running";

  const eligible = results.filter((r) => r.eligible);
  const ineligible = results.filter((r) => !r.eligible);
  const sortedEligible = [...eligible].sort((a, b) => b.fitScore - a.fitScore);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/applications/${id}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Application {id}
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            Lender match results
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {app.business.industry}, {app.business.state} · $
            {app.loanRequest.amount.toLocaleString()} · FICO {app.guarantor.ficoScore}
          </p>
        </div>
        <Link
          href={`/applications/${id}`}
          className="inline-flex items-center justify-center rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary-lighter hover:text-primary"
        >
          Back to application
        </Link>
      </div>

      {isRunning ? (
        <Card className="border-blue/30 bg-blue-lighter/20">
          <p className="text-sm font-medium text-blue">
            Underwriting in progress. Results will appear when the run completes.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Refresh the page in a moment to see results.
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader title="Summary" />
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Eligible lenders </span>
                <span className="font-semibold text-green">{eligible.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Not eligible </span>
                <span className="font-semibold text-foreground">
                  {ineligible.length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total evaluated </span>
                <span className="font-semibold text-foreground">{results.length}</span>
              </div>
            </div>
          </Card>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Best matches
            </h2>
            <div className="space-y-4">
              {sortedEligible.length === 0 ? (
                <Card>
                  <p className="text-muted-foreground">
                    No lenders met all criteria for this application. Review
                    ineligible lenders below for specific reasons.
                  </p>
                </Card>
              ) : (
                sortedEligible.map((match) => (
                  <MatchCard key={match.lenderId} match={match} />
                ))
              )}
            </div>
          </section>

          {ineligible.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Not eligible
              </h2>
              <div className="space-y-4">
                {ineligible.map((match) => (
                  <MatchCard key={match.lenderId} match={match} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: LenderMatchResult }) {
  return (
    <Card
      className={
        match.eligible ? "" : "border-red/30"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-foreground">{match.lenderName}</h3>
            <StatusBadge eligible={match.eligible}>
              {match.eligible ? "Eligible" : "Not eligible"}
            </StatusBadge>
            <span className="rounded-full bg-blue-lighter px-2.5 py-0.5 text-xs font-medium text-blue">
              Fit score: {match.fitScore}
            </span>
          </div>
          {match.bestProgram && (
            <p className="mt-1 text-sm text-muted-foreground">
              Best program: {match.bestProgram.name}
              {match.bestProgram.tier && ` (Tier ${match.bestProgram.tier})`}
            </p>
          )}
          {match.rejectionReasons.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm text-red">
              {match.rejectionReasons.map((reason, idx) => (
                <li key={`${match.lenderId}-rejection-${idx}-${reason.slice(0, 30)}`}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">
          Criteria breakdown
        </h4>
        <ul className="space-y-2">
          {match.criteriaResults.map((c) => (
            <CriterionRow key={c.name} criterion={c} />
          ))}
        </ul>
      </div>
    </Card>
  );
}

function CriterionRow({ criterion }: { criterion: CriterionResult }) {
  return (
    <li className="flex flex-wrap items-start gap-2 text-sm">
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          criterion.met ? "bg-green-lighter text-green" : "bg-red-lighter text-red"
        }`}
        title={criterion.met ? "Met" : "Not met"}
      >
        {criterion.met ? "✓" : "✗"}
      </span>
      <div className="min-w-0 flex-1">
        <span className="font-medium text-foreground">{criterion.name}</span>
        {" — "}
        <span className={criterion.met ? "text-muted-foreground" : "text-red"}>
          {criterion.reason}
        </span>
        {(criterion.expected || criterion.actual) && (
          <span className="block text-muted-foreground">
            {criterion.expected && `Required: ${criterion.expected}`}
            {criterion.expected && criterion.actual && " · "}
            {criterion.actual && `Actual: ${criterion.actual}`}
          </span>
        )}
      </div>
    </li>
  );
}
