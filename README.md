✅ Full datepicker components

✅ Headless calendar hook (core)

✅ UI calendar (core)

✅ DatePicker compound API (core)

✅ DatePicker constraints in Plus

✅ DateRangePicker compound API (plus)

✅ Date + time range picker wheels (plus)

✅ Storybook 10

✅ Vite React starter

✅ TailwindCSS

✅ TypeScript

✅ TypeDoc

✅ Everything wired together and runnable out-of-the-box

📘 Developer documentation lives in [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) (architecture, state model, extension ideas).



✅ Quick Start Instructions

Packages
- `packages/core`: single-date calendar UI (`Calendar`), composable picker (`DatePicker`), headless hook (`useCalendar`).
- `packages/plus`: constrained single-date picker, range/date-time-range components/hooks (`DatePicker`, `RangeCalendar`, composable `DateRangePicker`, `useRangeCalendar`), built on core.

After downloading and extracting the ZIP:

1. Install dependencies

From inside the project folder:

npm install

🟦 Run the dev environment (Vite)

Demo app lives at `apps/demo` and renders both core and plus examples:

📍 http://localhost:5173

npm run dev

🟩 Run Vitest for component test and results

npm run test

If want to see details about failed tests run:
npm run test --Vitest

If want to see vitest run in browser run
npm run test:browser

Why `npm run test:browser` currently runs only two tests:
- `npm run test` runs the main jsdom Vitest suite from `vitest.config.ts`, which includes the repo's standard `*.test.ts` and `*.test.tsx` files.
- `npm run test:browser` uses `vitest.browser.config.ts`, which intentionally includes only `*.browser.test.ts` and `*.browser.test.tsx`.
- At the moment, the only files matching that browser pattern are the Plus async validation browser tests for `DatePicker` and `DateRangePicker`.
- This split is intentional: browser mode is slower and is reserved for cases that benefit from a real browser runtime.

Browser tests require a Playwright browser install the first time:
npm run test:browser:install

Run only the async validation contract and component tests:
npm run test:async-validation

Run only the async validation browser tests:
npm run test:async-validation:browser

Run the verification suite used by CI:
npm run verify
  Will result in the following being run:
  vitest run
    This is the normal jsdom/component test suite, including your regular component tests and the async adapter test.
  npm run test:async-validation:browser
    This runs the two browser-only tests.
  vite build
    This verifies the production build still succeeds.

🟩 Run Storybook (Storybook 10)

Renders stories from core and plus packages:

📍 http://localhost:6006

npm run storybook

🟧 Build the component library (Vite)

Creates a dist/ directory with production build:

npm run build

🟨 Preview production build (optional)
npm run preview

Core usage (single date):
```tsx
import Calendar from '@core/components/Calendar'
import DatePicker from '@core/components/DatePicker'

// Popover - single date selection
<DatePicker>
  <DatePicker.Input />
  <DatePicker.Calendar>
    <DatePicker.CalendarHeader />
    <DatePicker.CalendarGrid />
  </DatePicker.Calendar>
</DatePicker>

// Disable portal rendering (render popover inline in component tree)
<DatePicker portal={false} />

// Inline
<Calendar />

// Custom icon on the input trigger (defaults to built-in calendar icon)
<DatePicker>
  <DatePicker.Input icon={<MyIcon />} iconPosition="left" iconAriaLabel="Choose date" />
  <DatePicker.Calendar>
    <DatePicker.CalendarHeader />
    <DatePicker.CalendarGrid />
  </DatePicker.Calendar>
</DatePicker>
```

Plus usage (single date constraints):
```tsx
import DatePicker from '@plus/components/DatePicker'

// Restrict selection to a bounded window
<DatePicker minDate={new Date(2024, 0, 5)} maxDate={new Date(2024, 0, 20)} />

// Allow only business days inside the bounded window
<DatePicker
  minDate={new Date(2024, 0, 5)}
  maxDate={new Date(2024, 0, 20)}
  blockWeekends
/>

// Full compound composition remains available
<DatePicker blockWeekends>
  <DatePicker.Input />
  <DatePicker.Calendar>
    <DatePicker.CalendarHeader />
    <DatePicker.CalendarGrid />
  </DatePicker.Calendar>
</DatePicker>

// Optional async server validation (only runs when validateAsync is provided)
<DatePicker
  validateAsync={async (date) => {
    const response = await validateDateOnServer(date)
    return response.ok
      ? { valid: true }
      : { valid: false, message: response.message }
  }}
/>
```

Plus usage (range):
```tsx
import DateRangePicker from '@plus/components/DateRangePicker'
import RangeCalendar from '@plus/components/RangeCalendar'

// Popover - date range selection
<DateRangePicker>
  <DateRangePicker.Input />
  <DateRangePicker.Calendar>
    <DateRangePicker.CalendarHeader />
    <DateRangePicker.CalendarGrid />
  </DateRangePicker.Calendar>
</DateRangePicker>

// Disable portal rendering (render popover inline in component tree)
<DateRangePicker portal={false} />

// Inline
<RangeCalendar />

// 2-month popover range view
<DateRangePicker numberOfMonths={2} />

// 3-month popover range view
<DateRangePicker numberOfMonths={3} />

// Quick range presets are opt-in
<DateRangePicker />

// Enable quick presets (Today, Last 7 days, Last 30 days, This Quarter, Year to Date)
<DateRangePicker showPresets />

// Async server validation for completed ranges
<DateRangePicker
  validateAsync={async (range) => {
    const response = await validateRangeOnServer(range)
    return response.ok
      ? { valid: true }
      : { valid: false, message: response.message }
  }}
/>

// Mobile sheet presentation (phase 1)
<DateRangePicker mobile={{ enabled: true, mode: 'auto' }} />

// Force mobile sheet everywhere
<DateRangePicker mobile={{ enabled: true, mode: 'always' }} />

// Phase 2 gestures (enabled by default when mobile sheet is active)
<DateRangePicker
  mobile={{ enabled: true, mode: 'auto', gestures: { swipeMonth: true, swipeToClose: true } }}
/>

// Phase 3 sheet drag physics
// Drag the handle downward: sheet follows pointer, then snaps closed or springs back.

// 2-month inline range view
<RangeCalendar numberOfMonths={2} />

// 3-month inline range view
<RangeCalendar numberOfMonths={3} />
```

Plus usage (date + time range):
```tsx
import DateRangePicker from '@plus/components/DateRangePicker'
import ClockIcon from './ClockIcon'

// 12-hour mode with AM/PM wheel and custom clock icon
<DateRangePicker
  enableTime
  timeFormat="12h"
  defaultStartTime="08:00 AM"
  defaultEndTime="05:00 PM"
  timeLabelIcon={<ClockIcon className="h-4 w-4 text-blue-600" />}
/>

// 24-hour mode
<DateRangePicker
  enableTime
  timeFormat="24h"
  minuteStep={5}
  defaultStartTime="08:00"
  defaultEndTime="17:00"
/>
```

Date + time wheels are a Plus feature and are only available on `DateRangePicker`.

Async validation (Plus `DatePicker` and `DateRangePicker` only)
- `validateAsync` receives the candidate date or completed range and must resolve to `{ valid: true }` or `{ valid: false, message, code? }`.
- `validationBehavior?: 'blocking' | 'optimistic'` defaults to `'blocking'`.
- `validationState?: 'idle' | 'validating' | 'invalid'` and `validationMessage?: string` let you override the built-in status UI.
- `onValidationStateChange` reports validation lifecycle updates with the candidate value and any error metadata.
- Validation remains fully optional; no async work happens unless you pass `validateAsync`.
- In `'blocking'`, the picker waits for server approval before committing and closing.
- In `'optimistic'`, the picker commits immediately; uncontrolled usage rolls back on failure, and controlled usage can respond to `onValidationStateChange`.

`validateAsync` contract
- Single-date `DatePicker` receives one `Date`.
- `DateRangePicker` receives a completed `{ start: Date | null; end: Date | null }` range.
- Your function should convert that candidate into whatever HTTP request your backend expects, then map the server response back to:
  - `{ valid: true }`
  - `{ valid: false, message: string, code?: string }`

Recommended server response shape
```ts
type ServerValidationResponse = {
  valid: boolean
  message?: string
  code?: string
}
```

Example: single-date adapter
```tsx
<DatePicker
  validateAsync={async (date) => {
    const response = await fetch('/api/validate-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: date.toISOString() }),
    })

    const result = await response.json() as {
      valid: boolean
      message?: string
      code?: string
    }

    return result.valid
      ? { valid: true }
      : { valid: false, message: result.message ?? 'Date is not available.', code: result.code }
  }}
/>
```

Example: range adapter
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
      : { valid: false, message: result.message ?? 'Range is not available.', code: result.code }
  }}
/>
```

Testing async validation
- Async validation coverage is split across three layers:
  - adapter contract tests in `packages/plus/src/testing/asyncValidationHttp.test.ts`
  - jsdom component tests in `packages/plus/src/components/DatePicker/DatePicker.test.tsx` and `packages/plus/src/components/DateRangePicker/DateRangePicker.test.tsx`
  - Playwright-backed browser tests in `packages/plus/src/components/DatePicker/DatePicker.browser.test.tsx` and `packages/plus/src/components/DateRangePicker/DateRangePicker.browser.test.tsx`
- The adapter tests use `msw` to mock HTTP responses and verify request payloads plus server-response mapping.
- The component tests verify pending state, blocking vs optimistic behavior, inline errors, and uncontrolled rollback behavior.
- The browser tests exercise the rendered UI with real `fetch`-based `validateAsync` adapters, which gives end-to-end coverage of the client contract without introducing a standalone mock-server package.

How to run the async validation tests
- Install Chromium for Playwright once: `npm run test:browser:install`
- Run adapter + jsdom coverage: `npm run test:async-validation`
- Run browser coverage for Plus `DatePicker` and `DateRangePicker`: `npm run test:async-validation:browser`
- Run the full verification suite: `npm run verify`
- If you add more `*.browser.test.ts` or `*.browser.test.tsx` files later, `npm run test:browser` will pick them up automatically.

Routine regression protection
- CI is defined in [ci.yml](/Users/mikerizzo/git/qube3s-react-datepicker-full/.github/workflows/ci.yml).
- On every push and pull request, CI runs:
  - `npm ci`
  - `npm run test:browser:install -- --with-deps`
  - `npm run verify`
- `npm run verify` runs the full jsdom suite, the async validation browser tests, and the production build so async validation regressions fail the same verification job as build regressions.

Mobile presentation options (`DateRangePicker` only)
- `mobile.enabled`: turns on mobile presentation logic (defaults to `false`).
- `mobile.mode`: `'auto' | 'always' | 'never'` (defaults to `'auto'` when enabled).
- `mobile.breakpoint`: width threshold used by auto mode (defaults to `768`).
- `mobile.gestures.swipeMonth`: swipe horizontally to change month (defaults to `true`).
- `mobile.gestures.swipeToClose`: swipe sheet handle downward to close (defaults to `true`).
- In `auto`, the picker uses a mobile bottom sheet when `(max-width: breakpoint)` or `(pointer: coarse)` matches.
- Phase 3: the mobile sheet now follows the drag gesture and snaps back when the close threshold is not reached.

Multi-month range views
- `DateRangePicker` and `RangeCalendar` default to a single visible month.
- Use `numberOfMonths={2}` or `numberOfMonths={3}` for side-by-side multi-month views.
- Values are clamped to `1..3`.
- On small screens, month panels stack vertically; on larger screens, they render side-by-side.

Internationalization (i18n)
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
Presets are available from `@core/i18n-presets` (`enUSI18n`, `frI18n`, `esI18n`), or pass a custom `i18n` object to override defaults.
Placeholders and the format hint text use `i18n.labels` when you don't supply explicit props.

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

Keyboard navigation
- To set focus within the calendar (click within the calendar grid or Tab to the grid).
  Focus Navigation:
  - Windows/Linux: Arrow keys move focus; Home/End jump to start/end of week; PageUp/PageDown change the month; Shift+PageUp/Shift+PageDown change the year.
  - macOS: Arrow keys move focus; Fn+ArrowLeft/Fn+ArrowRight for Home/End; Fn+ArrowUp/Fn+ArrowDown for PageUp/PageDown. Hold Shift with the same keys to move by year.
- Press Space or Enter to select the focused day (range picks start/end in sequence).
- Press Escape to close the calendar popover and return focus to the input.
- Mobile virtual keyboards typically don’t expose these keys; keyboard nav requires a hardware keyboard.
- Time wheel keyboard controls (when `enableTime` is set on `DateRangePicker`):
  - ArrowUp/ArrowDown change by one option.
  - Home/End jump to first/last option.
  - PageUp/PageDown jump by larger steps.
  - Enter/Space confirm the active option.

Screen reader QA script (grid indexing)
- Validate in browser accessibility tools first:
  - Inspect the calendar root and confirm `role="grid"` with `aria-rowcount` and `aria-colcount`.
  - Inspect a sample day and confirm `role="gridcell"` with `aria-rowindex` and `aria-colindex`.
  - Confirm weekday headers are `role="columnheader"`.
- NVDA + Firefox (recommended baseline):
  - Open `DateRangePicker` and `RangeCalendar`.
  - Move focus into the day grid, then use arrow keys to navigate.
  - Confirm announcements include day label and row/column context.
  - Confirm out-of-month cells are announced as unavailable/disabled and are not selectable.
- JAWS + Chrome:
  - Repeat the same flow and confirm row/column announcements are present.
  - Verify `Home`, `End`, `PageUp`, `PageDown`, and `Shift+PageUp/PageDown` preserve expected position context.
- VoiceOver + Safari:
  - Enter interaction mode on the grid and navigate day cells.
  - Confirm weekday context, row/column position, and disabled behavior match expectations.
- Cover all Plus layouts:
  - Test 1, 2, and 3 month views (`numberOfMonths={1|2|3}`) in both `DateRangePicker` and `RangeCalendar`.
  - Re-check that row indices stay logical when multiple month panels are rendered.
- Optional automation guard:
  - Add RTL tests that assert `aria-rowcount`, `aria-colcount`, and sampled `aria-rowindex` / `aria-colindex` values to catch regressions.

Layering / popovers
- `DatePicker` and `DateRangePicker` popovers render in a portal by default (`document.body`).
- Opt out with `portal={false}` to render inline in component tree.
- Change the portal mount node with `portalContainer`.
- Popover z-layer is controlled by CSS variable `--rdp-z-popover` (default: `1000`) in both portal and inline modes.
- Override globally:
```css
:root {
  --rdp-z-popover: 1400;
}
```
- Override in a scoped container (for example inside a modal shell):
```css
.my-modal-theme {
  --rdp-z-popover: 2200;
}
```
- Example usage with custom portal container:
```tsx
import DatePicker from '@core/components/DatePicker'
import DateRangePicker from '@plus/components/DateRangePicker'

export function BookingModalBody() {
  const portalRoot = document.getElementById('modal-popovers')

  return (
    <>
      <div id="modal-popovers" className="my-modal-theme" />
      <DatePicker portalContainer={portalRoot} />
      <DateRangePicker portalContainer={portalRoot} />
    </>
  )
}
```
- Choose a value above your app's regular content/dropdowns, and below top-most system layers if needed.

References:
date-fns https://date-fns.org/docs/
