✅ Full datepicker components

✅ Headless calendar hook (core)

✅ UI calendar (core)

✅ DatePicker compound API (core)

✅ DateRangePicker compound API (plus)

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
- `packages/plus`: range-only components/hooks (`RangeCalendar`, composable `DateRangePicker`, `useRangeCalendar`), built on core.

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

// 2-month inline range view
<RangeCalendar numberOfMonths={2} />

// 3-month inline range view
<RangeCalendar numberOfMonths={3} />
```

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
  - Windows/Linux: Arrow keys move focus; Home/End jump to start/end of week; PageUp/PageDown change the month.
  - macOS: Arrow keys move focus; Fn+ArrowLeft/Fn+ArrowRight for Home/End; Fn+ArrowUp/Fn+ArrowDown for PageUp/PageDown.
- Press Space or Enter to select the focused day (range picks start/end in sequence).
- Press Escape to close the calendar popover and return focus to the input.
- Mobile virtual keyboards typically don’t expose these keys; keyboard nav requires a hardware keyboard.

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
