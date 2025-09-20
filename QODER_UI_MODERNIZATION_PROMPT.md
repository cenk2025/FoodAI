# Qoder UI Modernization Prompt

## Project Context
Next.js (App Router) with app/[locale]/layout.tsx and components under components/. Uses Tailwind v4.

## Goal
Modernize UI visuals only (colors, spacing, typography, borders, hover/focus states, animations). Do not change app structure, routing, or file names.

## Strict Constraints (Must Follow)

1. Do NOT add/remove/move pages or layouts. Keep app/[locale]/layout.tsx as the root layout.

2. Do NOT delete or rename these components:
   - components/nav/Navbar.tsx
   - components/nav/Sidebar.tsx
   - components/nav/Footer.tsx

3. Do NOT change imports/exports or paths.

4. Do NOT modify business logic, forms, Supabase calls, or i18n logic.

5. Only adjust Tailwind classes, minimal HTML wrappers, and non-breaking UI props.

6. Preserve responsive behavior:
   - Sidebar: hidden lg:flex w-64 (desktop visible, mobile hidden).
   - Navbar: visible on all sizes; hamburger visible on mobile (lg:hidden).
   - Footer: always visible.

7. Keep accessibility: semantic HTML, focus states, aria-* on toggles.

8. No global renames, no CSS resets.

## UI Improvements to Implement

1. **Spacing scale**: Use p-4/6, gap-4/6, generous whitespace.

2. **Cards**: Rounded-2xl, soft shadow, subtle borders (border-border/50).

3. **Typography**: Larger headings (text-3xl/4xl), readable body (text-base).

4. **Buttons**: Consistent height (h-10), radius (rounded-xl), hover/active transitions.

5. **Inputs**: Unified style, focus rings, clear placeholders.

6. **Navbar**: Sticky, blur background (backdrop-blur), subtle shadow on scroll.

7. **Hamburger**: Left top in mobile; opens a sheet/drawer; do not remove existing menu logic.

8. **Sidebar**: Scrollable area (overflow-y-auto), section headings, active link state.

9. **Footer**: Compact columns on mobile, 3–4 columns on desktop, legal links.

10. **Animations**: Gentle transitions only (no heavy motion).

## Deliverables

Update only Tailwind classes and minimal markup inside existing components to achieve a modern, clean look.

Ensure zero hydration warnings.

Keep the app fully functional (forms, routes, i18n).

After change, run npm run dev without errors.

## Sanity Checks

- /fi renders with sidebar (desktop), navbar, footer visible.
- Hamburger is visible on mobile and opens the menu.
- No deleted files; no renamed paths.