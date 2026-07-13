import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        naub: {
          green: {
            DEFAULT: "var(--naub-green)",
            dark: "var(--naub-green-dark)",
            soft: "var(--naub-green-soft)",
          },
          gold: "var(--naub-gold)",
          ink: "var(--naub-ink)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
