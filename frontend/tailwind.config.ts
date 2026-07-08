import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        panel: "var(--panel-bg)",
        card: "var(--card-bg)",
        surfaceElevated: "var(--surface-elevated)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        borderColor: "var(--border-color)",
        borderHover: "var(--border-hover)",
        
        // Premium desaturated and themed re-mapping
        indigo: {
          50: "rgba(139, 92, 246, 0.05)",
          100: "rgba(139, 92, 246, 0.1)",
          200: "rgba(139, 92, 246, 0.2)",
          300: "rgba(139, 92, 246, 0.3)",
          400: "rgba(139, 92, 246, 0.5)",
          500: "var(--accent-primary)",
          600: "var(--accent-primary)",
          700: "var(--accent-primary-hover)",
          800: "rgba(124, 58, 237, 0.8)",
          900: "var(--panel-bg)",
        },
        purple: {
          50: "rgba(245, 158, 11, 0.05)",
          100: "rgba(245, 158, 11, 0.1)",
          200: "rgba(245, 158, 11, 0.2)",
          300: "rgba(245, 158, 11, 0.3)",
          400: "rgba(245, 158, 11, 0.5)",
          500: "var(--accent-secondary)",
          600: "var(--accent-secondary)",
          700: "var(--accent-secondary)",
          800: "var(--accent-secondary)",
          900: "var(--accent-secondary)",
        },
        brand: {
          50: "rgba(139, 92, 246, 0.05)",
          100: "rgba(139, 92, 246, 0.1)",
          200: "rgba(139, 92, 246, 0.2)",
          300: "rgba(139, 92, 246, 0.3)",
          400: "rgba(139, 92, 246, 0.5)",
          500: "var(--accent-primary)",
          600: "var(--accent-primary)",
          700: "var(--accent-primary-hover)",
          800: "rgba(124, 58, 237, 0.8)",
          900: "var(--panel-bg)",
        }
      },
    },
  },
  plugins: [],
};
export default config;
