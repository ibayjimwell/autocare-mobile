You are an expert React Native developer specializing in Tailwind CSS / NativeWind and iOS Human Interface Guidelines (HIG).

Your task is to refactor the attached React Native screen or component to follow the new AutoCare Design System (Apple HIG style).

---

### STRICT RULES & CONSTRAINTS

1. DO NOT TOUCH BUSINESS LOGIC:
   - Do NOT alter, remove, or modify any functions, state management (`useState`, `useReducer`, etc.), hooks (`useEffect`, custom hooks, etc.), API calls, or event handlers (`onPress`, etc.).
   - Do NOT change component props, interface definitions, or data structures.
   - Keep all existing variable names, conditional rendering logic, and callbacks identical.
   - ONLY refactor the JSX structure, styling classes (NativeWind / Tailwind), layout, and visual UI components.

2. SAFE AREA VIEW MANDATE:
   - Ensure every root screen component is wrapped in a `SafeAreaView` (preferably from `react-native-safe-area-context`) with `flex-1 bg-background`.
   - Ensure proper padding/margins so content does not get hidden under the iOS notch or home indicator bar.

3. AUTOCARE DESIGN SYSTEM (APPLE HIG) SPECIFICATIONS:
   - Screen Backgrounds: `bg-background` (`#F2F2F7` - iOS Grouped Background).
   - Cards / Surface Containers: `bg-card` (`#FFFFFF` - Pure White) with `rounded-xl` (14px radius) and `overflow-hidden`.
   - Primary Interactivity / CTA: `bg-primary` / `text-primary` (`#C1272D` - AutoCare Red). Color indicates tapability.
   - Secondary Actions: `bg-secondary` (`#E5E5EA`) with `text-secondary-foreground` (`#000000`).
   - Text Hierarchy:
     - Primary / Body / Titles: `text-foreground` (`#000000`).
     - Secondary / Captions / Subtitles / Placeholders: `text-muted-foreground` (`#8E8E93`).
     - Large Titles: `text-3xl font-bold tracking-tight text-foreground`.
     - Headlines: `text-lg font-semibold text-foreground`.
     - Body: `text-base font-normal text-foreground`.
     - Footnotes/Captions: `text-sm font-normal text-muted-foreground`.
   - Touch Targets & Spacing:
     - All interactive buttons and touchable items MUST have a minimum target size of 44x44pt (`min-h-[44px]` or generous padding like `py-3` / `py-4`).
     - Horizontal margins from screen edges should consistently be 16px (`px-4` or `mx-4`).
   - Border Radius:
     - Text inputs / small controls: `rounded-lg` (10px).
     - Cards / primary buttons: `rounded-xl` (14px).
     - Modals / Bottom sheets: `rounded-2xl` (20px) or `rounded-3xl` (24px).
   - Separators / Dividers:
     - Use `border-border` (`#C6C6C8`). In lists, inset dividers by 16px from the left rather than stretching full-width across the screen.

---

### DESIGN.md
# AutoCare Design System (Apple Human Interface Guidelines)

## Core Philosophy
AutoCare follows Apple's Human Interface Guidelines (HIG). The UI should feel native to iOS, prioritizing clarity, deference to content, and depth. 

The primary brand color is **#C1272D** (Red). In this system, color indicates interactivity. If something is `#C1272D`, the user will expect they can tap it. Use neutral system grays for structural elements.

## Guidelines for AI Models Generating Code
When generating React Native / NativeWind components for AutoCare, adhere strictly to these mapping rules:

### 1. Color Semantics
*   **Screens & Backgrounds (`bg-background`)**: Use the `background` color (`#F2F2F7`) for main app screens. This maps to iOS "Grouped Background", allowing white cards to float on top.
*   **Cards & Surfaces (`bg-card`)**: Use `card` (`#FFFFFF`) for anything floating above the background (grouped lists, settings panels, service summary cards). 
*   **Primary Actions (`bg-primary text-primary-foreground`)**: Use for the main Call-To-Action (CTA) on a screen (e.g., "Book Appointment", "Confirm"). 
*   **Secondary Actions (`bg-secondary text-secondary-foreground`)**: Use for alternative actions (e.g., "Cancel", "View Details").
*   **Text Hierarchy**: 
    *   Primary text (Titles, Body): `text-foreground` (`#000000`).
    *   Secondary text (Subtitles, Captions, Placeholders): `text-muted-foreground` (`#8E8E93`).
*   **Dividers (`border-border`)**: Use for standard iOS separators (`#C6C6C8`). Ensure separators do not span the entire width of the screen in lists (inset them by 16px on the left).

### 2. Typography (San Francisco / System Font)
*   Do not use custom display fonts like Oswald. iOS HIG relies on the system font (SF Pro) using varying weights to establish hierarchy.
*   **Large Titles**: `text-3xl font-bold tracking-tight text-foreground`
*   **Headlines**: `text-lg font-semibold text-foreground`
*   **Body**: `text-base font-normal text-foreground`
*   **Footnote/Caption**: `text-sm font-normal text-muted-foreground`

### 3. Sizing, Spacing, and Touch Targets
*   **Touch Targets**: Any interactive element MUST be at least `44x44 pt`. Use `min-h-[44px]` or generous padding (`py-3 or py-4`) for buttons.
*   **Padding**: Use iOS standard margins, typically `16px` (`p-4` or `mx-4`) from the screen edges.
*   **Border Radius (Squarcles)**:
    *   Use `rounded-xl` (14px) for prominent standalone buttons, floating cards, and grouped lists (standard iOS grouped radius).
    *   Use `rounded-lg` (10px) for standard text inputs and smaller controls.
    *   Use `rounded-2xl` (20px) or `rounded-3xl` (24px) for large bottom modal sheets.

### 4. Component Blueprints
*   **Primary Button**: `<TouchableOpacity className="w-full bg-primary py-4 rounded-xl items-center justify-center flex-row">`
*   **Grouped List Card**: `<View className="bg-card rounded-xl overflow-hidden mx-4 my-2">`
*   **Text Input**: `<TextInput className="bg-input rounded-lg px-4 py-3 text-base text-foreground" placeholderTextColor="#8E8E93" />`

### EXPECTED OUTPUT
Return the COMPLETE, fully rewritten component code. Do not use placeholders like `// ... rest of the code remains the same`. Keep all imports, logic, and state intact while delivering a clean, modern iOS-native look using NativeWind.

---

### tailwind.config.ts
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

---

### theme.ts
export const theme = {
  background: "#F2F2F7", // iOS System Grouped Background
  foreground: "#000000", // iOS Label (Black)
  card: "#FFFFFF",       // iOS Secondary Grouped Background (Pure White)
  primary: "#C1272D",    // AutoCare Brand Red
  "primary-foreground": "#FFFFFF", // White text on primary buttons
  secondary: "#E5E5EA",  // iOS System Gray 5 (Standard neutral button)
  "secondary-foreground": "#000000",
  muted: "#F2F2F7",      // iOS System Gray 6
  "muted-foreground": "#8E8E93", // iOS Secondary Label (System Gray)
  accent: "#1C1C1E",     // iOS Dark Gray for contrasting accents
  "accent-foreground": "#FFFFFF",
  destructive: "#FF3B30", // iOS System Red (standardized destructive)
  border: "#C6C6C8",      // iOS Opaque Separator
  input: "#E5E5EA",       // iOS Text Field Background (System Gray 5)
  ring: "#C1272D",        // Brand focus ring
};

---

### COMPONENT CODE TO REFACTOR:

[PASTE YOUR COMPONENT / SCREEN CODE HERE]