import React, { useState } from 'react'
import DatePicker from '@core/components/DatePicker'
import Calendar from '@core/components/Calendar'
import { addDays, format, subDays } from 'date-fns'
import DateRangePicker from '@plus/components/DateRangePicker'
import PlusDatePicker from '@plus/components/DatePicker'
import RangeCalendar from '@plus/components/RangeCalendar'
import { shadcn } from '@plus/adapters'
import { esI18n } from '@core/i18n-presets'
import type { ThemeMode } from '@core/theming'
import { calendarSkinPresets, type SkinPresetKey } from './demoSkins'
import qube3sLogoPng from '../public/brand/qube3s-logo.png'
import qube3sCubePng from '../public/brand/qube3s-cube.png'

const panelClass =
  'relative z-0 rounded-xl border border-[var(--q3-border)] bg-[color:rgb(17_24_39_/_0.85)] p-5 shadow-[0_8px_24px_rgba(2,6,23,0.35)] backdrop-blur focus-within:z-20'
const shadcnSurfaceClass =
  'rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.08)]'
const controlButtonClass = (active: boolean) =>
  [
    'rounded-full border px-3 py-1.5 text-sm transition-colors',
    active
      ? 'border-[var(--q3-primary-soft)] bg-[color:rgb(76_95_213_/_0.18)] text-[var(--q3-text-primary)]'
      : 'border-[var(--q3-border)] text-[var(--q3-text-disabled)] hover:border-[var(--q3-primary-soft)] hover:text-[var(--q3-text-primary)]',
  ].join(' ')

export default function App() {
  const [inlineSelectedDate, setInlineSelectedDate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateEs, setSelectedDateEs] = useState<Date | null>(null)
  const [plusSelectedDate, setPlusSelectedDate] = useState<Date | null>(null)
  const [asyncSelectedDate, setAsyncSelectedDate] = useState<Date | null>(null)
  const [themeDemoMode, setThemeDemoMode] = useState<ThemeMode>('light')
  const [themeDemoDate, setThemeDemoDate] = useState<Date | null>(null)
  const [themeDemoRange, setThemeDemoRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [skinPreset, setSkinPreset] = useState<SkinPresetKey>('default')
  const [skinDemoDate, setSkinDemoDate] = useState<Date | null>(null)
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeThree, setRangeThree] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInput, setRangeInput] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputDefault, setRangeInputDefault] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputPresets, setRangeInputPresets] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputAsync, setRangeInputAsync] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputMobileSheet, setRangeInputMobileSheet] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputThree, setRangeInputThree] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputEs, setRangeInputEs] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputDateTime12h, setRangeInputDateTime12h] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputDateTime24h, setRangeInputDateTime24h] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [shadcnSelectedDate, setShadcnSelectedDate] = useState<Date | null>(null)
  const [shadcnInlineDate, setShadcnInlineDate] = useState<Date | null>(null)
  const [shadcnRange, setShadcnRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [shadcnInlineRange, setShadcnInlineRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const today = new Date()
  const activeCalendarSkin = calendarSkinPresets[skinPreset]
  const plusMinDate = subDays(today, 7)
  const plusMaxDate = addDays(today, 10)
  const validateDemoDateAsync = async (date: Date) => {
    await new Promise(resolve => window.setTimeout(resolve, 700))
    if (date.getDay() === 0) {
      return { valid: false as const, message: 'Demo server rejects Sundays.' }
    }
    return { valid: true as const }
  }
  const validateDemoRangeAsync = async (range: { start: Date | null; end: Date | null }) => {
    await new Promise(resolve => window.setTimeout(resolve, 700))
    if (!range.start || !range.end) return { valid: true as const }
    const lengthInDays = Math.round((range.end.getTime() - range.start.getTime()) / 86400000) + 1
    if (lengthInDays > 5) {
      return { valid: false as const, message: 'Demo server rejects ranges longer than 5 days.' }
    }
    return { valid: true as const }
  }

  return (
    <div className="min-h-screen bg-[var(--q3-bg)] text-[var(--q3-text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.92)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={qube3sLogoPng} alt="Qube3s" className="h-12 w-auto object-contain" />
            <span className="hidden rounded-full border border-[var(--q3-primary-soft)] px-2 py-0.5 text-xs text-[var(--q3-primary-soft)] sm:inline">
              Demo Console
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Placeholder: wire this to the generated docs site when docs publishing is in place. */}
            <button className="rounded-md border border-[var(--q3-border)] px-3 py-1.5 text-sm text-[var(--q3-text-primary)] hover:border-[var(--q3-primary-soft)]">
              Docs
            </button>
            <button className="rounded-md bg-[var(--q3-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--q3-primary-hover)]">
              Try Components
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-screen-2xl">
        <aside className="hidden w-72 shrink-0 border-r border-[var(--q3-border)] bg-[var(--q3-surface)] md:block">
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--q3-text-disabled)]">Navigation</p>
            <nav className="mt-4 space-y-2">
              <a className="block rounded-md bg-[color:rgb(76_95_213_/_0.18)] px-3 py-2 text-sm text-[var(--q3-text-primary)]" href="#single-inline">
                Single Date Inline
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#single-popover">
                Single Date Popover
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#single-es">
                Single Date ES Locale
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#single-plus-constraints">
                Single Date Plus Constraints
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#single-plus-async-validation">
                Single Date Plus Async Validation
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#stock-theme-playground">
                Stock Theme Playground
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#stock-skin-playground">
                Stock Skin Playground
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-inline-2">
                Range Inline 2-Month
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-inline-3">
                Range Inline 3-Month
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-popover-default">
                Range Popover Default
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-popover-presets">
                Range Popover Presets
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-async-validation">
                Range Async Validation
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-mobile-sheet">
                Range Mobile Sheet
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-popover-2">
                Range Popover 2-Month
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-popover-3">
                Range Popover 3-Month
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-es">
                Range ES Locale
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-datetime-12h">
                Range DateTime 12h
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-datetime-24h">
                Range DateTime 24h
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#shadcn-adapters">
                ShadCN Adapters
              </a>
            </nav>
            <div className="mb-5 flex items-center gap-3 rounded-lg border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.35)] px-3 py-2">
              <img src={qube3sCubePng} alt="Qube3s cube" className="h-8 w-8 rounded-md object-cover" />
              <div>
                <p className="text-sm font-medium text-[var(--q3-text-primary)]">Qube3s</p>
                <p className="text-xs text-[var(--q3-text-disabled)]">Component Lab</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="w-full p-4 sm:p-6 lg:p-8">
          <section className="mb-6 rounded-2xl border border-[var(--q3-border)] bg-[linear-gradient(120deg,rgba(76,95,213,0.2),rgba(17,24,39,0.2))] p-6">
            <h1 className="text-2xl font-semibold">Datepicker System Playground</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--q3-text-disabled)]">
              Explore single-date and range-picker behavior across inline and popover surfaces.
            </p>
          </section>

          <div className="space-y-5">
            <section id="single-inline" className={panelClass}>
              <h2 className="text-lg font-semibold">Single date selection (inline)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">Calendar component</p>
              <Calendar selectedDate={inlineSelectedDate} selectDate={setInlineSelectedDate} />
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {inlineSelectedDate ? `Selected: ${format(inlineSelectedDate, 'PPP')}` : 'Choose a date'}
              </p>
            </section>

            <section id="single-popover" className={panelClass}>
              <h2 className="text-lg font-semibold">Single date (popover)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DatePicker component</p>
              <DatePicker value={selectedDate} onChange={setSelectedDate}>
                <DatePicker.Input />
                <DatePicker.Calendar>
                  <DatePicker.CalendarHeader />
                  <DatePicker.CalendarGrid />
                </DatePicker.Calendar>
              </DatePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {selectedDate ? `Selected: ${format(selectedDate, 'PPP')}` : 'Choose a date'}
              </p>
            </section>

            <section id="single-es" className={panelClass}>
              <h2 className="text-lg font-semibold">Single date (popover, es locale)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DatePicker + esI18n preset</p>
              <DatePicker value={selectedDateEs} onChange={setSelectedDateEs} i18n={esI18n}>
                <DatePicker.Input />
                <DatePicker.Calendar>
                  <DatePicker.CalendarHeader />
                  <DatePicker.CalendarGrid />
                </DatePicker.Calendar>
              </DatePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {selectedDateEs
                  ? `Selected: ${format(selectedDateEs, 'PPP', { locale: esI18n.locale })}`
                  : 'Choose a date'}
              </p>
            </section>

            <section id="single-plus-constraints" className={panelClass}>
              <h2 className="text-lg font-semibold">Single date (popover, Plus constraints)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">Plus DatePicker with min/max bounds and weekend blocking</p>
              <PlusDatePicker
                value={plusSelectedDate}
                onChange={setPlusSelectedDate}
                minDate={plusMinDate}
                maxDate={plusMaxDate}
                blockWeekends
              >
                <PlusDatePicker.Input />
                <PlusDatePicker.Calendar>
                  <PlusDatePicker.CalendarHeader />
                  <PlusDatePicker.CalendarGrid />
                </PlusDatePicker.Calendar>
              </PlusDatePicker>
              <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                Allowed window: {format(plusMinDate, 'PPP')} to {format(plusMaxDate, 'PPP')}, excluding Saturdays and Sundays.
              </p>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {plusSelectedDate ? `Selected: ${format(plusSelectedDate, 'PPP')}` : 'Choose an allowed business day'}
              </p>
            </section>

            <section id="single-plus-async-validation" className={panelClass}>
              <h2 className="text-lg font-semibold">Single date (Plus async validation)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">Plus DatePicker with blocking async validation and inline status feedback</p>
              <PlusDatePicker value={asyncSelectedDate} onChange={setAsyncSelectedDate} validateAsync={validateDemoDateAsync}>
                <PlusDatePicker.Input />
                <PlusDatePicker.Calendar>
                  <PlusDatePicker.CalendarHeader />
                  <PlusDatePicker.CalendarGrid />
                </PlusDatePicker.Calendar>
              </PlusDatePicker>
              <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                Demo rule: Sundays are rejected after a short simulated server round trip.
              </p>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {asyncSelectedDate ? `Selected: ${format(asyncSelectedDate, 'PPP')}` : 'Choose a non-Sunday date'}
              </p>
            </section>

            <section id="stock-theme-playground" className={panelClass}>
              <h2 className="text-lg font-semibold">Stock theme playground</h2>
              <p className="mt-1 mb-4 max-w-3xl text-sm text-[var(--q3-text-disabled)]">
                Switch between the built-in stock themes. This demo only targets the stock components, not the external-system adapters.
              </p>
              <div className="mb-5 flex flex-wrap gap-2">
                {(['light', 'dark'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    className={controlButtonClass(themeDemoMode === mode)}
                    onClick={() => setThemeDemoMode(mode)}
                  >
                    {mode === 'light' ? 'Light theme' : 'Dark theme'}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                  <p className="mb-3 text-sm text-[var(--q3-text-disabled)]">Core `DatePicker` preview</p>
                  <DatePicker value={themeDemoDate} onChange={setThemeDemoDate} theme={themeDemoMode}>
                    <DatePicker.Input />
                    <DatePicker.Calendar>
                      <DatePicker.CalendarHeader />
                      <DatePicker.CalendarGrid />
                    </DatePicker.Calendar>
                  </DatePicker>
                  <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                    {themeDemoDate ? `Selected: ${format(themeDemoDate, 'PPP')}` : 'Choose a date'}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                  <p className="mb-3 text-sm text-[var(--q3-text-disabled)]">Plus `RangeCalendar` preview</p>
                  <div className="overflow-x-auto pb-1">
                    <RangeCalendar
                      selectedRange={themeDemoRange}
                      selectRange={setThemeDemoRange}
                      numberOfMonths={2}
                      theme={themeDemoMode}
                    />
                  </div>
                  <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                    {themeDemoRange.start ? `Start: ${format(themeDemoRange.start, 'PPP')}` : 'Start: —'}{' '}
                    {themeDemoRange.end ? `End: ${format(themeDemoRange.end, 'PPP')}` : 'End: —'}
                  </p>
                </div>
              </div>
            </section>

            <section id="stock-skin-playground" className={panelClass}>
              <h2 className="text-lg font-semibold">Stock skin playground</h2>
              <p className="mt-1 mb-4 max-w-3xl text-sm text-[var(--q3-text-disabled)]">
                Swap slot-level skins on the stock `Calendar` without changing its selection or keyboard behavior.
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {(Object.entries(calendarSkinPresets) as Array<[SkinPresetKey, typeof calendarSkinPresets[SkinPresetKey]]>).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    className={controlButtonClass(skinPreset === key)}
                    onClick={() => setSkinPreset(key)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="mb-4 text-xs text-[var(--q3-text-disabled)]">{activeCalendarSkin.description}</p>
              <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                  <Calendar
                    selectedDate={skinDemoDate}
                    selectDate={setSkinDemoDate}
                    skin={activeCalendarSkin.skin}
                  />
                  <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                    {skinDemoDate ? `Selected: ${format(skinDemoDate, 'PPP')}` : 'Choose a date'}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                  <p className="text-sm font-medium text-[var(--q3-text-primary)]">What this is changing</p>
                  <p className="mt-2 text-sm text-[var(--q3-text-disabled)]">
                    Each preset swaps slot classes through the stock `skin` prop. The calendar logic stays the same, but the shell,
                    header buttons, weekday labels, and day-cell states are restyled per instance.
                  </p>
                  <div className="mt-4 rounded-lg border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.45)] p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--q3-text-disabled)]">Current preset</p>
                    <p className="mt-2 text-sm text-[var(--q3-text-primary)]">{activeCalendarSkin.label}</p>
                    <p className="mt-1 text-xs text-[var(--q3-text-disabled)]">
                      `{skinPreset === 'default' ? 'skin={undefined}' : `skin={${activeCalendarSkin.label}}`}`
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="range-inline-2" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (inline, 2 months)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">RangeCalendar component</p>
              <RangeCalendar selectedRange={range} selectRange={setRange} numberOfMonths={2} />
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {range.start ? `Start: ${format(range.start, 'PPP')}` : 'Start: —'}{' '}
                {range.end ? `End: ${format(range.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-inline-3" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (inline, 3 months)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">RangeCalendar + numberOfMonths</p>
              <RangeCalendar selectedRange={rangeThree} selectRange={setRangeThree} numberOfMonths={3} />
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeThree.start ? `Start: ${format(rangeThree.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeThree.end ? `End: ${format(rangeThree.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-popover-default" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (popover, default)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker default month view (presets disabled)</p>
              <DateRangePicker value={rangeInputDefault} onChange={setRangeInputDefault}>
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputDefault.start ? `Start: ${format(rangeInputDefault.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeInputDefault.end ? `End: ${format(rangeInputDefault.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-popover-presets" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (popover, presets enabled)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker default month view + quick presets</p>
              <DateRangePicker value={rangeInputPresets} onChange={setRangeInputPresets} showPresets>
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputPresets.start ? `Start: ${format(rangeInputPresets.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeInputPresets.end ? `End: ${format(rangeInputPresets.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-async-validation" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (async validation)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker with blocking async validation for completed ranges</p>
              <DateRangePicker
                value={rangeInputAsync}
                onChange={setRangeInputAsync}
                validateAsync={validateDemoRangeAsync}
              >
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                Demo rule: completed ranges longer than 5 days are rejected after a short simulated server round trip.
              </p>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputAsync.start ? `Start: ${format(rangeInputAsync.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeInputAsync.end ? `End: ${format(rangeInputAsync.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-mobile-sheet" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (mobile sheet, forced)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker mobile presentation + swipe gestures (phase 2)</p>
              <DateRangePicker
                value={rangeInputMobileSheet}
                onChange={setRangeInputMobileSheet}
                mobile={{
                  enabled: true,
                  mode: 'always',
                  gestures: { swipeMonth: true, swipeToClose: true }
                }}
              >
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">Swipe left/right on month panels to change month. Drag down on the sheet handle to close, or release early to see snap-back.</p>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputMobileSheet.start ? `Start: ${format(rangeInputMobileSheet.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeInputMobileSheet.end ? `End: ${format(rangeInputMobileSheet.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-popover-2" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (popover, 2 months)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker component</p>
              <DateRangePicker value={rangeInput} onChange={setRangeInput} numberOfMonths={2}>
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInput.start ? `Start: ${format(rangeInput.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeInput.end ? `End: ${format(rangeInput.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-popover-3" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (popover, 3 months)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker + numberOfMonths</p>
              <DateRangePicker value={rangeInputThree} onChange={setRangeInputThree} numberOfMonths={3}>
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputThree.start ? `Start: ${format(rangeInputThree.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeInputThree.end ? `End: ${format(rangeInputThree.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-es" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (popover, es locale)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker + esI18n preset</p>
              <DateRangePicker value={rangeInputEs} onChange={setRangeInputEs} i18n={esI18n}>
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputEs.start
                  ? `Start: ${format(rangeInputEs.start, 'PPP', { locale: esI18n.locale })}`
                  : 'Start: —'}{' '}
                {rangeInputEs.end
                  ? `End: ${format(rangeInputEs.end, 'PPP', { locale: esI18n.locale })}`
                  : 'End: —'}
              </p>
            </section>

            <section id="range-datetime-12h" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (date + time, 12-hour)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker + time wheels (12h)</p>
              <DateRangePicker
                value={rangeInputDateTime12h}
                onChange={setRangeInputDateTime12h}
                enableTime
                timeFormat="12h"
                defaultStartTime="08:00 AM"
                defaultEndTime="05:00 PM"
              >
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputDateTime12h.start ? `Start: ${format(rangeInputDateTime12h.start, 'PPP hh:mm a')}` : 'Start: —'}{' '}
                {rangeInputDateTime12h.end ? `End: ${format(rangeInputDateTime12h.end, 'PPP hh:mm a')}` : 'End: —'}
              </p>
            </section>

            <section id="range-datetime-24h" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (date + time, 24-hour)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker + time wheels (24h)</p>
              <DateRangePicker
                value={rangeInputDateTime24h}
                onChange={setRangeInputDateTime24h}
                enableTime
                timeFormat="24h"
                defaultStartTime="08:00"
                defaultEndTime="17:00"
              >
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputDateTime24h.start ? `Start: ${format(rangeInputDateTime24h.start, 'PPP HH:mm')}` : 'Start: —'}{' '}
                {rangeInputDateTime24h.end ? `End: ${format(rangeInputDateTime24h.end, 'PPP HH:mm')}` : 'End: —'}
              </p>
            </section>

            <section id="shadcn-adapters" className={panelClass}>
              <h2 className="text-lg font-semibold">ShadCN adapter system</h2>
              <p className="mt-1 mb-4 max-w-3xl text-sm text-[var(--q3-text-disabled)]">
                Plus-only adapter coverage for the full component surface: Core inline calendar, Plus single-date picker,
                inline range calendar, and range picker.
              </p>
              <div className="space-y-4">
                <div className={shadcnSurfaceClass}>
                  <h3 className="text-base font-semibold">Inline calendar</h3>
                  <p className="mt-1 mb-3 text-sm text-slate-500">`shadcn.Calendar` adapter for the Core `Calendar` surface.</p>
                  <shadcn.Calendar selectedDate={shadcnInlineDate} selectDate={setShadcnInlineDate} />
                  <p className="mt-3 text-sm text-slate-500">
                    {shadcnInlineDate ? `Selected: ${format(shadcnInlineDate, 'PPP')}` : 'Choose a date'}
                  </p>
                </div>

                <div className={shadcnSurfaceClass}>
                  <h3 className="text-base font-semibold">Single date picker</h3>
                  <p className="mt-1 mb-3 text-sm text-slate-500">`shadcn.DatePicker` with Plus business-day constraints.</p>
                  <shadcn.DatePicker
                    value={shadcnSelectedDate}
                    onChange={setShadcnSelectedDate}
                    minDate={plusMinDate}
                    maxDate={plusMaxDate}
                    blockWeekends
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    {shadcnSelectedDate ? `Selected: ${format(shadcnSelectedDate, 'PPP')}` : 'Choose an allowed business day'}
                  </p>
                </div>

                <div className={shadcnSurfaceClass}>
                  <h3 className="text-base font-semibold">Inline range calendar</h3>
                  <p className="mt-1 mb-3 text-sm text-slate-500">`shadcn.RangeCalendar` with presets and two visible months.</p>
                  <div className="overflow-x-auto pb-1">
                    <shadcn.RangeCalendar selectedRange={shadcnInlineRange} selectRange={setShadcnInlineRange} numberOfMonths={2} showPresets />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {shadcnInlineRange.start ? `Start: ${format(shadcnInlineRange.start, 'PPP')}` : 'Start: —'}{' '}
                    {shadcnInlineRange.end ? `End: ${format(shadcnInlineRange.end, 'PPP')}` : 'End: —'}
                  </p>
                </div>

                <div className={shadcnSurfaceClass}>
                  <h3 className="text-base font-semibold">Range picker</h3>
                  <p className="mt-1 mb-3 text-sm text-slate-500">`shadcn.DateRangePicker` with presets, time wheels, and two months.</p>
                  <shadcn.DateRangePicker
                    value={shadcnRange}
                    onChange={setShadcnRange}
                    showPresets
                    enableTime
                    numberOfMonths={2}
                    timeFormat="12h"
                    defaultStartTime="09:00 AM"
                    defaultEndTime="05:00 PM"
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    {shadcnRange.start ? `Start: ${format(shadcnRange.start, 'PPP hh:mm a')}` : 'Start: —'}{' '}
                    {shadcnRange.end ? `End: ${format(shadcnRange.end, 'PPP hh:mm a')}` : 'End: —'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
