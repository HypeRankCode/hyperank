import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        hype: "var(--hype)",
        "hype-dim": "#cc2255",
        dead: "var(--dead)",
        "dead-text": "var(--dead-text)",
        gold: "var(--gold)",
        neon: "var(--neon)",
        purple: "var(--purple)",
        void: "var(--bg-void)",
        surface: "var(--bg-surface)",
        raised: "var(--bg-raised)",
        overlay: "var(--bg-overlay)",
        common: "var(--common)",
        rare: "var(--rare)",
        epic: "var(--epic)",
        legendary: "var(--legendary)",
        mythic: "var(--mythic)",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        full: "999px",
        "2xl": "20px",
      },
      boxShadow: {
        hype: "0 0 40px var(--hype-glow)",
        "hype-sm": "0 0 20px var(--hype-glow)",
        card: "0 8px 32px rgba(0, 0, 0, 0.4)",
        gold: "0 0 20px var(--gold-glow)",
        neon: "0 0 20px var(--neon-glow)",
      },
      keyframes: {
        "heat-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.9)" },
        },
      },
      animation: {
        "heat-pulse": "heat-pulse 1.5s ease-in-out infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "live-pulse": "live-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
