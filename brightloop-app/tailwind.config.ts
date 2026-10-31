import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:           "var(--bg)",
        panel:        "var(--panel)",
        hairline:     "var(--hairline)",
        primary:      "var(--text)",
        muted:        "var(--text-muted)",
        accent:       "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        warning:      "var(--warning)",
        danger:       "var(--danger)",
        success:      "var(--success)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg:      "var(--radius-lg)",
      },
      minHeight: { touch: "44px" },
      minWidth:  { touch: "44px" },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
      },
      animation: {
        "fade-in":        "fade-in 200ms ease both",
        "slide-in-right": "slide-in-right 250ms ease both",
        blink:            "blink 1s step-start infinite",
      },
    },
  },
  plugins: [],
};

export default config;
