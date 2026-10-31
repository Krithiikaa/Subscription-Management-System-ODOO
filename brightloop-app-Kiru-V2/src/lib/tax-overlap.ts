// Detects ambiguous-pricing conflicts between active tax rules.
//
// Design decision: two rules conflict only when they share the same NAME
// (case-insensitive), the same exact scope, and overlapping effective date
// ranges. Matching on name (not just scope+dates) is deliberate — it lets
// legitimate multi-component taxes (e.g. "CGST 9%" + "SGST 9%") coexist for
// the same product/category/period, while still catching an admin
// accidentally creating two overlapping "GST 18%" rules for the same scope.
// Scope is compared as an exact (productId, category) tuple — a global rule
// (both null) is not treated as conflicting with a product- or
// category-specific rule, since real tax setups commonly layer a general
// rule with specific overrides and that is not an ambiguous duplicate.

export type TaxRuleScopeInput = {
  id?: number;
  name: string;
  productId: number | null;
  category: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  active: boolean;
};

function scopesMatch(a: TaxRuleScopeInput, b: TaxRuleScopeInput): boolean {
  return a.productId === b.productId && a.category === b.category;
}

// Inclusive date ranges; null start = -infinity, null end = +infinity.
export function rangesOverlap(aFrom: string | null, aTo: string | null, bFrom: string | null, bTo: string | null): boolean {
  const aStartsBeforeBEnds = bTo === null || aFrom === null || aFrom <= bTo;
  const bStartsBeforeAEnds = aTo === null || bFrom === null || bFrom <= aTo;
  return aStartsBeforeBEnds && bStartsBeforeAEnds;
}

export function findConflictingTaxRule(
  candidate: TaxRuleScopeInput,
  existingRules: TaxRuleScopeInput[]
): TaxRuleScopeInput | null {
  if (!candidate.active) return null;
  for (const existing of existingRules) {
    if (existing.id !== undefined && candidate.id !== undefined && existing.id === candidate.id) continue;
    if (!existing.active) continue;
    if (existing.name.trim().toLowerCase() !== candidate.name.trim().toLowerCase()) continue;
    if (!scopesMatch(candidate, existing)) continue;
    if (!rangesOverlap(candidate.effectiveFrom, candidate.effectiveTo, existing.effectiveFrom, existing.effectiveTo)) continue;
    return existing;
  }
  return null;
}
