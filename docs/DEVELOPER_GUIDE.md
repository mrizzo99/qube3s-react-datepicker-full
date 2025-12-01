# React Datepicker Developer Guide

This repo is a minimal, headless-first datepicker built with Vite, React, TypeScript, TailwindCSS, and date-fns. It includes a thin UI wrapper, a headless calendar hook, and a Storybook setup to preview components.

## Project layout
- `src/main.tsx` – React entry that mounts `App`.
- `src/App.tsx` – Demo shell that renders the `DateInput` component.
- `src/components/DateInput.tsx` – Popover-style input wrapper that toggles the calendar.
- `src/components/Calendar.tsx` – Visual calendar that consumes the headless hook.
- `src/components/Calendar.stories.tsx` – Storybook story for the calendar.
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
- **State**: `currentMonth` (`Date` of the visible month) and `selectedDate` (`Date | null`). The `initial?: Date` argument seeds `currentMonth` (with invalid dates normalized to `new Date()`).
- **Derived grid**: `weeks` is a 2D array of `Date`s representing the visible grid. It:
  - anchors on `startOfWeek(startOfMonth(currentMonth))`,
  - ends at `endOfWeek(endOfMonth(currentMonth))`,
  - iterates day-by-day with `addDays` to build a flat list, then slices into 7-day rows.
- **Actions**: `prev`/`next` shift `currentMonth` with `addMonths`. `selectDate` sets `selectedDate`. Helpers `isSameDay` and `isSameMonth` are re-exported for UI checks.
- **Why headless**: The hook contains calendar math only, enabling multiple visual presentations (simple grid, range picker, multi-month layouts) without rewriting date logic. Components can opt into controlled selection by passing the hook outputs/inputs through props.

## Calendar UI (`src/components/Calendar.tsx`)
- Uses `useCalendar` to render a 7xN grid; accepts optional `selectedDate`/`selectDate` for controlled usage (otherwise defaults to internal hook state). Incoming dates are normalized before formatting to avoid invalid-date errors.
- Header shows the formatted month via `date-fns/format` and prev/next buttons.
- Day cells show dates with:
  - `selected` styling when `isSameDay(day, selectedDate)` is true.
  - `faded` styling for days outside the current month via `isSameMonth`.
- Layout uses Tailwind utility classes for sizing, spacing, and hover/selection cues.

## Date input wrapper (`src/components/DateInput.tsx`)
- Maintains `open` popover state with `useState`.
- Supports controlled (`value`/`onChange`) or uncontrolled selection; shows a formatted date string in the input and closes the popover on selection.
- Renders a read-only text input; clicking toggles the calendar container.
- Positions the calendar below the input with simple absolute positioning.

## Storybook (`src/components/Calendar.stories.tsx`, `.storybook/*`)
- Storybook 10 with the React Vite framework and Docs addon.
- Stories are auto-discovered from `src/**/*.stories.tsx`.
- `tags = ["autodocs"]` enables generated docs; add more stories to demonstrate variations (range selection, multiple months, disabled dates, etc.).
- Current stories: `Uncontrolled` renders the plain calendar; `Controlled` wires local state and displays a formatted selection. Controls for `selectedDate`/`selectDate` are disabled to avoid invalid arg values.

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
- **Range support**: Expand `useCalendar` to track `start`/`end` dates, hover previews, and shortcuts.
- **Multi-month view**: Generate multiple month grids from the same hook output, or extend the hook to return adjacent months.
- **UI polish**: Add focus/hover states, motion, and improved popover positioning (e.g., Floating UI) as hinted in `todo.txt`.
