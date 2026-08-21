# AutoCare Design System (Apple Human Interface Guidelines)

## Core Philosophy
AutoCare follows Apple's Human Interface Guidelines (HIG). The UI should feel native to iOS, prioritizing clarity, deference to content, and spatial depth. 

The primary brand color is **#C1272D** (Red). In this system, color indicates interactivity. If something is `#C1272D`, the user will expect they can tap it. Use neutral system grays for structural content and translucent glass materials for floating overlays.

## Guidelines for AI Models Generating Code
When generating React Native / NativeWind components for AutoCare, adhere strictly to these mapping rules:

### 1. Color Semantics & Materials
*   **Screens & Backgrounds (`bg-background`)**: Use the `background` color (`#F2F2F7`) for main app screens. This maps to iOS "Grouped Background", allowing white cards to float on top.
*   **Cards & Surfaces (`bg-card`)**: Use `card` (`#FFFFFF`) for standard content surfaces (grouped lists, settings panels, service summary cards). Keep standard content cards solid to preserve 100% legibility and high contrast.
*   **Selective Apple Glassmorphism (Materials & Translucency)**:
    *   **Permitted Usage**: Use glassmorphism *exclusively* on floating or overlapping UI components to establish depth over colored backgrounds (e.g., `bg-primary`) or images.
        *   Sticky / Header Navigation Bars and Icon Buttons
        *   Docked or Floating Bottom CTA Bars
        *   Floating Action Sheets, Modals, & Popovers
        *   Status Badges or Overlay Tags over images/maps
    *   **Forbidden Usage**: Do NOT apply glassmorphism to standard scrollable list cards, form inputs, body text containers, or main screen backgrounds.
    *   **Implementation Rules**: Combine translucency (`bg-white/15`), a subtle light hairline border (`border-white/20`), and light drop shadows (`shadow-md` / `shadow-lg`). Text over these elements should generally be `text-white` or `text-white/70` for secondary contrast.
*   **Primary Actions (`bg-primary text-primary-foreground`)**: Use for the main Call-To-Action (CTA) on a screen (e.g., "Book Appointment", "Confirm"). 
*   **Secondary Actions (`bg-secondary text-secondary-foreground`)**: Use for alternative neutral actions (e.g., "Cancel", "View Details").
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
*   **Touch Targets**: Any interactive element MUST be at least `44x44 pt`. Use `min-h-[44px]` or generous padding (`py-3` or `py-4`) for buttons. Circular buttons should be `w-11 h-11`.
*   **Padding**: Use iOS standard margins, typically `16px` (`p-4` or `mx-4`) from the screen edges.
*   **Border Radius (Squarcles)**:
    *   Use `rounded-full` for circular glass icon buttons.
    *   Use `rounded-xl` (14px) for prominent standalone buttons, floating cards, and grouped lists (standard iOS grouped radius).
    *   Use `rounded-lg` (10px) for standard text inputs and smaller controls.
    *   Use `rounded-2xl` (20px) or `rounded-3xl` (24px) for modals, floating action bars, and hero headers (`rounded-b-[32px]`).

### 4. Component Blueprints
*   **Primary Button**: `<TouchableOpacity className="w-full bg-primary py-4 rounded-xl items-center justify-center flex-row min-h-[44px]">`
*   **Grouped List Card**: `<View className="bg-card rounded-xl overflow-hidden mx-4 my-2">`
*   **Text Input**: `<TextInput className="bg-input rounded-lg px-4 py-3 text-base text-foreground" placeholderTextColor="#8E8E93" />`
*   **Glass Icon Button**: `<TouchableOpacity className="w-11 h-11 rounded-full bg-white/15 border border-white/20 items-center justify-center min-h-[44px] min-w-[44px]">`
*   **Glass Header Bar**: `<View className="absolute top-0 left-0 right-0 z-50 bg-white/15 border-b border-white/20 px-4 py-3">`
*   **Glass Floating Action Bar**: `<View className="absolute bottom-6 left-4 right-4 bg-white/15 border border-white/20 rounded-2xl p-4 shadow-lg">`
*   **Glass Overlay Badge**: `<View className="bg-white/15 border border-white/20 rounded-full px-3 py-1">`