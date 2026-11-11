import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Same greens and ink as the landing page, so every screen shares one palette.
        emerald: {
          50: "#f1fcf8", 100: "#e9f9f2", 200: "#d5f3e8", 300: "#b7efd9", 400: "#5fd8ae",
          500: "#0bb984", 600: "#07966c", 700: "#067a58", 800: "#08604a", 900: "#0a4d3c",
        },
        slate: { ...colors.slate, 500: "#64748b", 600: "#536174", 700: "#344151", 800: "#253044", 900: "#172033" },
      },
    },
  },
  plugins: [],
};
