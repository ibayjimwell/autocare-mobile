You are an expert React Native developer and a master UI/UX designer specializing in Tailwind CSS / NativeWind and iOS Human Interface Guidelines (HIG).

Your task is to COMPLETELY REDESIGN the attached React Native screen or component to follow the new AutoCare Design System (Apple HIG style). 

DO NOT just do a 1:1 translation of the old layout with new colors. You must completely restructure the JSX, `View` blocks, and layout to look like a premium, native iOS application while keeping the underlying logic intact.

---

### STRICT RULES & CONSTRAINTS

1. STRUCTURAL REDESIGN MANDATE (APPLE HIG LAYOUTS):
   - You must rethink the layout. Use standard iOS paradigms:
     - **Grouped Lists**: Instead of floating items, group related information into blocks. Wrap them in a card (`bg-card rounded-xl mx-4 overflow-hidden mb-6`) and stack rows inside.
     - **List Rows**: Items inside a grouped card should be flex rows with a title on the left, value on the right, separated by an inset divider (`border-b border-border ml-4`). The last item in a card must NOT have a bottom border.
     - **Large Headers**: Replace standard centered headers with an iOS-style left-aligned Large Title (`text-3xl font-bold tracking-tight text-foreground px-4 mb-4`).
     - **Bottom Action Bars**: Main Call-To-Action buttons should be fixed at the bottom of the screen (inside the SafeAreaView) with generous padding, not buried in the middle of a scroll view.

2. DO NOT TOUCH BUSINESS LOGIC:
   - Do NOT alter, remove, or modify any functions, state management (`useState`, `useReducer`), hooks (`useEffect`), API calls, or event handlers (`onPress`, etc.).
   - You can completely change the `View`, `Text`, and styling structures, but the data bound to them and the functions they trigger must remain exactly the same.

3. SAFE AREA VIEW MANDATE:
    - Ensure every root screen component is wrapped in a `SafeAreaView` from `react-native-safe-area-context` with `flex-1 bg-background`.
   - Ensure proper padding/margins so content does not get hidden under the iOS notch or home indicator bar.

4. ICONS:
   - Use `lucide-react-native` for all icons. Replace any existing icon library (Ionicons, FontAwesome, etc.) with the closest equivalent from Lucide React Native.
   - Standard icon color should be the foreground or muted-foreground color, unless it's a primary action (then use primary `#C1272D`).

5. AUTOCARE DESIGN SYSTEM (APPLE HIG) SPECIFICATIONS:
   - Screen Backgrounds: `bg-background` (`#F2F2F7` - iOS Grouped Background).
   - Cards / Surface Containers: `bg-card` (`#FFFFFF` - Pure White).
   - Primary Interactivity / CTA: `bg-primary` / `text-primary` (`#C1272D` - AutoCare Red). Color indicates tapability.
   - Secondary Actions: `bg-secondary` (`#E5E5EA`) with `text-secondary-foreground` (`#000000`).
   - Text Hierarchy:
     - Primary / Body: `text-foreground` (`#000000`).
     - Secondary / Captions / Placeholders: `text-muted-foreground` (`#8E8E93`).
     - Large Titles: `text-3xl font-bold tracking-tight text-foreground`.
     - Headlines: `text-lg font-semibold text-foreground`.
     - Body: `text-base font-normal text-foreground`.
     - Footnotes/Captions: `text-sm font-normal text-muted-foreground`.
   - Touch Targets & Spacing:
     - All interactive buttons MUST be at least 44x44pt (e.g., `min-h-[44px]` or `py-4`).
     - Horizontal margins from screen edges: 16px (`px-4` or `mx-4`).
   - Border Radius (Squarcles):
     - Text inputs: `rounded-lg` (10px).
     - Cards / primary buttons: `rounded-xl` (14px).
     - Modals / Bottom sheets: `rounded-2xl` (20px) or `rounded-3xl` (24px).

---

### EXPECTED OUTPUT
Return the COMPLETE, fully redesigned component code. Do not use placeholders like `// ... rest of the code remains the same`. Keep all imports, logic, and state intact while delivering a stunning, newly architected iOS-native layout using NativeWind.

---

### COMPONENT CODE TO REDESIGN:

[PASTE YOUR COMPONENT / SCREEN CODE HERE]