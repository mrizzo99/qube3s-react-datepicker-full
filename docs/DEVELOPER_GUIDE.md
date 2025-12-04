# React Datepicker Developer Guide

This repo is a minimal, headless-first datepicker built with Vite, React, TypeScript, TailwindCSS, and date-fns. It includes a thin UI wrapper, a headless calendar hook, and a Storybook setup to preview components.

## Project layout
- `src/main.tsx` – React entry that mounts `App`.
- `src/App.tsx` – Demo shell that renders the `DateInput` component.
- `src/components/Calendar.stories.tsx` – Storybook story for the calendar.
- `src/components/Calendar.tsx` – Visual calendar that consumes the headless hook.
- `src/components/DateInput.tsx` – Popover-style input wrapper that toggles the calendar.
- `src/components/DateRangeInput.stories.tsx` – Storybook story for the Date Range Input.
- `src/components/DateRangeInput.tsx` - Popover-style input wrapper that toggles the calendar and supports selection of a date range; both a start date and an end date.
- `src/headless/useCalendar.ts` – Headless calendar state and derived values.
- `.storybook/*` – Storybook 10 config (React + Vite, Docs addon).
- `tailwind.config.js`, `src/index.css` – Tailwind wiring (base/components/utilities only).

## Runtime flow
1) `src/main.tsx` bootstraps React and renders `<App />` into `#root`.
2) `App` renders `<DateInput />` as the demo surface.
3) `DateInput` manages `open` state for the popover. The input is read-only and toggles visibility of the calendar container; it can run controlled via `value`/`onChange` or uncontrolled (internal date state).
4) When open, `Calendar` mounts and calls `useCalendar()` to fetch calendar state, derived weeks, and actions. It also accepts `selectedDate`/`selectDate` props for controlled selection; the visible month seeds from the provided date if present.
5) User actions: month navigation triggers `cal.prev`/`cal.next`; clicking a day calls `selectDate(day)` which either updates internal hook state or bubbles through the controlled prop handler.

## Calendar state model (`src/headless/useCalendar.ts`)
- **State**: `currentMonth` (`Date` of the visible month) and selection. Selection can be:
  - single-date (`selectedDate: Date | null`) when you pass a `Date` or nothing,
  - or range (`selectedRange: { start: Date | null; end: Date | null }`) when you pass a range or opt into range mode.
  The `initial?: Date | DateRange` argument seeds `currentMonth` and initial selection; invalid dates normalize to `new Date()`.
- **Derived grid**: `weeks` is a 2D array of `Date`s representing the visible grid. It:
  - anchors on `startOfWeek(startOfMonth(currentMonth))`,
  - ends at `endOfWeek(endOfMonth(currentMonth))`,
  - iterates day-by-day with `addDays` to build a flat list, then slices into 7-day rows.
- **Actions**: `prev`/`next` shift `currentMonth` with `addMonths`. `selectDate` sets `selectedDate`. Helpers `isSameDay` and `isSameMonth` are re-exported for UI checks.
- **Range helpers**: `selectRange` sets `{start,end}`, `nextRange(day)` applies click-to-select rules (start -> end, start swap, restart on third click), and `isInRange`/`isRangeEdge` help style the grid.
- **Why headless**: The hook contains calendar math only, enabling multiple visual presentations (simple grid, range picker, multi-month layouts) without rewriting date logic. Components can opt into controlled selection by passing the hook outputs/inputs through props.

## Calendar UI (`src/components/Calendar.tsx`)
- Uses `useCalendar` to render a 7xN grid; accepts optional `selectedDate`/`selectDate` for controlled usage (otherwise defaults to internal hook state). Incoming dates are normalized before formatting to avoid invalid-date errors.
- Header shows the formatted month via `date-fns/format` and prev/next buttons.
- Day cells show dates with:
  - single-date selection styling when `isSameDay(day, selectedDate)` is true,
  - range styling when `mode="range"` or `selectedRange`/`selectRange` are provided (edges get solid highlight, in-range days get a lighter fill),
  - `faded` styling for days outside the current month via `isSameMonth`.
- Layout uses Tailwind utility classes for sizing, spacing, and hover/selection cues.

## Controlled / Uncontrolled concepts
- Controlled: Parent owns the value and passes it in with a change handler. The component reflects whatever value the parent gives and only updates via the handler. Example: `<DateRangeInput value={range} onChange={setRange} />`—the parent state is the single source of truth.
- Uncontrolled: Component manages its own internal state; parent can read via refs/events but doesn’t pass a value prop. Example: `<DateRangeInput />`—it tracks the range internally and just calls `onChange` optionally.
- Key difference: controlled = external state, predictable and sync’d; uncontrolled = internal state, simpler wiring but less centralized control.

## Date input wrapper (`src/components/DateInput.tsx`)
- Maintains `open` popover state with `useState`.
- Supports controlled (`value`/`onChange`) or uncontrolled selection; shows a formatted date string in the input and closes the popover on selection.
- Renders a read-only text input; clicking toggles the calendar container.
- Positions the calendar below the input with simple absolute positioning.

## Date Range input wrapper (`src/components/DateRangeInput.tsx`)
- Maintains `open` popover state with `useState`.
- Supports controlled (`value`/`onChange`) or uncontrolled selection; shows formatted date strings in the input fields and closes the popover on selection of both a start date and an end date for the date range. 
- Renders a read-only text input; clicking in either the start date input field or the end date input field toggles the calendar container.
- Positions the calendar below the date inputs with simple absolute positioning.

## Storybook (`src/components/Calendar.stories.tsx`, `src/components/DateInput.stories.tsx`, `src/components/DateRangeInput.stories.tsx`, `.storybook/*`)
- Storybook 10 with the React Vite framework and Docs addon.
- Stories are auto-discovered from `src/**/*.stories.tsx`.
- `tags = ["autodocs"]` enables generated docs; add more stories to demonstrate variations (range selection, multiple months, disabled dates, etc.).
- Current Stories:
  - **Calendar**
    - `Uncontrolled` renders the plain calendar.
    - `Controlled` wires local state and displays a formatted selection; controls for `selectedDate`/`selectDate` are disabled to avoid invalid arg values.
    - `Range` renders a calendar with date range support enabled.
  - **DateInput**
    - `Uncontrolled` renders a date input calendar for date selection.
    - `Controlled` wires local state and allows for population of the input field via a popover calendar selection.
  - **DateRangeInput**
    - `Uncontrolled` renders two date inputs with a popover calendar for selecting start/end.
    - `Controlled` wires local state and allows range selection via the popover calendar.


## Styling
- Tailwind is the only styling layer; `src/index.css` pulls in base/component/utility layers.
- Components rely on inline utility classes; there is no custom theme yet. Tailwind config is the default scaffold and can be extended with colors, spacing, and typography tokens.

## Local development scripts (package.json)
- `npm run dev` – Vite dev server at `http://localhost:5173`.
- `npm run build` – Production build (outputs to `dist/`).
- `npm run preview` – Preview the production build locally.
- `npm run storybook` – Storybook dev server at `http://localhost:6006`.
- `npm run build-storybook` – Static Storybook build.

## Extension ideas (for maintainers)
- These are optional backlog ideas for project contributors; they are not shipped features and not instructions for consumers.
- **Min/max or disabled dates**: Add constraints to block selection and visually indicate out-of-range days.
- **Accessibility**: Apply grid roles, roving tab index, keyboard arrow navigation, focus management, and Escape-to-close on the popover.
- **Hover previews for ranges**: Show a temporary range as the user hovers between start and end.
- **Multi-month view**: Generate multiple month grids from the same hook output, or extend the hook to return adjacent months.
- **UI polish**: Add focus/hover states, motion, and improved popover positioning (e.g., Floating UI) as hinted in `todo.txt`.
