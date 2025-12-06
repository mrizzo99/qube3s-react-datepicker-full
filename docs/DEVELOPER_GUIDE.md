# React Datepicker Developer Guide

This core repo is a headless-first datepicker built with Vite, React, TypeScript, TailwindCSS, and date-fns. It includes a thin UI wrapper, a headless calendar hook. A Storybook setup in the plus package allows to preview components from both Core package and the Plus package.

## Project layout
- `apps/demo` – Vite demo shell that renders core/plus components.
- `apps/storybook/.storybook` – Storybook 10 config (React + Vite, Docs addon).
- `packages/core/src/headless/useCalendar.ts` – Headless calendar state and derived values (single-date).
- `packages/core/src/components/Calendar` – Visual calendar that consumes the headless hook (single-date).
- `packages/core/src/components/DateInput` – Popover-style input wrapper that toggles the calendar (single-date).
- `packages/plus/src/headless/useRangeCalendar.ts` – Range-aware hook that composes the core hook.
- `packages/plus/src/components/RangeCalendar` – Range-capable calendar UI.
- `packages/plus/src/components/DateRangeInput` – Popover-style input wrapper for range selection.
- `tailwind.config.js`, `apps/demo/src/index.css` – Tailwind wiring (base/components/utilities only).

## Runtime flow (demo)
1) `apps/demo/src/main.tsx` bootstraps React and renders `<App />` into `#root`.
2) `App` renders core `<DateInput />` and plus `<DateRangeInput />` as the demo surfaces.
3) `DateInput` manages `open` state for the popover. The input is read-only and toggles visibility of the calendar container; it can run controlled via `value`/`onChange` or uncontrolled (internal date state).
4) When open, core `Calendar` mounts and calls `useCalendar()` to fetch calendar state, derived weeks, and actions. It also accepts `selectedDate`/`selectDate` props for controlled selection; the visible month seeds from the provided date if present.
5) User actions: month navigation triggers `cal.prev`/`cal.next`; clicking a day calls `selectDate(day)` which either updates internal hook state or bubbles through the controlled prop handler.
6) Plus components follow the same pattern but use `useRangeCalendar` and `RangeCalendar` for range selection.

## Calendar state model (core `packages/core/src/headless/useCalendar.ts`)
- **State**: `currentMonth` (`Date` of the visible month) and single-date selection (`selectedDate: Date | null`). The `initial?: Date` argument seeds `currentMonth`; invalid dates normalize to `new Date()`.
- **Derived grid**: `weeks` is a 2D array of `Date`s representing the visible grid. It:
  - anchors on `startOfWeek(startOfMonth(currentMonth))`,
  - ends at `endOfWeek(endOfMonth(currentMonth))`,
  - iterates day-by-day with `addDays` to build a flat list, then slices into 7-day rows.
- **Actions**: `prev`/`next` shift `currentMonth` with `addMonths`. `selectDate` sets `selectedDate`. Helpers `isSameDay` and `isSameMonth` are re-exported for UI checks.
- **Why headless**: The hook contains calendar math only, enabling multiple visual presentations (simple grid, range picker, multi-month layouts) without rewriting date logic. Components can opt into controlled selection by passing the hook outputs/inputs through props.

## Range state model (plus `packages/plus/src/headless/useRangeCalendar.ts`)
- **Composition**: wraps the core `useCalendar` for month/grid/navigation, and layers range state on top.
- **State**: `selectedRange: { start: Date | null; end: Date | null }`. `initial?: Date | DateRange` seeds the anchor month and range; invalid dates normalize to `new Date()`.
- **Helpers**: `nextRange` applies click-to-select rules (start -> end, start swap, restart on third click), `isInRange` and `isRangeEdge` drive styling.
- **Actions**: `prev`/`next` from core; `selectRange` to set the range; `weeks`/`currentMonth` from core.

## Calendar UI (core `packages/core/src/components/Calendar.tsx`)
- Uses `useCalendar` to render a 7xN grid; accepts optional `selectedDate`/`selectDate` for controlled usage (otherwise defaults to internal hook state). Incoming dates are normalized before formatting to avoid invalid-date errors.
- Header shows the formatted month via `date-fns/format` and prev/next buttons.
- Day cells show dates with:
  - single-date selection styling when `isSameDay(day, selectedDate)` is true,
  - `faded` styling for days outside the current month via `isSameMonth`.
- Layout uses Tailwind utility classes for sizing, spacing, and hover/selection cues.

## Controlled / Uncontrolled concepts
- Controlled: Parent owns the value and passes it in with a change handler. The component reflects whatever value the parent gives and only updates via the handler. Example: `<DateRangeInput value={range} onChange={setRange} />`—the parent state is the single source of truth.
- Uncontrolled: Component manages its own internal state; parent can read via refs/events but doesn’t pass a value prop. Example: `<DateRangeInput />`—it tracks the range internally and just calls `onChange` optionally.
- Key difference: controlled = external state, predictable and sync’d; uncontrolled = internal state, simpler wiring but less centralized control.

## Date input wrapper (core `packages/core/src/components/DateInput.tsx`)
- Maintains `open` popover state with `useState`.
- Supports controlled (`value`/`onChange`) or uncontrolled selection; shows a formatted date string in the input and closes the popover on selection.
- Renders a read-only text input; clicking toggles the calendar container.
- Positions the calendar below the input with simple absolute positioning.

## Range input wrapper (plus `packages/plus/src/components/DateRangeInput.tsx`)
- Maintains `open` popover state with `useState`.
- Supports controlled (`value`/`onChange`) or uncontrolled selection; shows formatted date strings in the input fields and closes the popover on selection of both a start date and an end date for the date range. 
- Renders a read-only text input; clicking in either the start date input field or the end date input field toggles the calendar container.
- Positions the calendar below the date inputs with simple absolute positioning.

## Storybook (`apps/storybook/.storybook`)
- Storybook 10 with the React Vite framework and Docs addon.
- Stories live under `packages/core/**` and `packages/plus/**` and are auto-discovered by the configured globs.
- `tags = ["autodocs"]` enables generated docs; add more stories to demonstrate variations (range selection, multiple months, disabled dates, etc.).
- Current Stories:
  - **Core**
    - Calendar: `Uncontrolled`, `Controlled`
    - DateInput: `Uncontrolled`, `Controlled`
  - **Plus**
    - RangeCalendar: `Uncontrolled`, `Controlled`
    - DateRangeInput: `Uncontrolled`, `Controlled`


## Styling
- Tailwind is the only styling layer; `apps/demo/src/index.css` pulls in base/component/utility layers.
- Components rely on inline utility classes; there is no custom theme yet. Tailwind config is the default scaffold and can be extended with colors, spacing, and typography tokens.

## Local development scripts (package.json)
- `npm run dev` – Vite dev server at `http://localhost:5173`.
- `npm run build` – Production build (outputs to `dist/`).
- `npm run preview` – Preview the production build locally.
- `npm run storybook` – Storybook dev server at `http://localhost:6006` (uses `apps/storybook/.storybook`).
- `npm run build-storybook` – Static Storybook build.

## Extension ideas (for maintainers)
- These are optional backlog ideas for project contributors; they are not shipped features and not instructions for consumers.
- **Min/max or disabled dates**: Add constraints to block selection and visually indicate out-of-range days.
- **Accessibility**: Apply grid roles, roving tab index, keyboard arrow navigation, focus management, and Escape-to-close on the popover.
- **Hover previews for ranges**: Show a temporary range as the user hovers between start and end.
- **Multi-month view**: Generate multiple month grids from the same hook output, or extend the hook to return adjacent months.
- **UI polish**: Add focus/hover states, motion, and improved popover positioning (e.g., Floating UI) as hinted in `todo.txt`.
