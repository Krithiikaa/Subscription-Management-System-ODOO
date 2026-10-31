// Decimal-safe money math using integer paise (1 rupee = 100 paise).
// Postgres NUMERIC columns come back as strings — never run float math on them.

export function toPaise(value: string | number): bigint {
  const str = typeof value === "number" ? value.toFixed(2) : value;
  const negative = str.trim().startsWith("-");
  const [whole, frac = ""] = str.trim().replace("-", "").split(".");
  const paddedFrac = (frac + "00").slice(0, 2);
  const paise = BigInt(whole || "0") * 100n + BigInt(paddedFrac || "0");
  return negative ? -paise : paise;
}

export function fromPaise(paise: bigint): string {
  const negative = paise < 0n;
  const abs = negative ? -paise : paise;
  const whole = abs / 100n;
  const frac = (abs % 100n).toString().padStart(2, "0");
  return `${negative ? "-" : ""}${whole.toString()}.${frac}`;
}

export function addPaise(a: bigint, b: bigint): bigint {
  return a + b;
}

export function mulPaiseByInt(paise: bigint, quantity: number): bigint {
  return paise * BigInt(quantity);
}

// Rounds to the nearest paisa (half-up), matching standard currency rounding.
export function percentOfPaise(paise: bigint, percent: string | number): bigint {
  const percentStr = typeof percent === "number" ? percent.toFixed(4) : percent;
  const [whole, frac = ""] = percentStr.split(".");
  const paddedFrac = (frac + "0000").slice(0, 4);
  const percentScaled = BigInt(whole || "0") * 10000n + BigInt(paddedFrac || "0");
  const numerator = paise * percentScaled;
  const denominator = 1000000n;
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  // half-up rounding
  return remainder * 2n >= denominator ? quotient + 1n : quotient;
}

export function capAtPaise(value: bigint, cap: bigint): bigint {
  return value > cap ? cap : value;
}

export function maxPaise(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}
