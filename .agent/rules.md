# Project Rules

## UI Conventions

- **Component filenames**: kebab-case (`user-profile-menu.tsx`)
- **Shadcn UI**: Use base components from `components/ui`; extend via props/variants. Don't create parallel components (`Button2.tsx`, `CustomInput.tsx`).
- **Date-Time Formatting**: **ALWAYS** use `formatDate`, `formatTime`, or `formatDateTime` from `@/lib/utils` for any date-time display. Never use `toLocaleDateString` or `toLocaleTimeString` directly in components.
  - Use `formatDate(date)` for standard dates (e.g., `Oct 12, 2024`).
  - Use `formatTime(date)` for precise timestamps (e.g., `14:30:15`).
  - Use `formatDateTime(date)` for combined view (e.g., `Oct 12 • 14:30:15`).
- **Zustand**: Only for ephemeral UI state (sidebar toggles, active practice state).
- **Tailwind**: Mobile-first. Use CSS variable-based semantic tokens (`bg-background`, `text-foreground`, `border-border`), not raw color classes.
- Before creating any new component, check `components/ui` and `components/` for an 80%+ match to extend instead.