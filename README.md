# Qube3s React Datepicker

Qube3s React Datepicker is a headless-first React datepicker library with two packages:

- `@qube3s/react-datepicker-core`: public single-date components and calendar primitives
- `@qube3s/react-datepicker-plus`: paid extensions for constraints, ranges, date-time ranges, presets, and system adapters

## Choose a package

Use Core if you need:

- A single-date `Calendar`
- A composable single-date `DatePicker`
- The headless `useCalendar` hook
- Light/dark appearance support and lightweight CSS variable theming

Use Plus if you need:

- Bounded dates and weekend blocking
- Date-range selection
- Date and Time range selection
- Quick presets
- Multi-month range views
- Mobile sheet behavior
- ShadCN and MUI adapters

## Install

Core:

```bash
npm install @qube3s/react-datepicker-core
```

Plus:

Qube3s Plus is distributed through a private Cloudsmith registry. See [docs/INSTALL_PLUS.md](docs/INSTALL_PLUS.md) for the customer install flow.

## Support Matrix

| Area | Supported | Notes |
| --- | --- | --- |
| React | 18.2.x | Required peer dependency |
| React DOM | 18.2.x | Required peer dependency |
| Package format | ESM | Published as `type: module` with package `exports` |
| Bundlers | Modern bundlers with package exports support | Vite is the primary dev and test setup |
| Node.js | 18+ recommended, 20 LTS preferred | Needed for install, build, docs, and release workflows |
| TypeScript | 5.x recommended | Packages ship `.d.ts` files |
| Browsers | Evergreen browsers | Automated browser coverage is currently Chromium-focused |
| SSR frameworks | Supported in modern React SSR apps | Validate in-app if you rely on custom SSR behavior |
| Distribution | Core: public npm, Plus: private Cloudsmith | Plus depends on the matching Core version |

React 19, legacy CommonJS environments, and non-evergreen browsers are not part of the current support matrix.

## Quick Start

### Core `DatePicker`

```tsx
import DatePicker from '@qube3s/react-datepicker-core/components/DatePicker'

export function Example() {
  return <DatePicker />
}
```

### Core `Calendar`

```tsx
import Calendar from '@qube3s/react-datepicker-core/components/Calendar'

export function Example() {
  return <Calendar />
}
```


### Plus constrained `DatePicker`

```tsx
import DatePicker from '@qube3s/react-datepicker-plus/components/DatePicker'

export function Example() {
  return (
    <DatePicker
      minDate={new Date(2026, 0, 5)}
      maxDate={new Date(2026, 0, 20)}
      blockWeekends
    />
  )
}
```

### Plus `DateRangePicker`

```tsx
import DateRangePicker from '@qube3s/react-datepicker-plus/components/DateRangePicker'

export function Example() {
  return <DateRangePicker showPresets numberOfMonths={2} />
}
```

## Common Usage

### Composable Core picker

```tsx
import DatePicker from '@qube3s/react-datepicker-core/components/DatePicker'

export function Example() {
  return (
    <DatePicker>
      <DatePicker.Input />
      <DatePicker.Calendar>
        <DatePicker.CalendarHeader />
        <DatePicker.CalendarGrid />
      </DatePicker.Calendar>
    </DatePicker>
  )
}
```

### Inline rendering instead of a portal

```tsx
import DatePicker from '@qube3s/react-datepicker-core/components/DatePicker'

export function Example() {
  return <DatePicker portal={false} />
}
```

### Core appearance

```tsx
import type { CSSProperties } from 'react'
import DatePicker from '@qube3s/react-datepicker-core/components/DatePicker'

export function Example() {
  return (
    <div
      style={
        {
          '--rdp-accent': '#0f766e',
          '--rdp-ring': '#0f766e',
        } as CSSProperties
      }
    >
      <DatePicker appearance="light" />
    </div>
  )
}
```

Supported Core appearance values:

- `inherit`
- `light`
- `dark`

### Plus async validation

```tsx
import DatePicker from '@qube3s/react-datepicker-plus/components/DatePicker'

export function Example() {
  return (
    <DatePicker
      validateAsync={async (date) => {
        const response = await validateDateOnServer(date)
        return response.ok
          ? { valid: true }
          : { valid: false, message: response.message }
      }}
    />
  )
}
```

### Plus Date and Time range

```tsx
import DateRangePicker from '@qube3s/react-datepicker-plus/components/DateRangePicker'

export function Example() {
  return (
    <DateRangePicker
      enableTime
      timeFormat="24h"
      minuteStep={5}
      defaultStartTime="08:00"
      defaultEndTime="17:00"
    />
  )
}
```

### Plus adapters

```tsx
import { mui, shadcn } from '@qube3s/react-datepicker-plus/adapters'

export function Example() {
  return (
    <>
      <shadcn.DateRangePicker showPresets numberOfMonths={2} />
      <mui.DatePicker blockWeekends />
    </>
  )
}
```

## Package Surface

Core exports:

- `Calendar`
- `DatePicker`
- `useCalendar`
- Styling, theming, i18n, floating, and motion helpers

Plus exports:

- Constrained single-date `DatePicker`
- `RangeCalendar`
- `DateRangePicker`
- `useRangeCalendar`
- Date-range preset helpers
- Animation pack
- Adapters : `shadcn` and `mui`

## Documentation

- Consumer install for Plus: [docs/INSTALL_PLUS.md](docs/INSTALL_PLUS.md)
- Repo architecture and contributor workflow: [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
- Release and publishing workflow: [docs/RELEASE.md](docs/RELEASE.md)
- Generated API docs: `docs/api/index.html`

## Development

This README is consumer-focused. Local repo setup, demo app usage, Storybook, testing, and verification commands live in [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md).
