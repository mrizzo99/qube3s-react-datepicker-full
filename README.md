✅ Full datepicker components

✅ Headless calendar hook (core)

✅ UI calendar (core)

✅ DateInput wrapper (core)

✅ Range calendar + DateRangeInput (plus)

✅ Storybook 10

✅ Vite React starter

✅ TailwindCSS

✅ TypeScript

✅ TypeDoc

✅ Everything wired together and runnable out-of-the-box

📘 Developer documentation lives in [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) (architecture, state model, extension ideas).



✅ Quick Start Instructions

Packages
- `packages/core`: single-date calendar UI (`Calendar`), popover input (`DateInput`), headless hook (`useCalendar`).
- `packages/plus`: range-only components/hooks (`RangeCalendar`, `DateRangeInput`, `useRangeCalendar`), built on core.

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
import DateInput from '@core/components/DateInput'

//Popover - single date selection
<DateInput />

// InLine
<Calendar />

// Custom icon on the input trigger (defaults to built-in calendar icon)
<DateInput icon={<MyIcon />} iconPosition="left" iconAriaLabel="Choose date" />
```

Plus usage (range):
```tsx
import DateRangeInput from '@plus/components/DateRangeInput'
import RangeCalendar from '@plus/components/RangeCalendar'

// Popover - date range selection (start and end date)
<DateRangeInput />

// Inline
<RangeCalendar />
```

Keyboard navigation
- To set focus within the calendar (click within the calendar grid or Tab to the grid).
  Focus Navigation:
  - Windows/Linux: Arrow keys move focus; Home/End jump to start/end of week; PageUp/PageDown change the month.
  - macOS: Arrow keys move focus; Fn+ArrowLeft/Fn+ArrowRight for Home/End; Fn+ArrowUp/Fn+ArrowDown for PageUp/PageDown.
- Press Space or Enter to select the focused day (range picks start/end in sequence).
- Press Escape to close the calendar popover and return focus to the input.
- Mobile virtual keyboards typically don’t expose these keys; keyboard nav requires a hardware keyboard.

References:
date-fns https://date-fns.org/docs/
