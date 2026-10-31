import Image from "next/image";

type Variant = "full" | "symbol" | "compact";

const SIZES: Record<Variant, number> = {
  full: 40,
  compact: 32,
  symbol: 28,
};

export function BrightloopLogo({
  variant = "full",
  size,
  wordmarkColor,
  descriptorColor,
}: {
  variant?: Variant;
  size?: number;
  wordmarkColor?: string;
  descriptorColor?: string;
}) {
  const iconSize = size ?? SIZES[variant];

  const icon = (
    <Image
      src="/brightloop-icon-512.png"
      alt="Brightloop"
      width={iconSize}
      height={iconSize}
      style={{ objectFit: "contain", flexShrink: 0 }}
      priority
    />
  );

  if (variant === "symbol") {
    return icon;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {icon}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: variant === "compact" ? "1rem" : "1.0625rem",
            color: wordmarkColor ?? "var(--text)",
          }}
        >
          Brightloop
        </span>
        {variant === "full" && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              fontSize: "0.6875rem",
              color: descriptorColor ?? "var(--text-muted)",
            }}
          >
            Software
          </span>
        )}
      </div>
    </div>
  );
}
