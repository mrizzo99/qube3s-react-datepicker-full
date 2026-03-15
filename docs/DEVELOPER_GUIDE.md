# React Datepicker Developer Guide

This core repo is a headless-first datepicker built with Vite, React, TypeScript, TailwindCSS, and date-fns. It includes composable picker components and headless calendar hooks. A Storybook setup in the plus package allows previewing components from both Core and Plus packages.

## Project layout
- `apps/demo` – Vite demo shell that renders core/plus components.
- `apps/storybook/.storybook` – Storybook 10 config (React + Vite, Docs addon).
- `packages/core/src/headless/useCalendar.ts` – Headless calendar state and derived values (single-date).
- `packages/core/src/components/Calendar` – Visual calendar that consumes the headless hook (single-date).
- `packages/core/src/components/DatePicker` – Compound single-date picker (`Root/Input/Calendar/Header/Grid`).
- `packages/core/src/components/DatePicker/createDatePicker.tsx` – Shared single-date picker factory used by core and Plus variants.
- `packages/plus/src/headless/useRangeCalendar.ts` – Range-aware hook that composes the core hook.
- `packages/plus/src/components/DatePicker` – Plus single-date picker with date constraints.
- `packages/plus/src/components/RangeCalendar` – Range-capable calendar UI.
- `packages/plus/src/components/DateRangePicker` – Compound range picker (`Root/Input/Calendar/Header/Grid`).
- `tailwind.config.js`, `apps/demo/src/index.css` – Tailwind wiring (base/components/utilities only).

## Runtime flow (demo)
1) `apps/demo/src/main.tsx` bootstraps React and renders `<App />` into `#root`.
2) `App` renders core `<DatePicker />` and plus `<DateRangePicker />` as the popover surfaces.
3) `DatePicker` manages `open` state for the popover. `DatePicker.Input` renders read-only input UI and toggles visibility of `DatePicker.Calendar`; it can run controlled via `value`/`onChange` or uncontrolled (internal date state).
   Popovers render in a portal (`document.body`) by default; use `portal={false}` to render inline.
4) `DatePicker.CalendarGrid` calls `useCalendar()` for month/grid state and keyboard navigation behavior.
5) User actions: month navigation triggers `cal.prev`/`cal.next`; clicking a day calls `selectDate(day)` which either updates internal hook state or bubbles through the controlled prop handler.
6) Plus components follow the same pattern with constrained single-date `DatePicker` and range `DateRangePicker` + `useRangeCalendar`.

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
- Controlled: Parent owns the value and passes it in with a change handler. The component reflects whatever value the parent gives and only updates via the handler. 
Example: `<DateRangePicker value={range} onChange={setRange} />` — the parent state is the single source of truth.
- Uncontrolled: Component manages its own internal state; parent can read via refs/events but doesn’t pass a value prop. Example: `<DateRangePicker />` — it tracks the range internally and just calls `onChange` optionally.
- Key difference: controlled = external state, predictable and sync’d; uncontrolled = internal state, simpler wiring but less centralized control.

## Date picker compound API (core `packages/core/src/components/DatePicker/DatePicker.tsx`)
- Exposes composable subcomponents: `DatePicker.Input`, `DatePicker.Calendar`, `DatePicker.CalendarHeader`, `DatePicker.CalendarGrid`.
- Root owns controlled/uncontrolled state and context; subcomponents render UI using shared context.
- Default usage `<DatePicker />` renders the full stack; custom composition can replace layout while keeping behavior logic.
- Popover behavior: `portal` defaults to `true`; use `portalContainer` to customize mount target.

Example:
```tsx
<DatePicker>
  <DatePicker.Input />
  <DatePicker.Calendar>
    <DatePicker.CalendarHeader />
    <DatePicker.CalendarGrid />
  </DatePicker.Calendar>
</DatePicker>
```

Example: inline (non-portal) popover rendering
```tsx
<DatePicker portal={false} />
```

Example: using PNG/JPG/GIF images for the icon
```tsx
import CalendarPng from './calendar.png'
import CalendarGif from './calendar.gif'
import CalendarJpg from './calendar.jpg'

<DatePicker>
  <DatePicker.Input icon={<img src={CalendarPng} alt="" className="h-4 w-4" />} iconAriaLabel="Choose date" />
  <DatePicker.Calendar>
    <DatePicker.CalendarHeader />
    <DatePicker.CalendarGrid />
  </DatePicker.Calendar>
</DatePicker>

<DatePicker>
  <DatePicker.Input icon={<img src={CalendarGif} alt="" className="h-4 w-4" />} iconAriaLabel="Choose date" />
</DatePicker>

<DatePicker>
  <DatePicker.Input icon={<img src={CalendarJpg} alt="" className="h-4 w-4" />} iconAriaLabel="Choose date" />
</DatePicker>
```
Note: you can also pass `icon={<img src="/calendar.png" ... />}` for assets in `public/`, or use external URLs if your build allows them.

## Date picker compound API (plus `packages/plus/src/components/DatePicker/DatePicker.tsx`)
- Exposes the same composable surface as core: `DatePicker.Input`, `DatePicker.Calendar`, `DatePicker.CalendarHeader`, `DatePicker.CalendarGrid`.
- Reuses the shared picker factory from `packages/core/src/components/DatePicker/createDatePicker.tsx` so portal, keyboard, and focus behavior stay aligned with core.
- Adds Plus-only selection constraints:
  - `minDate?: Date`
  - `maxDate?: Date`
  - `blockWeekends?: boolean`
- Adds optional async validation when `validateAsync` is supplied, with blocking and optimistic modes sharing the same status model.
- Disabled dates remain focusable for grid navigation, but are rendered unavailable and cannot be selected by click or keyboard.

Example:
```tsx
import DatePicker from '@plus/components/DatePicker'

<DatePicker
  minDate={new Date(2024, 0, 5)}
  maxDate={new Date(2024, 0, 20)}
  blockWeekends
>
  <DatePicker.Input />
  <DatePicker.Calendar>
    <DatePicker.CalendarHeader />
    <DatePicker.CalendarGrid />
  </DatePicker.Calendar>
</DatePicker>
```

Example: async validation
```tsx
<DatePicker
  validateAsync={async (date) => {
    const response = await validateDateOnServer(date)
    return response.ok
      ? { valid: true }
      : { valid: false, message: response.message }
  }}
  validationBehavior="blocking"
/>
```

## Date range picker compound API (plus `packages/plus/src/components/DateRangePicker/DateRangePicker.tsx`)
- Exposes composable subcomponents: `DateRangePicker.Input`, `DateRangePicker.Calendar`, `DateRangePicker.CalendarHeader`, `DateRangePicker.CalendarGrid`.
- Root owns controlled/uncontrolled state and context; subcomponents reuse range behavior without duplicating logic.
- Multi-month range views are enabled with `numberOfMonths` (default `1`, max `3`).
- Date + time mode is opt-in with `enableTime` and supports `12h` and `24h` wheel layouts.
- Async validation is supported for completed ranges and time-confirmed drafts through `validateAsync`.
- Popover behavior: `portal` defaults to `true`; use `portalContainer` to customize mount target.

Example:
```tsx
<DateRangePicker>
  <DateRangePicker.Input />
  <DateRangePicker.Calendar>
    <DateRangePicker.CalendarHeader />
    <DateRangePicker.CalendarGrid />
  </DateRangePicker.Calendar>
</DateRangePicker>
```

Example: 3-month range picker
```tsx
<DateRangePicker numberOfMonths={3}>
  <DateRangePicker.Input />
  <DateRangePicker.Calendar>
    <DateRangePicker.CalendarHeader />
    <DateRangePicker.CalendarGrid />
  </DateRangePicker.Calendar>
</DateRangePicker>
```

Example: 2-month range picker
```tsx
<DateRangePicker numberOfMonths={2} />
```

Example: inline (non-portal) popover rendering
```tsx
<DateRangePicker portal={false} />
```

Example: 2-month inline range calendar
```tsx
<RangeCalendar numberOfMonths={2} />
```

Example: 3-month inline range calendar
```tsx
<RangeCalendar numberOfMonths={3} />
```

Example: image icon with range input
```tsx
import CalendarPng from './calendar.png'

<DateRangePicker>
  <DateRangePicker.Input
    icon={<img src={CalendarPng} alt="" className="h-4 w-4" />}
    iconPosition="left"
    iconAriaLabel="Choose date range"
  />
</DateRangePicker>
```

Example: date + time range (12-hour)
```tsx
<DateRangePicker
  enableTime
  timeFormat="12h"
  defaultStartTime="08:00 AM"
  defaultEndTime="05:00 PM"
/>
```

Example: date + time range (24-hour) with custom clock icon
```tsx
import ClockIcon from './ClockIcon'

<DateRangePicker
  enableTime
  timeFormat="24h"
  minuteStep={5}
  defaultStartTime="08:00"
  defaultEndTime="17:00"
  timeLabelIcon={<ClockIcon className="h-4 w-4 text-blue-600" />}
  timeLabelIconClassName="text-blue-600"
/>
```

Date + time props on `DateRangePicker`
- `enableTime?: boolean` – toggles time wheels in the popover.
- `timeFormat?: '12h' | '24h'` – `12h` adds an AM/PM wheel; `24h` uses 00-23 hours.
- `minuteStep?: number` – minute options step size (for example `1`, `5`, `15`).
- `defaultStartTime?: string` / `defaultEndTime?: string` – accepts `HH:mm` or `hh:mm AM/PM`.
- `timeLabelIcon?: React.ReactNode` – replaces the default clock icon used in Start/End time headings.
- `timeLabelIconClassName?: string` – className applied to the icon wrapper for easy theming.

Async validation props on Plus `DatePicker` and `DateRangePicker`
- `validateAsync` – async function that resolves to `{ valid: true }` or `{ valid: false, message, code? }`.
- Async validation is completely optional and stays inactive unless `validateAsync` is provided.
- `validationBehavior?: 'blocking' | 'optimistic'` – blocking waits before commit; optimistic commits immediately and rolls back uncontrolled state on failure.
- `validationState?: 'idle' | 'validating' | 'invalid'` – optional external override for the validation UI state.
- `validationMessage?: string` – optional external override for the displayed validation text.
- `onValidationStateChange` – receives `{ state, candidate, message?, code? }` whenever validation starts, fails, or clears.
- `validationMessageClassName?: string` – customizes the inline validation text shown beside the trigger/input group.

When validation runs
- `DatePicker` calls `validateAsync(date)` for the candidate date the user just chose.
- `DateRangePicker` calls `validateAsync(range)` once the range is complete, or when a date+time draft is confirmed.
- The component does not make HTTP calls on its own; `validateAsync` is your adapter from picker state to your backend.
- In `blocking` mode, commit and close wait for a successful validation result.
- In `optimistic` mode, the picker commits immediately and then reports failures through the validation state model. Uncontrolled usage rolls back automatically; controlled usage should react to `onValidationStateChange`.

Expected return shape
- `validateAsync` must always resolve to one of:
  - `{ valid: true }`
  - `{ valid: false, message: string, code?: string }`
- `message` is what the component displays to the user when validation fails.
- `code` is optional metadata you can use for analytics, logging, or custom controlled-state handling.

Recommended server response shape
```ts
type ServerValidationResponse = {
  valid: boolean
  message?: string
  code?: string
}
```

The picker does not require your server to return this exact JSON shape over the wire, but using the same fields keeps the adapter trivial. Any HTTP status can work as long as `validateAsync` maps the server response back into the picker contract.

Example: single-date server adapter
```tsx
<DatePicker
  validateAsync={async (date) => {
    const response = await fetch('/api/validate-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date.toISOString(),
      }),
    })

    const result = await response.json() as {
      valid: boolean
      message?: string
      code?: string
    }

    return result.valid
      ? { valid: true }
      : {
          valid: false,
          message: result.message ?? 'Date is not available.',
          code: result.code,
        }
  }}
/>
```

Example: range server adapter
```tsx
<DateRangePicker
  validateAsync={async (range) => {
    const response = await fetch('/api/validate-range', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: range.start?.toISOString() ?? null,
        end: range.end?.toISOString() ?? null,
      }),
    })

    const result = await response.json() as {
      valid: boolean
      message?: string
      code?: string
    }

    return result.valid
      ? { valid: true }
      : {
          valid: false,
          message: result.message ?? 'Range is not available.',
          code: result.code,
        }
  }}
/>
```

Example: async range validation
```tsx
<DateRangePicker
  validateAsync={async (range) => {
    const response = await validateRangeOnServer(range)
    return response.ok
      ? { valid: true }
      : { valid: false, message: response.message }
  }}
  validationBehavior="optimistic"
/>
```

Testing the async validation API
- The recommended split is:
  - adapter contract tests for HTTP request and response mapping
  - jsdom component tests for picker state behavior
  - browser tests for one real UI + `fetch` path per picker
- This repo implements that split with:
  - `packages/plus/src/testing/asyncValidationHttp.ts` – reusable `fetch` adapters for single-date and range validation
  - `packages/plus/src/testing/asyncValidationHttp.test.ts` – `msw`-backed contract tests
  - `packages/plus/src/components/DatePicker/DatePicker.test.tsx` – Plus single-date async validation behavior in jsdom
  - `packages/plus/src/components/DateRangePicker/DateRangePicker.test.tsx` – range async validation behavior in jsdom
  - `packages/plus/src/components/DatePicker/DatePicker.browser.test.tsx` – browser integration coverage for Plus `DatePicker`
  - `packages/plus/src/components/DateRangePicker/DateRangePicker.browser.test.tsx` – browser integration coverage for `DateRangePicker`

What each layer proves
- Adapter tests verify the network contract:
  - request bodies use ISO strings
  - valid responses map to `{ valid: true }`
  - invalid responses map to `{ valid: false, message, code? }`
  - malformed payloads and network failures fall back to a predictable error shape
- jsdom component tests verify:
  - pending-state rendering
  - blocking vs optimistic behavior
  - inline error display
  - uncontrolled rollback behavior
- Browser tests verify:
  - a user can select a date or range in the rendered UI
  - `validateAsync` performs a real `fetch`
  - the mocked server response updates the UI correctly

How to run these tests locally
- Install Chromium once: `npm run test:browser:install`
- Run the async validation adapter + jsdom tests: `npm run test:async-validation`
- Run the async validation browser tests: `npm run test:async-validation:browser`
- Run the full verification suite: `npm run verify`

Why `npm run test:browser` only runs the browser tests
- The default test command, `npm run test`, uses `vitest.config.ts` and runs the main jsdom suite.
- The browser command, `npm run test:browser`, uses `vitest.browser.config.ts` and intentionally includes only `*.browser.test.ts` and `*.browser.test.tsx`.
- Right now, the only browser-test files in this repo are:
  - `packages/plus/src/components/DatePicker/DatePicker.browser.test.tsx`
  - `packages/plus/src/components/DateRangePicker/DateRangePicker.browser.test.tsx`
- That is why `npm run test:browser` currently shows only those two tests.
- This split is deliberate because browser-mode tests are slower and should be used where a real browser runtime adds value.

Routine regression enforcement
- CI is defined in [ci.yml](/Users/mikerizzo/git/qube3s-react-datepicker-full/.github/workflows/ci.yml).
- On each push and pull request, CI runs:
  - `npm ci`
  - `npm run test:browser:install -- --with-deps`
  - `npm run verify`
- `npm run verify` is the main regression gate because it combines:
  - the full jsdom suite via `vitest run`
  - the async validation browser tests
  - the production `vite build`
- The next high-value additions, if needed later, are stale-response tests and controlled-mode browser scenarios.

## Internationalization (i18n)
- UI components accept an `i18n` prop to localize month/day labels, aria labels, and input formatting.
- Headless hooks accept locale/week-start options (`useCalendar(initial, { locale, weekStartsOn })` and `useRangeCalendar(initial, { locale, weekStartsOn })`).
- `CalendarI18n` lives in `packages/core/src/i18n.ts` and is re-exported from `packages/core/src/index.ts`.
- Placeholders and the format hint text default to `i18n.labels` unless overridden via props.

Example: shared i18n object
```tsx
import { frI18n } from '@core/i18n-presets'
import Calendar from '@core/components/Calendar'
import DatePicker from '@core/components/DatePicker'
import DateRangePicker from '@plus/components/DateRangePicker'

const i18n = frI18n

<Calendar i18n={i18n} />
<DatePicker i18n={i18n} />
<DateRangePicker i18n={i18n} />
```
Presets are exported from `packages/core/src/i18n-presets.ts` (`enUSI18n`, `frI18n`, `esI18n`) and can be used directly or extended.

Extend a preset
```tsx
import { frI18n } from '@core/i18n-presets'

const i18n = {
  ...frI18n,
  labels: {
    ...frI18n.labels,
    calendar: 'Calendrier (compact)'
  }
}
```
One-liner for format overrides:
```tsx
const i18n = { ...frI18n, format: { ...frI18n.format, inputValue: 'Pp' } }
```

## Storybook (`apps/storybook/.storybook`)
- Storybook 10 with the React Vite framework and Docs addon.
- Stories live under `packages/core/**` and `packages/plus/**` and are auto-discovered by the configured globs.
- `tags = ["autodocs"]` enables generated docs; add more stories to demonstrate variations (range selection, multiple months, disabled dates, etc.).
- Current Stories:
  - **Core**
    - Calendar: `Uncontrolled`, `Controlled`
    - DatePicker: `Uncontrolled`, `ControlledComposable`
  - **Plus**
    - RangeCalendar: `Uncontrolled`, `TwoMonthView`, `ThreeMonthView`, `Controlled`
    - DateRangePicker: `Uncontrolled`, `TwoMonthView`, `ThreeMonthView`, `ControlledComposable`, `DateTimeRange24Hour`


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
