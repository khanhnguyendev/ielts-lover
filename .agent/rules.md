# Project Rules

## UI Conventions (Liquid Glass & High Density)

- **Liquid Glass Aesthetic**: 
  - Use `.glass-card` for container-level elements. 
  - **Backdrop Blur**: `backdrop-blur-3xl` or `backdrop-blur-2xl` is mandatory for surface contrast.
  - **Translucency**: `bg-white/40` (Light) and `bg-slate-900/40` (Dark) are standard base layers.
  - **Bordering**: Use high-translucency borders: `border-white/20` (Light) or `border-white/10` (Dark).
  - **Rounded Corners**: Aggressive rounding is required: `rounded-[2.5rem]` for sections/cards, `rounded-2xl` for components.
  - **Glows & Blobs**: Use absolute-positioned blurred blobs (`bg-primary/5 rounded-full blur-[120px]`) to create depth.

- **High-Density Design (8px Grid)**:
  - Follow the **8px grid** strictly for spacing (`p-8`, `gap-4`).
  - For small laptop screens (1024px-1440px), refer to `globals.css` for automated scaling (decreases padding/font-size).

- **Typography**:
  - Headings: `font-black` (800+) with `tracking-tight`. Use `font-outfit` for premium emphasis.
  - Action Labels: `text-[10px] font-black uppercase tracking-[0.2em]`.

- **Component filenames**: kebab-case (`user-profile-menu.tsx`).

- **Shadcn UI**: Use base components from `components/ui`; extend via props/variants. Don't create parallel components (`Button2.tsx`).

- **Utility Rules (MANDATORY)**:
  - **Date-Time**: **ALWAYS** use `formatDate`, `formatTime`, or `formatDateTime` from `@/lib/utils`. 
    - `formatDate(date, includeYear?)`
    - `formatTime(date)`
    - `formatDateTime(date)`
  - **Credits**: **ALWAYS** use `formatCredits(amount)` from `@/lib/utils` for displaying balances. This ensures compact notation (e.g., `1.5k`).

- **Zustand**: Only for ephemeral UI state (sidebar toggles, active practice state).

- **Tailwind**: Mobile-first. Use CSS variable-based semantic tokens (`bg-background`, `text-foreground`, `border-border`), not raw color classes.

- Before creating any new component, check `components/ui` and `components/` for an 80%+ match to extend instead.

## Architectural Layering (NON-NEGOTIABLE)

1.  **UI Layer**: No direct DB/AI access. Call Server Actions or API routes only.
2.  **API / Server Actions Layer**: Thin controller. Validation & Auth only. Calls Service Layer.
3.  **Service Layer (MANDATORY)**: All business logic, AI orchestration, and usage limits live here.
4.  **Repository Layer**: Pure data access. Must be replaceable without breaking services.

**Reject any change that bypasses these boundaries (e.g., DB call in UI).**