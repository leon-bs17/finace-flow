import type { Config } from "tailwindcss";

// Sistema de design do FinanceFlow — conceito "ledger digital":
// fundo tinta-verde-escura (não o cinza-quase-preto genérico), números
// financeiros sempre em monoespaçada tabular (como um extrato real), e um
// verde-musgo como cor de ação em vez do verde-esmeralda saturado padrão.
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#0A1210",   // fundo principal (dark) — "tinta"
          light: "#FBF8F1",     // fundo principal (light) — "papel"
        },
        surface: {
          DEFAULT: "#111C18",
          light: "#F3EFE4",
        },
        elevated: {
          DEFAULT: "#182620",
          light: "#FFFFFF",
        },
        border: {
          DEFAULT: "#233029",
          light: "#E4DFD0",
        },
        ink: {
          DEFAULT: "#EAF2ED",
          muted: "#8FA398",
          light: "#1B2420",
          "light-muted": "#5C6B62",
        },
        moss: {
          50: "#EAF7EE",
          200: "#B9E4C6",
          400: "#5FBE7E",
          500: "#2FA36B",
          600: "#22885A",
          700: "#1B6D48",
        },
        amber: {
          400: "#E8A33D",
          500: "#D68C25",
        },
        rose: {
          400: "#E2716B",
          500: "#CC584F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px -12px rgba(0,0,0,0.35)",
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(0.4)" },
        },
        caret: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "pulse-line": "pulseLine 1.6s ease-in-out infinite",
        caret: "caret 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
