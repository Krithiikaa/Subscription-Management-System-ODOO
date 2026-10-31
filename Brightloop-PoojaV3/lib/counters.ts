import { prisma } from "@/lib/prisma";

/**
 * Generate a safe sequential formatted number (e.g. SUB-00001 or INV-00001)
 * Uses atomic upsert and increment on the Counter model.
 */
export async function getNextSequenceNumber(
  prefix: "SUB" | "INV",
  counterId: "subscription" | "invoice"
): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { id: counterId },
    create: { id: counterId, current: 1 },
    update: { current: { increment: 1 } },
  });

  const padded = String(counter.current).padStart(5, "0");
  return `${prefix}-${padded}`;
}

