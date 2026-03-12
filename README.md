✅ Full datepicker components

✅ Headless calendar hook (core)

✅ UI calendar (core)

✅ DatePicker compound API (core)

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
- `packages/plus`: range and date-time-range components/hooks (`RangeCalendar`, composable `DateRangePicker`, `useRangeCalendar`), built on core.

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
