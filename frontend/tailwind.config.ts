import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        panel: "var(--panel-bg)",
        card: "var(--card-bg)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        borderColor: "var(--border-color)",
        brand: {
          50: "#f5f6ff",
          100: "#ebecff",
          200: "#dadcff",
          300: "#bebeff",
          400: "#9896ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#3730a3",
          800: "#1e1b4b",
          900: "#0f1117",
        }
      },
    },
  },
  plugins: [],
};
export default config;
