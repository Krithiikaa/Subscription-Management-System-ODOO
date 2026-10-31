/**
 * Pure function: Validate a payment against an invoice.
 * - Status must be CONFIRMED
 * - Amount must be > 0
 * - Amount cannot exceed current balanceDue (overpayment rejected)
 */
export function validatePayment(
  invoice: {
    status: string;
    grandTotal: number;
  },
  existingPayments: Array<{ amount: number; isReversal?: boolean }>,
  newPaymentAmount: number
): { valid: boolean; balanceAfter: number; willBePaid: boolean; reason?: string } {
  if (invoice.status === "DRAFT") {
    return {
      valid: false,
      balanceAfter: 0,
      willBePaid: false,
      reason: "Payments can only be recorded against CONFIRMED invoices. Please confirm the invoice first.",
    };
  }

  if (invoice.status === "CANCELLED") {
    return {
      valid: false,
      balanceAfter: 0,
      willBePaid: false,
      reason: "Cannot record payment on a CANCELLED invoice.",
    };
  }

  if (newPaymentAmount <= 0) {
    return {
      valid: false,
      balanceAfter: 0,
      willBePaid: false,
      reason: "Payment amount must be greater than zero.",
    };
  }

  // Calculate current net paid
  const netPaid = existingPayments.reduce((sum, p) => {
    return p.isReversal ? sum - p.amount : sum + p.amount;
  }, 0);

  const currentBalance = Math.max(0, Math.round((invoice.grandTotal - netPaid) * 100) / 100);

  if (newPaymentAmount > currentBalance) {
    return {
      valid: false,
      balanceAfter: currentBalance,
      willBePaid: false,
      reason: `Overpayment rejected. Maximum allowable payment is current balance ₹${currentBalance.toFixed(2)}.`,
    };
  }

  const balanceAfter = Math.max(0, Math.round((currentBalance - newPaymentAmount) * 100) / 100);
  const willBePaid = balanceAfter === 0;

  return {
    valid: true,
    balanceAfter,
    willBePaid,
  };
}

