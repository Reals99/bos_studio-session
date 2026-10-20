/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        oatmeal: "#F4F0EB",
        charcoal: {
          DEFAULT: "#1A1716",
          subtle: "#383330",
          muted: "#7A736E",
          light: "#A49E99",
        },
        bronze: {
          DEFAULT: "#C2A878",
          hover: "#B29766",
          dark: "#967E51",
          light: "#F7F2E7",
          subtle: "#EFE8DA",
        },
        studio: {
          bg: "#F4F0EB",
          card: "#FFFFFF",
          elevated: "#FAF8F5",
          border: "#E8E2D8",
          gold: "#C2A878",
          "gold-light": "#F7F2E7",
          "gold-dark": "#967E51",
          muted: "#7A736E",
          accent: "#C2A878",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(26, 23, 22, 0.03)",
        elevated: "0 12px 32px -4px rgba(26, 23, 22, 0.06), 0 4px 12px rgba(26, 23, 22, 0.02)",
        luxury: "0 20px 48px -10px rgba(26, 23, 22, 0.08), 0 6px 18px rgba(26, 23, 22, 0.03)",
      },
    },
  },
  plugins: [],
};
