import type {
  LoanApplication,
  LenderPolicy,
  UnderwritingRun,
  LenderMatchResult,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  return res.json() as Promise<T>;
}

// Applications
export async function listApplications(): Promise<LoanApplication[]> {
  try {
    return await fetchApi<LoanApplication[]>("/api/applications");
  } catch {
    return getMockApplications();
  }
}

export async function getApplication(id: string): Promise<LoanApplication | null> {
  try {
    return await fetchApi<LoanApplication>(`/api/applications/${id}`);
  } catch {
    return getMockApplications().find((a) => a.id === id) ?? null;
  }
}

export async function createApplication(
  data: Omit<LoanApplication, "id" | "createdAt" | "updatedAt" | "status">
): Promise<LoanApplication> {
  try {
    return await fetchApi<LoanApplication>("/api/applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    const app: LoanApplication = {
      ...data,
      id: `app-${Date.now()}`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return app;
  }
}

export async function submitApplication(id: string): Promise<LoanApplication> {
  try {
    return await fetchApi<LoanApplication>(`/api/applications/${id}/submit`, {
      method: "POST",
    });
  } catch {
    const list = getMockApplications();
    const app = list.find((a) => a.id === id);
    if (app) {
      return { ...app, status: "submitted", submittedAt: new Date().toISOString() };
    }
    throw new Error("Application not found");
  }
}

// Underwriting
export async function startUnderwriting(applicationId: string): Promise<UnderwritingRun> {
  try {
    return await fetchApi<UnderwritingRun>(`/api/applications/${applicationId}/underwrite`, {
      method: "POST",
    });
  } catch {
    return getMockUnderwritingRun(applicationId);
  }
}

export async function getUnderwritingRun(runId: string): Promise<UnderwritingRun | null> {
  try {
    return await fetchApi<UnderwritingRun>(`/api/underwriting/${runId}`);
  } catch {
    return getMockUnderwritingRun(runId.replace("run-", "app-"));
  }
}

export async function getMatchResults(applicationId: string): Promise<LenderMatchResult[]> {
  try {
    const run = await fetchApi<UnderwritingRun[]>(
      `/api/applications/${applicationId}/runs`
    ).then((runs) => runs[0]);
    return run?.results ?? [];
  } catch {
    return getMockMatchResults();
  }
}

// Lenders
export async function listLenderPolicies(): Promise<LenderPolicy[]> {
  try {
    return await fetchApi<LenderPolicy[]>("/api/lenders");
  } catch {
    return getMockLenderPolicies();
  }
}

export async function getLenderPolicy(id: string): Promise<LenderPolicy | null> {
  try {
    return await fetchApi<LenderPolicy>(`/api/lenders/${id}`);
  } catch {
    return getMockLenderPolicies().find((l) => l.id === id) ?? null;
  }
}

export async function updateLenderPolicy(
  id: string,
  data: Partial<Pick<LenderPolicy, "name" | "slug" | "description" | "sourceDocument">>
): Promise<LenderPolicy> {
  try {
    return await fetchApi<LenderPolicy>(`/api/lenders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } catch {
    const policy = getMockLenderPolicies().find((l) => l.id === id);
    if (policy) return { ...policy, ...data, updatedAt: new Date().toISOString() };
    throw new Error("Lender not found");
  }
}

export interface ParsedProgram {
  id?: string;
  name: string;
  tier?: string;
  criteria: import("@/types").LenderPolicyCriteria;
}

export interface ParseLenderPdfResult {
  suggestedName: string;
  suggestedSlug: string;
  sourceDocument?: string;
  /** Parsed programs (tiers). Multiple when PDF contains Tier 1, Tier 2, etc. */
  programs: ParsedProgram[];
}

export async function parseLenderPdf(file: File): Promise<ParseLenderPdfResult> {
  const formData = new FormData();
  formData.append("file", file);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/lenders/parse-pdf`, {
      method: "POST",
      body: formData,
    });
  } catch (e) {
    if (e instanceof TypeError && (e.message === "Failed to fetch" || e.message.includes("fetch"))) {
      throw new Error(
        "Could not reach the server. Make sure the backend is running (python run.py from the backend folder) and accessible at " +
          API_BASE
      );
    }
    throw e;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  return res.json() as Promise<ParseLenderPdfResult>;
}

export async function createLender(data: {
  name: string;
  slug: string;
  description?: string;
  sourceDocument?: string;
  programs?: { name: string; tier?: string; description?: string; criteria: import("@/types").LenderPolicyCriteria }[];
}): Promise<LenderPolicy> {
  try {
    return await fetchApi<LenderPolicy>("/api/lenders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (e) {
    throw e;
  }
}

export async function createProgram(
  lenderId: string,
  data: { name: string; tier?: string; description?: string; criteria: import("@/types").LenderPolicyCriteria }
): Promise<import("@/types").LenderProgram> {
  try {
    return await fetchApi<import("@/types").LenderProgram>(`/api/lenders/${lenderId}/programs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (e) {
    throw e;
  }
}

export async function updateProgram(
  lenderId: string,
  programId: string,
  data: Partial<{ name: string; tier?: string; description?: string; criteria: import("@/types").LenderPolicyCriteria }>
): Promise<import("@/types").LenderProgram> {
  try {
    return await fetchApi<import("@/types").LenderProgram>(`/api/lenders/${lenderId}/programs/${programId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } catch (e) {
    throw e;
  }
}

export async function deleteProgram(lenderId: string, programId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/lenders/${lenderId}/programs/${programId}`, { method: "DELETE" });
  } catch (e) {
    throw e;
  }
}

// Mock data for UI development without backend
function getMockApplications(): LoanApplication[] {
  return [
    {
      id: "app-1",
      status: "completed",
      business: {
        industry: "Construction",
        state: "CA",
        yearsInBusiness: 8,
        annualRevenue: 1_200_000,
      },
      guarantor: { ficoScore: 720 },
      businessCredit: { paynetScore: 65, tradeLinesCount: 12 },
      loanRequest: {
        amount: 150_000,
        termMonths: 60,
        equipment: { type: "Heavy Equipment", category: "Construction", ageYears: 2 },
      },
      createdAt: "2025-01-28T10:00:00Z",
      updatedAt: "2025-01-29T14:00:00Z",
      submittedAt: "2025-01-28T12:00:00Z",
    },
    {
      id: "app-2",
      status: "draft",
      business: {
        industry: "Healthcare",
        state: "TX",
        yearsInBusiness: 3,
        annualRevenue: 500_000,
      },
      guarantor: { ficoScore: 680 },
      businessCredit: { paynetScore: 55 },
      loanRequest: {
        amount: 75_000,
        termMonths: 48,
        equipment: { type: "Medical Equipment", ageYears: 0 },
      },
      createdAt: "2025-01-30T09:00:00Z",
      updatedAt: "2025-01-30T09:00:00Z",
    },
  ];
}

function getMockLenderPolicies(): LenderPolicy[] {
  return [
    {
      id: "stearns",
      name: "Stearns Bank - Equipment Finance",
      slug: "stearns-bank",
      description: "Equipment finance credit box",
      sourceDocument: "Stearns Bank - Equipment Finance Credit Box.pdf",
      programs: [
        {
          id: "stearns-standard",
          name: "Standard Program",
          tier: "A",
          criteria: {
            fico: { minScore: 700 },
            paynet: { minScore: 60 },
            loanAmount: { minAmount: 25_000, maxAmount: 500_000 },
            timeInBusiness: { minYears: 2 },
            geographic: { excludedStates: [] },
            equipment: { maxEquipmentAgeYears: 10 },
          },
        },
      ],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "apex",
      name: "Apex Commercial Capital",
      slug: "apex-commercial",
      description: "Broker guidelines",
      programs: [
        {
          id: "apex-tier1",
          name: "Tier 1",
          criteria: {
            fico: { minScore: 680 },
            loanAmount: { minAmount: 10_000, maxAmount: 250_000 },
            timeInBusiness: { minYears: 1 },
          },
        },
      ],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "advantage",
      name: "Advantage+ Financing",
      slug: "advantage-plus",
      description: "Broker ICP ($75K non-trucking)",
      programs: [
        {
          id: "adv-75k",
          name: "Non-Trucking up to $75K",
          criteria: {
            fico: { minScore: 650 },
            loanAmount: { minAmount: 5_000, maxAmount: 75_000 },
            timeInBusiness: { minYears: 1 },
            industry: { excludedIndustries: ["Trucking"] },
          },
        },
      ],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "citizens",
      name: "Citizens Bank",
      slug: "citizens-bank",
      description: "2025 Equipment Finance Program",
      programs: [
        {
          id: "citizens-standard",
          name: "Standard",
          criteria: {
            fico: { minScore: 680 },
            loanAmount: { minAmount: 25_000, maxAmount: 1_000_000 },
            timeInBusiness: { minYears: 3 },
          },
        },
      ],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "falcon",
      name: "Falcon Equipment Finance",
      slug: "falcon-equipment",
      description: "Rates & Programs",
      programs: [
        {
          id: "falcon-standard",
          name: "Standard Program",
          criteria: {
            fico: { minScore: 660 },
            loanAmount: { minAmount: 15_000, maxAmount: 350_000 },
            timeInBusiness: { minYears: 2 },
          },
        },
      ],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
  ];
}

function getMockMatchResults(): LenderMatchResult[] {
  return [
    {
      lenderId: "stearns",
      lenderName: "Stearns Bank - Equipment Finance",
      eligible: true,
      fitScore: 92,
      bestProgram: { id: "stearns-standard", name: "Standard Program", tier: "A" },
      rejectionReasons: [],
      criteriaResults: [
        { name: "FICO Score", met: true, reason: "Meets minimum 700", expected: "≥ 700", actual: "720" },
        { name: "PayNet Score", met: true, reason: "Meets minimum 60", expected: "≥ 60", actual: "65" },
        { name: "Loan Amount", met: true, reason: "Within $25K–$500K", expected: "$25,000 – $500,000", actual: "$150,000" },
        { name: "Time in Business", met: true, reason: "8 years ≥ 2 years", expected: "≥ 2 years", actual: "8 years" },
        { name: "Equipment Age", met: true, reason: "Within 10 years", expected: "≤ 10 years", actual: "2 years" },
      ],
    },
    {
      lenderId: "citizens",
      lenderName: "Citizens Bank",
      eligible: true,
      fitScore: 88,
      bestProgram: { id: "citizens-standard", name: "Standard" },
      rejectionReasons: [],
      criteriaResults: [
        { name: "FICO Score", met: true, reason: "Meets minimum 680", expected: "≥ 680", actual: "720" },
        { name: "Loan Amount", met: true, reason: "Within $25K–$1M", expected: "$25,000 – $1,000,000", actual: "$150,000" },
        { name: "Time in Business", met: true, reason: "8 years ≥ 3 years", expected: "≥ 3 years", actual: "8 years" },
      ],
    },
    {
      lenderId: "apex",
      lenderName: "Apex Commercial Capital",
      eligible: true,
      fitScore: 85,
      bestProgram: { id: "apex-tier1", name: "Tier 1" },
      rejectionReasons: [],
      criteriaResults: [
        { name: "FICO Score", met: true, reason: "Meets minimum 680", expected: "≥ 680", actual: "720" },
        { name: "Loan Amount", met: true, reason: "Within $10K–$250K", expected: "$10,000 – $250,000", actual: "$150,000" },
        { name: "Time in Business", met: true, reason: "8 years ≥ 1 year", expected: "≥ 1 year", actual: "8 years" },
      ],
    },
    {
      lenderId: "falcon",
      lenderName: "Falcon Equipment Finance",
      eligible: true,
      fitScore: 82,
      bestProgram: { id: "falcon-standard", name: "Standard Program" },
      rejectionReasons: [],
      criteriaResults: [
        { name: "FICO Score", met: true, reason: "Meets minimum 660", expected: "≥ 660", actual: "720" },
        { name: "Loan Amount", met: true, reason: "Within $15K–$350K", expected: "$15,000 – $350,000", actual: "$150,000" },
        { name: "Time in Business", met: true, reason: "8 years ≥ 2 years", expected: "≥ 2 years", actual: "8 years" },
      ],
    },
    {
      lenderId: "advantage",
      lenderName: "Advantage+ Financing",
      eligible: false,
      fitScore: 35,
      rejectionReasons: ["Loan amount $150,000 exceeds maximum $75,000 for this program"],
      criteriaResults: [
        { name: "FICO Score", met: true, reason: "Meets minimum 650", expected: "≥ 650", actual: "720" },
        { name: "Loan Amount", met: false, reason: "Maximum loan amount is $75,000 but requested amount is $150,000", expected: "$5,000 – $75,000", actual: "$150,000" },
        { name: "Time in Business", met: true, reason: "8 years ≥ 1 year", expected: "≥ 1 year", actual: "8 years" },
        { name: "Industry", met: true, reason: "Construction not excluded", expected: "Excludes Trucking", actual: "Construction" },
      ],
    },
  ];
}

function getMockUnderwritingRun(applicationId: string): UnderwritingRun {
  return {
    id: `run-${applicationId}`,
    applicationId,
    status: "completed",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    results: getMockMatchResults(),
  };
}
