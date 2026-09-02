/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0B1E33",
          800: "#122B47",
          700: "#1B3A5C",
        },
        brand: {
          50: "#EAF2FB",
          100: "#CFE2F5",
          200: "#9FC5EB",
          300: "#6FA8E1",
          400: "#3E86CE",
          500: "#1E63A8",
          600: "#154C83",
          700: "#123F6C",
          800: "#0F3255",
          900: "#0A2340",
        },
        saffron: {
          50: "#FFF6EC",
          100: "#FFE9CC",
          400: "#FF9F45",
          500: "#F2812E",
          600: "#D9691A",
        },
        leaf: {
          50: "#EAF7EE",
          100: "#CBEBD4",
          400: "#3FA562",
          500: "#2E8B4F",
          600: "#22703F",
        },
        paper: "#F6F8FB",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,30,51,0.06), 0 4px 16px rgba(11,30,51,0.06)",
        cardHover: "0 4px 10px rgba(11,30,51,0.08), 0 10px 28px rgba(11,30,51,0.10)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
