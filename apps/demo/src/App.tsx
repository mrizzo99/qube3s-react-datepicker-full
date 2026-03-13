import React, { useMemo, useState } from 'react'
import DatePicker from '@core/components/DatePicker'
import Calendar from '@core/components/Calendar'
import { addDays, format, startOfDay } from 'date-fns'
import DateRangePicker from '@plus/components/DateRangePicker'
import RangeCalendar from '@plus/components/RangeCalendar'
import { esI18n } from '@core/i18n-presets'
import qube3sLogoPng from '../public/brand/qube3s-logo.png'
import qube3sCubePng from '../public/brand/qube3s-cube.png'

const panelClass =
  'relative z-0 rounded-xl border border-[var(--q3-border)] bg-[color:rgb(17_24_39_/_0.85)] p-5 shadow-[0_8px_24px_rgba(2,6,23,0.35)] backdrop-blur focus-within:z-20'

export default function App() {
  const { boundedRangeMinDate, boundedRangeMaxDate } = useMemo(() => {
    const today = startOfDay(new Date())
    return {
      boundedRangeMinDate: addDays(today, -7),
      boundedRangeMaxDate: addDays(today, 7),
    }
  }, [])

  const [inlineSelectedDate, setInlineSelectedDate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateEs, setSelectedDateEs] = useState<Date | null>(null)
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
  const [rangeInputBounded, setRangeInputBounded] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [rangeInputBusinessDays, setRangeInputBusinessDays] = useState<{ start: Date | null; end: Date | null }>({
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
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-popover-bounded">
                Range Popover Bounded
              </a>
              <a className="block rounded-md px-3 py-2 text-sm text-[var(--q3-text-primary)] hover:bg-[color:rgb(76_95_213_/_0.12)]" href="#range-popover-business-days">
                Range Popover Business Days
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

            <section id="range-popover-bounded" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (popover, bounded window)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker with a dynamic 7-day window before and after today, plus disabled out-of-range presets</p>
              <DateRangePicker
                value={rangeInputBounded}
                onChange={setRangeInputBounded}
                minDate={boundedRangeMinDate}
                maxDate={boundedRangeMaxDate}
                showPresets
              >
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                Allowed window: {format(boundedRangeMinDate, 'PPP')} to {format(boundedRangeMaxDate, 'PPP')}
              </p>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputBounded.start ? `Start: ${format(rangeInputBounded.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeInputBounded.end ? `End: ${format(rangeInputBounded.end, 'PPP')}` : 'End: —'}
              </p>
            </section>

            <section id="range-popover-business-days" className={panelClass}>
              <h2 className="text-lg font-semibold">Range selection (popover, business days only)</h2>
              <p className="mt-1 mb-3 text-sm text-[var(--q3-text-disabled)]">DateRangePicker with weekends blocked across day cells, presets, and full selected spans</p>
              <DateRangePicker
                value={rangeInputBusinessDays}
                onChange={setRangeInputBusinessDays}
                blockWeekends
                showPresets
              >
                <DateRangePicker.Input />
                <DateRangePicker.Calendar>
                  <DateRangePicker.CalendarHeader />
                  <DateRangePicker.CalendarGrid />
                </DateRangePicker.Calendar>
              </DateRangePicker>
              <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                Try selecting a Saturday or Sunday, or a range that would span across a weekend.
              </p>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                {rangeInputBusinessDays.start ? `Start: ${format(rangeInputBusinessDays.start, 'PPP')}` : 'Start: —'}{' '}
                {rangeInputBusinessDays.end ? `End: ${format(rangeInputBusinessDays.end, 'PPP')}` : 'End: —'}
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
          </div>
        </main>
      </div>
    </div>
  )
}
