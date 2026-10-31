export type QuotationStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED";

const TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export function isValidQuotationTransition(from: QuotationStatus, to: QuotationStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function isQuotationExpired(validUntil: string | null, now: Date = new Date()): boolean {
  if (!validUntil) return false;
  return now.toISOString().slice(0, 10) > validUntil;
}
