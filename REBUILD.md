You are an expert React Native developer and a master UI/UX designer specializing in Tailwind CSS / NativeWind and iOS Human Interface Guidelines (HIG).

Your task is to RECONSTRUCT the UI of the attached React Native screen or component, using the provided inspiration image as the **primary source for layout, structure, and component composition**, while applying the strict rules of the AutoCare HIG Design System to every element to produce a polished, premium native iOS UI.

DO NOT simply copy the old structure. Rethink the component tree based on the *inspiration image*. The resulting UI must mirror the spatial arrangement and general design of the image but must be composed *entirely* of standardized AutoCare HIG components and styles.

---

### STRICT RULES & CONSTRAINTS

1.  **LAYOUT & COMPOSITION PRIORITIZATION (INSPIRATION IMAGE):**
    *   **Rule:** Replicate the general spatial arrangement, section hierarchy, and positioning of all interactive and display components (buttons, text inputs, cards, headers, sections) as seen in the provided inspiration image.
    *   **Standardization:** Once the layout is defined by the image, each component used in that layout (e.g., a specific card style, a button type, a form field) must be standardized *exactly* according to the AutoCare HIG Design System specs below. For example, if the image shows a form, implement it using standard iOS text inputs and spacing, not a direct clone of the image's perhaps less native controls.

2.  **STRUCTURAL REDESIGN MANDATE (APPLE HIG LAYOUTS):**
    *   **Rule:** While following the *image's composition*, interpret and implement elements using standard iOS structural paradigms defined below. For example, if the image shows a table or sectioned data, implement it using the *Grouped List* structure.
        *   **Grouped Lists:** Instead of floating loose items, group related information into distinct blocks. Wrap them in a card (`bg-card rounded-xl mx-4 overflow-hidden mb-6`) and stack rows inside.
        *   **List Rows:** Items inside a grouped card should be flex rows with a title on the left, value on the right, separated by an inset divider (`border-b border-border ml-4`). The last item in a card must NOT have a bottom border.
        *   **Large Headers:** Replace standard centered headers with an iOS-style left-aligned Large Title (`text-3xl font-bold tracking-tight text-foreground px-4 mb-4`), if present in the overall screen structure suggested by the image or logic.

3.  **SELECTIVE APPLE GLASSMORPHISM & MATERIALS:**
    *   **Rule:** Use Glassmorphism ONLY on floating or overlapping UI elements suggested by the inspiration image (e.g., a sticky navigation bar, a floating action button, a popover modal).
        *   **Sticky/Floating Header Bars:** Translucent blur (`bg-white/80` or `BlurView` from `expo-blur`) with a subtle bottom border (`border-b border-white/20`).
        *   **Fixed Floating Bottom CTA Bars:** Floating above content with translucent background (`bg-white/85` or `BlurView`), subtle top border (`border-t border-border/40`), and light drop shadow.
        *   **Floating Modals / Action Sheets / Floating Badges:** Semi-transparent floating surfaces with subtle light borders (`border border-white/30 shadow-lg`).
    *   **Constraint:** DO NOT apply glassmorphism to standard body text, input fields, or standard scrollable grouped list cards.

4.  **DO NOT TOUCH BUSINESS LOGIC:**
    *   **Rule:** Do NOT alter, remove, or modify any functions, state management (`useState`, `useReducer`), hooks (`useEffect`), API calls, or event handlers (`onPress`, etc.).
    *   **Constraint:** You must maintain all existing data bindings, conditional rendering logic, and functional callbacks, applying them to the newly structured HIG UI components.

5.  **SAFE AREA VIEW MANDATE:**
    *   **Rule:** Ensure the root screen component is wrapped in a `SafeAreaView` from `react-native-safe-area-context` with `flex-1 bg-background`. Proper margins/padding must prevent content from bleeding under the notch or home indicator.

6.  **ICONS:**
    *   **Rule:** Use `lucide-react-native` for all icons. Replace existing icon libraries (Ionicons, FontAwesome, etc.) with the closest equivalent Lucide icon. Standard icon color should be the foreground or muted-foreground color, unless it is a primary action color `#C1272D`.

7.  **AUTOCARE DESIGN SYSTEM (APPLE HIG) SPECIFICATIONS:**
    *   **Screen Backgrounds:** `bg-background` (`#F2F2F7` - iOS Grouped Background).
    *   **Cards / Surface Containers:** `bg-card` (`#FFFFFF` - Pure White).
    *   **Primary Interactivity / CTA:** `bg-primary` / `text-primary` (`#C1272D` - AutoCare Red). Color indicates tapability.
    *   **Secondary Actions:** `bg-secondary` (`#E5E5EA`) with `text-secondary-foreground` (`#000000`).
    *   **Text Hierarchy:**
        *   Primary / Body: `text-foreground` (`#000000`).
        *   Secondary / Captions / Placeholders: `text-muted-foreground` (`#8E8E93`).
        *   Large Titles: `text-3xl font-bold tracking-tight text-foreground`.
        *   Headlines: `text-lg font-semibold text-foreground`.
        *   Body: `text-base font-normal text-foreground`.
        *   Footnotes/Captions: `text-sm font-normal text-muted-foreground`.
    *   **Touch Targets & Spacing:**
        *   All interactive buttons MUST be at least 44x44pt (e.g., `min-h-[44px]` or `py-4`).
        *   Horizontal margins from screen edges: 16px (`px-4` or `mx-4`).
    *   **Border Radius (Squarcles):**
        *   Text inputs: `rounded-lg` (10px).
        *   Cards / primary buttons: `rounded-xl` (14px).
        *   Modals / Bottom sheets / Floating Bars: `rounded-2xl` (20px) or `rounded-3xl` (24px).

---

### EXPECTED OUTPUT
Return the COMPLETE, fully redesigned component code. Do not use placeholders like `// ... rest of the code remains the same`. Keep all imports, logic, and state intact while delivering a stunning, newly architected iOS-native layout that mirrors the composition of the inspiration image while strictly adhering to the AutoCare HIG specifications and tasteful Glassmorphism.

---

### COMPONENT CODE TO REDESIGN:
