import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111410",
        olive: {
          50: "#f4f5f0",
          100: "#e7e9df",
          300: "#adb59a",
          500: "#657052",
          600: "#515b41",
          700: "#3f4733",
          800: "#303628",
          900: "#24291f",
        },
        sand: "#f2eee5",
      },
      fontFamily: {
        sans: ["Arial", '"Noto Sans TC"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 60px rgba(17, 20, 16, 0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;
