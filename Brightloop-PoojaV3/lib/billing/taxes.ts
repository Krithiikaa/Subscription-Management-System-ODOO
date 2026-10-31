/**
 * Pure function: Compute tax for a single line item.
 * Amount after discount = baseAmount - lineDiscount.
 * Tax = (Amount after discount) * (taxRate / 100), rounded to 2 decimals.
 */
export function computeLineTax(
  baseAmount: number,
  lineDiscount: number = 0,
  taxRate: number = 0
): {
  taxableAmount: number;
  taxAmount: number;
  totalWithTax: number;
} {
  const taxableAmount = Math.max(0, baseAmount - lineDiscount);
  const taxAmount = Math.round(taxableAmount * (taxRate / 100) * 100) / 100;
  const totalWithTax = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    taxableAmount,
    taxAmount,
    totalWithTax,
  };
}

/**
 * Pure function: Compute invoice level totals.
 */
export function computeInvoiceTotals(
  lines: Array<{
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
  }>
): {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
} {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const lineBase = Math.round(line.quantity * line.unitPrice * 100) / 100;
    const lineDiscount = Math.min(lineBase, line.discount || 0);
    const { taxAmount } = computeLineTax(lineBase, lineDiscount, line.taxRate || 0);

    subtotal += lineBase;
    discountTotal += lineDiscount;
    taxTotal += taxAmount;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  discountTotal = Math.round(discountTotal * 100) / 100;
  taxTotal = Math.round(taxTotal * 100) / 100;
  const grandTotal = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;

  return {
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal,
  };
}

