// Concurrency-safe human-readable number generation.
//
// The row is inserted with a temporary placeholder (unique via the DB's own
// serial sequence embedded in it), then updated in the same transaction to
// the final "<PREFIX>-0001" form derived from its own guaranteed-unique id.
// This avoids any "SELECT MAX + 1" race condition under concurrent requests.
// Must fit the number column's varchar(20) limit — the real value (e.g.
// "QUO-0001") is only ever a few characters, but this placeholder needs to
// be unique for the brief moment before it's overwritten with the real one.
export function tempNumber(prefix: string): string {
  return `${prefix}T${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`.slice(0, 20);
}

export function finalNumber(prefix: string, id: number): string {
  return `${prefix}-${String(id).padStart(4, "0")}`;
}
