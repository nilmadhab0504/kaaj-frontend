// Borrower / Business
export interface Business {
  industry: string;
  industryCode?: string;
  state: string;
  yearsInBusiness: number;
  annualRevenue: number;
  entityType?: string;
}

// Personal Guarantor
export interface PersonalGuarantor {
  ficoScore: number;
  hasBankruptcy?: boolean;
  hasTaxLiens?: boolean;
  hasJudgments?: boolean;
  yearsAtAddress?: number;
}

// Business Credit
export interface BusinessCredit {
  paynetScore?: number;
  tradeLinesCount?: number;
  averageTradeAgeMonths?: number;
}

// Equipment
export interface EquipmentDetails {
  type: string;
  category?: string;
  ageYears?: number;
  cost?: number;
  description?: string;
}

// Loan Request
export interface LoanRequest {
  amount: number;
  termMonths: number;
  equipment: EquipmentDetails;
  purpose?: string;
}

// Full Application
export interface LoanApplication {
  id: string;
  status: "draft" | "submitted" | "underwriting" | "completed" | "failed";
  business: Business;
  guarantor: PersonalGuarantor;
  businessCredit?: BusinessCredit;
  loanRequest: LoanRequest;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

// Lender policy criteria (normalized)
export interface FicoCriteria {
  minScore: number;
  maxScore?: number;
  tiered?: { minScore: number; programName: string }[];
}

export interface PayNetCriteria {
  minScore?: number;
  maxScore?: number;
}

export interface LoanAmountCriteria {
  minAmount: number;
  maxAmount: number;
}

export interface TimeInBusinessCriteria {
  minYears: number;
}

export interface GeographicRestriction {
  allowedStates?: string[];
  excludedStates?: string[];
}

export interface IndustryRestriction {
  allowedIndustries?: string[];
  excludedIndustries?: string[];
}

export interface EquipmentRestriction {
  allowedTypes?: string[];
  excludedTypes?: string[];
  maxEquipmentAgeYears?: number;
}

export interface LenderPolicyCriteria {
  fico?: FicoCriteria;
  paynet?: PayNetCriteria;
  loanAmount: LoanAmountCriteria;
  timeInBusiness?: TimeInBusinessCriteria;
  geographic?: GeographicRestriction;
  industry?: IndustryRestriction;
  equipment?: EquipmentRestriction;
  minRevenue?: number;
  customRules?: { name: string; description: string; expression?: string }[];
}

export interface LenderProgram {
  id: string;
  name: string;
  criteria: LenderPolicyCriteria;
  description?: string;
  tier?: string;
}

export interface LenderPolicy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  programs: LenderProgram[];
  sourceDocument?: string;
  updatedAt: string;
  createdAt: string;
}

// Match result for one lender
export interface CriterionResult {
  name: string;
  met: boolean;
  reason: string;
  expected?: string;
  actual?: string;
}

export interface LenderMatchResult {
  lenderId: string;
  lenderName: string;
  eligible: boolean;
  fitScore: number;
  bestProgram?: { id: string; name: string; tier?: string };
  rejectionReasons: string[];
  criteriaResults: CriterionResult[];
}

export interface UnderwritingRun {
  id: string;
  applicationId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  results?: LenderMatchResult[];
  error?: string;
}
