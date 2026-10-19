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
          50: "#F0F6FC",
          100: "#DFEBF6",
          200: "#C5D9EA",
          300: "#A9C5DD",
          400: "#86A9CA",
          500: "#668FB5",
          600: "#4D789E",
          700: "#3A6387",
          800: "#2E4F6D",
          900: "#203B54",
        },
        saffron: {
          50: "#F0F7F6",
          100: "#E0EFEC",
          400: "#87B0A8",
          500: "#4F7F79",
          600: "#426B66",
        },
        leaf: {
          50: "#EAF7EE",
          100: "#CBEBD4",
          400: "#3FA562",
          500: "#2E8B4F",
          600: "#22703F",
        },
        paper: "#F5F8FC",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(45,77,108,0.04), 0 5px 18px rgba(45,77,108,0.05)",
        cardHover: "0 5px 12px rgba(45,77,108,0.07), 0 12px 28px rgba(45,77,108,0.09)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
