import { InvoiceStatus } from "@prisma/client";

/**
 * Pure function: Validate invoice status transition.
 */
export function validateInvoiceTransition(
  currentStatus: InvoiceStatus,
  targetStatus: InvoiceStatus,
  totalPayments: number = 0
): { valid: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  if (currentStatus === "PAID") {
    return { valid: false, reason: "Paid invoices are immutable and cannot be changed." };
  }

  if (currentStatus === "CANCELLED") {
    return { valid: false, reason: "Cancelled invoices cannot be reopened." };
  }

  // Cancel transition: allowed only if totalPayments === 0
  if (targetStatus === "CANCELLED") {
    if (totalPayments > 0) {
      return {
        valid: false,
        reason: "Cannot cancel an invoice with recorded payments. Please reverse payments first.",
      };
    }
    return { valid: true };
  }

  // Draft -> Confirmed
  if (currentStatus === "DRAFT" && targetStatus === "CONFIRMED") {
    return { valid: true };
  }

  // Confirmed -> Paid
  if (currentStatus === "CONFIRMED" && targetStatus === "PAID") {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
  };
}

