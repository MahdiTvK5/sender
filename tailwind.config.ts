import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0d1117",
          800: "#161b22",
          700: "#1c2333",
        },
        accent: {
          purple: "#8b5cf6",
          fuchsia: "#d946ef",
          cyan: "#06b6d4",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        vazir: ["var(--font-vazir)", "Tahoma", "sans-serif"],
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
        "cyan-blue": "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.45)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.45)",
        "glow-lg": "0 0 45px rgba(139, 92, 246, 0.55)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { textShadow: "0 0 18px rgba(139,92,246,0.65)" },
          "50%": { textShadow: "0 0 38px rgba(217,70,239,0.9)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
