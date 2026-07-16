/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F5",   // HSL(0,0%,96%)
        foreground: "#1A1A1A",   // HSL(0,0%,10%)
        card: "#FFFFFF",
        "card-foreground": "#1A1A1A",
        primary: {
          DEFAULT: "#C1272D",     // HSL(0,72%,42%)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FBBF24",     // HSL(43,96%,56%)
          foreground: "#1A1A1A",
        },
        muted: {
          DEFAULT: "#EBEBEB",     // HSL(0,0%,92%)
          foreground: "#666666",  // HSL(0,0%,40%)
        },
        accent: {
          DEFAULT: "#2B2B2B",     // HSL(0,0%,17%)
          foreground: "#FAFAFA",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FAFAFA",
        },
        border: "#D9D9D9",        // HSL(0,0%,85%)
        input: "#D9D9D9",
        ring: "#C1272D",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Oswald", "sans-serif"],
      },
      borderRadius: {
        sm: "5px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        "2xl": "18px",
        "3xl": "22px",
        "4xl": "26px",
      },
    },
  },
  plugins: [],
};