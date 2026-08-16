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
        background: "#F2F2F7",
        foreground: "#000000",
        card: "#FFFFFF",
        "card-foreground": "#000000",
        primary: {
          DEFAULT: "#C1272D",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E5E5EA",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#F2F2F7",
          foreground: "#8E8E93",
        },
        accent: {
          DEFAULT: "#1C1C1E",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF3B30",
          foreground: "#FFFFFF",
        },
        border: "#C6C6C8",
        input: "#E5E5EA",
        ring: "#C1272D",
      },
      fontFamily: {
        // Apple HIG relies entirely on the system font for cleanliness and native feel.
        // This stack ensures iOS uses SF Pro, and Android falls back to Roboto cleanly.
        sans: [
          "System",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",    // Standard iOS text field radius
        xl: "14px",    // Standard iOS grouped card & primary button radius
        "2xl": "20px", // Standard iOS modal/alert radius
        "3xl": "24px", // Bottom sheet radius
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};