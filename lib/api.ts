import type {
  LoanApplication,
  LenderPolicy,
  UnderwritingRun,
  LenderMatchResult,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

function formatApiError(detail: unknown, statusText: string): string {
  if (Array.isArray(detail)) {
    return (
      "Validation failed: " +
      detail
        .map(
          (e: { loc?: unknown[]; msg?: string }) =>
            e.loc && Array.isArray(e.loc) ? e.loc.join(".") + ": " + (e.msg ?? "") : e.msg ?? ""
        )
        .filter(Boolean)
        .join("; ")
    );
  }
  if (typeof detail === "string") return detail;
  return statusText;
}

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = (err as { detail?: unknown }).detail;
    throw new Error(formatApiError(detail, res.statusText));
  }
  return res.json() as Promise<T>;
}

// Applications
export async function listApplications(): Promise<LoanApplication[]> {
  try {
    return await fetchApi<LoanApplication[]>("/api/applications");
  } catch {
    return [];
  }
}

export async function getApplication(id: string): Promise<LoanApplication | null> {
  try {
    return await fetchApi<LoanApplication>(`/api/applications/${id}`);
  } catch {
    return null;
  }
}

export async function createApplication(
  data: Omit<LoanApplication, "id" | "createdAt" | "updatedAt" | "status">
): Promise<LoanApplication> {
  return fetchApi<LoanApplication>("/api/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitApplication(id: string): Promise<LoanApplication> {
  return fetchApi<LoanApplication>(`/api/applications/${id}/submit`, {
    method: "POST",
  });
}

// Underwriting
export async function startUnderwriting(applicationId: string): Promise<UnderwritingRun> {
  return fetchApi<UnderwritingRun>(`/api/applications/${applicationId}/underwrite`, {
    method: "POST",
  });
}

export async function getUnderwritingRun(runId: string): Promise<UnderwritingRun | null> {
  try {
    return await fetchApi<UnderwritingRun>(`/api/underwriting/${runId}`);
  } catch {
    return null;
  }
}

export async function getApplicationRuns(
  applicationId: string
): Promise<UnderwritingRun[]> {
  try {
    return await fetchApi<UnderwritingRun[]>(
      `/api/applications/${applicationId}/runs`
    );
  } catch {
    return [];
  }
}

export async function getMatchResults(applicationId: string): Promise<LenderMatchResult[]> {
  try {
    const runs = await getApplicationRuns(applicationId);
    const run = runs[0];
    return run?.results ?? [];
  } catch {
    return [];
  }
}

// Lenders
export async function listLenderPolicies(): Promise<LenderPolicy[]> {
  try {
    return await fetchApi<LenderPolicy[]>("/api/lenders");
  } catch {
    return [];
  }
}

export async function getLenderPolicy(id: string): Promise<LenderPolicy | null> {
  try {
    return await fetchApi<LenderPolicy>(`/api/lenders/${id}`);
  } catch {
    return null;
  }
}

export async function updateLenderPolicy(
  id: string,
  data: Partial<Pick<LenderPolicy, "name" | "slug" | "description" | "sourceDocument">>
): Promise<LenderPolicy> {
  return fetchApi<LenderPolicy>(`/api/lenders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
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
