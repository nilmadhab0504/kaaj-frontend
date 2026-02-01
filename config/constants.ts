export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export const INDUSTRIES = [
  "Construction", "Healthcare", "Manufacturing", "Transportation", "Trucking",
  "Retail", "Restaurant", "Agriculture", "Technology", "Professional Services",
  "Other",
] as const;

export const EQUIPMENT_TYPES = [
  "Heavy Equipment", "Medical Equipment", "Construction", "Vehicles",
  "IT/Office", "Manufacturing", "Agricultural", "Other",
] as const;

export const LOAN_TERMS = [24, 36, 48, 60, 72] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/lenders", label: "Lender Policies" },
] as const;

export const APPLICATION_STATUS_CONFIG: Record<
  string,
  { color: "primary" | "secondary" | "success" | "warning" | "danger" | "info"; variant: "flat" | "solid" | "outline" }
> = {
  draft: { color: "secondary", variant: "flat" },
  submitted: { color: "info", variant: "flat" },
  underwriting: { color: "warning", variant: "flat" },
  completed: { color: "success", variant: "flat" },
  failed: { color: "danger", variant: "flat" },
};
