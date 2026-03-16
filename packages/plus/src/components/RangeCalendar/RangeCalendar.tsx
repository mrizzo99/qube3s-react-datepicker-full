import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDays,
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { resolveCalendarI18n, type CalendarI18n } from '@core/i18n'
import {
  getThemeScopeClassName,
  isBookingTheme,
  isMaterialTheme,
  isModernMinimalTheme,
  mergeThemeWithSkin,
  type ThemeMode,
  type ThemeSkin,
} from '../../theming'
import { animateMonthSlide } from '@core/motion'
import { useRangeCalendar, type DateRange } from '../../headless/useRangeCalendar'
import { getDateRangePresets, type DateRangePreset } from '../../presets/dateRangePresets'

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ')

export type RangeCalendarProps = {
  selectedRange?: DateRange | null
  selectRange?: (range: DateRange) => void
  onEscape?: () => void
  i18n?: CalendarI18n
  numberOfMonths?: number
  showPresets?: boolean
  theme?: ThemeMode
  skin?: RangeCalendarSkin
}

export type RangeCalendarDaySlotState = {
  rangeEdge: boolean
  inRange: boolean
  faded: boolean
  focused: boolean
}

export type RangeCalendarTheme = {
  containerClassName?: string
  headerClassName?: string
  headerNavGroupClassName?: string
  headerNavButtonClassName?: string
  monthLabelClassName?: string
  presetsSectionClassName?: string
  presetsListClassName?: string
  presetButtonClassName?: (active: boolean) => string
  monthsViewportClassName?: string
  monthPanelClassName?: string
  monthPanelTitleClassName?: string
  weekdayRowClassName?: string
  weekdayCellClassName?: string
  weekRowsClassName?: string
  weekRowClassName?: string
  dayButtonClassName?: (state: RangeCalendarDaySlotState) => string
  icons?: {
    prevYear?: React.ReactNode
    prevMonth?: React.ReactNode
    nextMonth?: React.ReactNode
    nextYear?: React.ReactNode
  }
}

export type RangeCalendarSkin = ThemeSkin<RangeCalendarTheme>

const defaultRangeCalendarTheme: RangeCalendarTheme = {
  containerClassName:
    'inline-block w-fit max-w-[calc(100vw-1rem)] rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50',
  headerClassName: 'mb-3 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex gap-1',
  headerNavButtonClassName:
    'inline-flex h-8 w-8 items-center justify-center rounded border border-transparent text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:ring-blue-400',
  monthLabelClassName: 'text-center text-sm font-semibold text-gray-900 dark:text-gray-50 sm:text-base',
  presetsSectionClassName: 'mb-3',
  presetsListClassName: 'flex flex-wrap gap-2',
  presetButtonClassName: active =>
    cx(
      'rounded border px-2 py-1 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 sm:text-sm',
      active
        ? 'border-blue-600 bg-blue-600 text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-blue-300 dark:hover:bg-blue-950/50',
    ),
  monthsViewportClassName: 'flex flex-col gap-4 sm:flex-row sm:gap-3',
  monthPanelClassName: 'w-72 rounded-md border border-gray-200 bg-gray-50/50 p-2 dark:border-gray-700 dark:bg-gray-800/60 sm:w-64',
  monthPanelTitleClassName: 'mb-1 text-center text-sm font-medium text-gray-700 dark:text-gray-200',
  weekdayRowClassName: 'mb-1 grid grid-cols-7 text-sm text-gray-600 dark:text-gray-400',
  weekdayCellClassName: 'text-center',
  weekRowsClassName: 'flex flex-col gap-1',
  weekRowClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ rangeEdge, inRange, faded }) =>
    cx(
      'rounded border border-transparent p-1 text-gray-900 transition-colors duration-150 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none dark:text-gray-100 dark:hover:border-blue-300 dark:focus-visible:border-blue-300',
      rangeEdge ? 'bg-blue-600 text-white' : inRange ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-100' : '',
      faded ? 'text-gray-300 dark:text-gray-600' : 'hover:bg-blue-100 dark:hover:bg-blue-950/60',
    ),
}

const materialRangeCalendarTheme: RangeCalendarSkin = {
  containerClassName:
    'inline-block w-fit max-w-[calc(100vw-1rem)] rounded-[32px] border border-slate-200 bg-slate-50 p-4 text-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.14)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  headerClassName: 'mb-4 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  monthLabelClassName: 'text-center text-base font-medium tracking-[0.01em] text-slate-900 dark:text-slate-50',
  presetsSectionClassName: 'mb-4',
  presetsListClassName: 'flex flex-wrap gap-2',
  presetButtonClassName: active =>
    cx(
      'rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400 sm:text-sm',
      active
        ? 'border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500'
        : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    ),
  monthsViewportClassName: 'flex flex-col gap-4 sm:flex-row sm:gap-3',
  monthPanelClassName: 'w-72 rounded-[28px] border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-950/70 sm:w-64',
  monthPanelTitleClassName: 'mb-2 text-center text-sm font-medium text-slate-700 dark:text-slate-200',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400',
  weekdayCellClassName: 'text-center',
  weekRowsClassName: 'flex flex-col gap-1.5',
  weekRowClassName: 'grid grid-cols-7 gap-1.5',
  dayButtonClassName: ({ rangeEdge, inRange, faded, focused }) =>
    cx(
      'rounded-full border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400',
      rangeEdge ? 'bg-sky-600 text-white dark:bg-sky-500' : '',
      !rangeEdge && inRange ? 'bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-100' : '',
      !rangeEdge && !inRange ? 'hover:bg-slate-200 dark:hover:bg-slate-800' : '',
      faded ? 'text-slate-300 dark:text-slate-600' : 'text-slate-900 dark:text-slate-50',
      focused && !rangeEdge ? 'bg-slate-100 dark:bg-slate-800' : '',
    ),
}

const modernMinimalRangeCalendarTheme: RangeCalendarSkin = {
  containerClassName:
    'inline-block w-fit max-w-[calc(100vw-1rem)] rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
  headerClassName: 'mb-4 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-zinc-600 transition-colors hover:bg-zinc-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600',
  monthLabelClassName: 'text-center text-sm font-medium tracking-[0.01em] text-zinc-900 dark:text-zinc-50',
  presetsSectionClassName: 'mb-4',
  presetsListClassName: 'flex flex-wrap gap-2',
  presetButtonClassName: active =>
    cx(
      'rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 sm:text-sm',
      active
        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
        : 'border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
    ),
  monthsViewportClassName: 'flex flex-col gap-4 sm:flex-row sm:gap-3',
  monthPanelClassName: 'w-72 rounded-xl border border-zinc-200 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/70 sm:w-64',
  monthPanelTitleClassName: 'mb-2 text-center text-sm font-medium text-zinc-700 dark:text-zinc-200',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400',
  weekdayCellClassName: 'text-center',
  weekRowsClassName: 'flex flex-col gap-1',
  weekRowClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ rangeEdge, inRange, faded, focused }) =>
    cx(
      'rounded-xl border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600',
      rangeEdge ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950' : '',
      !rangeEdge && inRange ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' : '',
      !rangeEdge && !inRange ? 'hover:bg-zinc-200/80 dark:hover:bg-zinc-800' : '',
      faded ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-zinc-50',
      focused && !rangeEdge ? 'bg-zinc-100 dark:bg-zinc-900' : '',
    ),
}

const bookingRangeCalendarTheme: RangeCalendarSkin = {
  containerClassName:
    'inline-block w-fit max-w-[calc(100vw-1rem)] rounded-2xl border border-sky-200 bg-white p-4 text-slate-950 shadow-[0_20px_40px_rgba(0,53,128,0.14)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  headerClassName: 'mb-4 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1.5',
  headerNavButtonClassName:
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-sky-50 text-[#003580] transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  monthLabelClassName: 'text-center text-sm font-semibold tracking-[0.01em] text-[#003580] dark:text-white sm:text-base',
  presetsSectionClassName: 'mb-4',
  presetsListClassName: 'flex flex-wrap gap-2',
  presetButtonClassName: active =>
    cx(
      'rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:focus-visible:ring-sky-400 sm:text-sm',
      active
        ? 'border-[#006ce4] bg-[#006ce4] text-white dark:border-sky-500 dark:bg-sky-500'
        : 'border-sky-200 bg-white text-[#003580] hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800',
    ),
  monthsViewportClassName: 'flex flex-col gap-4 sm:flex-row sm:gap-3',
  monthPanelClassName: 'w-72 rounded-2xl border border-sky-100 bg-sky-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/70 sm:w-64',
  monthPanelTitleClassName: 'mb-2 text-center text-sm font-medium text-[#003580] dark:text-sky-100',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400',
  weekdayCellClassName: 'text-center',
  weekRowsClassName: 'flex flex-col gap-1.5',
  weekRowClassName: 'grid grid-cols-7 gap-1.5',
  dayButtonClassName: ({ rangeEdge, inRange, faded, focused }) =>
    cx(
      'rounded-xl border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:focus-visible:ring-sky-400',
      rangeEdge ? 'border-[#006ce4] bg-[#006ce4] text-white dark:border-sky-500 dark:bg-sky-500' : '',
      !rangeEdge && inRange ? 'bg-sky-100 text-[#003580] dark:bg-sky-950/60 dark:text-sky-100' : '',
      !rangeEdge && !inRange ? 'hover:border-sky-200 hover:bg-sky-50 dark:hover:border-slate-700 dark:hover:bg-slate-800' : '',
      faded ? 'text-slate-300 dark:text-slate-600' : 'text-slate-900 dark:text-slate-50',
      focused && !rangeEdge ? 'bg-amber-50 dark:bg-slate-800' : '',
    ),
}

const RangeCalendarThemeContext = React.createContext<RangeCalendarTheme>(defaultRangeCalendarTheme)

const useRangeCalendarTheme = () => React.useContext(RangeCalendarThemeContext)

type MonthView = {
  monthStart: Date
  weeks: Date[][]
  weekdayLabels: string[]
}

const clampNumberOfMonths = (value: number | undefined) => {
  if (!value) return 1
  return Math.max(1, Math.min(3, Math.trunc(value)))
}

const buildMonthWeeks = (
  monthStart: Date,
  weekOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale']; weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
) => {
  const start = startOfWeek(startOfMonth(monthStart), weekOptions)
  const end = endOfWeek(endOfMonth(monthStart), weekOptions)
  const days: Date[] = []

  let pointer = start
  while (pointer <= end) {
    days.push(pointer)
    pointer = addDays(pointer, 1)
  }

  const weeks: Date[][] = []
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7))
  }

  return weeks
}

const getVisibleRangeDays = (
  monthStart: Date,
  numberOfMonths: number,
  weekOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale']; weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
) => {
  const firstDay = startOfWeek(startOfMonth(monthStart), weekOptions)
  const lastVisibleMonth = addMonths(monthStart, numberOfMonths - 1)
  const lastDay = endOfWeek(endOfMonth(lastVisibleMonth), weekOptions)
  const days: Date[] = []

  let pointer = firstDay
  while (pointer <= lastDay) {
    days.push(pointer)
    pointer = addDays(pointer, 1)
  }

  return days
}

function RangeCalendarRoot({
  selectedRange: controlledSelectedRange,
  selectRange: controlledSelectRange,
  onEscape,
  i18n,
  numberOfMonths,
  showPresets = false,
  theme: themeMode,
}: RangeCalendarProps) {
  const theme = useRangeCalendarTheme()
  const normalizedRange = controlledSelectedRange ?? null
  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale],
  )
  const cal = useRangeCalendar(normalizedRange ?? undefined, {
    locale: resolvedI18n.locale,
    weekStartsOn: resolvedI18n.weekStartsOn,
  })
  const selectedRange = normalizedRange ?? cal.selectedRange
  const selectRange = controlledSelectRange ?? cal.selectRange
  const normalizedMonths = clampNumberOfMonths(numberOfMonths)
  const monthLabelId = useMemo(
    () => `range-cal-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
    [cal.currentMonth],
  )

  const anchorDate = selectedRange?.start ?? selectedRange?.end ?? cal.currentMonth
  const [focusDate, setFocusDate] = useState<Date>(anchorDate)
  const gridRef = useRef<HTMLDivElement>(null)

  const weekOptions = useMemo(
    () => ({
      locale: resolvedI18n.locale,
      weekStartsOn: (resolvedI18n.weekStartsOn ?? 0) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    }),
    [resolvedI18n.locale, resolvedI18n.weekStartsOn],
  )

  const visibleMonths = useMemo(
    () =>
      Array.from({ length: normalizedMonths }, (_, index) => {
        const monthStart = startOfMonth(addMonths(cal.currentMonth, index))
        const weeks = buildMonthWeeks(monthStart, weekOptions)

        return {
          monthStart,
          weeks,
          weekdayLabels: (weeks[0] ?? []).map(day =>
            format(day, resolvedI18n.format.weekdayLabel, formatOptions),
          ),
        } satisfies MonthView
      }),
    [
      cal.currentMonth,
      normalizedMonths,
      weekOptions,
      resolvedI18n.format.weekdayLabel,
      formatOptions,
    ],
  )

  const visibleRangeDays = useMemo(
    () => getVisibleRangeDays(cal.currentMonth, normalizedMonths, weekOptions),
    [cal.currentMonth, normalizedMonths, weekOptions],
  )

  const monthAnimatorRef = useRef<HTMLDivElement>(null)
  const previousMonthRef = useRef(cal.currentMonth)

  useEffect(() => {
    const monthOffset = differenceInCalendarMonths(startOfMonth(focusDate), startOfMonth(cal.currentMonth))

    if (monthOffset < 0) {
      cal.goToMonth(startOfMonth(focusDate))
      return
    }

    if (monthOffset >= normalizedMonths) {
      cal.goToMonth(addMonths(startOfMonth(focusDate), -(normalizedMonths - 1)))
    }
  }, [focusDate, cal, normalizedMonths])

  useEffect(() => {
    const prev = previousMonthRef.current
    const next = cal.currentMonth
    const monthDelta = differenceInCalendarMonths(startOfMonth(next), startOfMonth(prev))

    if (monthAnimatorRef.current) {
      animateMonthSlide(monthAnimatorRef.current, monthDelta)
    }

    previousMonthRef.current = next
  }, [cal.currentMonth])

  useEffect(() => {
    const focusMonthOffset = differenceInCalendarMonths(
      startOfMonth(focusDate),
      startOfMonth(cal.currentMonth),
    )
    const focusPanelIndex =
      focusMonthOffset < 0 ? 0 : Math.min(normalizedMonths - 1, focusMonthOffset)
    const focusPanelMonth = visibleMonths[focusPanelIndex]?.monthStart ?? visibleMonths[0]?.monthStart

    if (!focusPanelMonth) return

    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[role="gridcell"][data-date-key="${focusDate.getTime()}-${focusPanelMonth.getTime()}"]`,
    )
    cell?.focus()
  }, [cal.currentMonth, focusDate, normalizedMonths, visibleMonths])

  const moveFocusByDays = (delta: number) => {
    setFocusDate(previous => addDays(previous, delta))
  }

  const presetRanges = useMemo(
    () =>
      getDateRangePresets({
        today: resolvedI18n.labels.presetToday,
        last7Days: resolvedI18n.labels.presetLast7Days,
        last30Days: resolvedI18n.labels.presetLast30Days,
        thisQuarter: resolvedI18n.labels.presetThisQuarter,
        yearToDate: resolvedI18n.labels.presetYearToDate,
      }),
    [
      resolvedI18n.labels.presetLast30Days,
      resolvedI18n.labels.presetLast7Days,
      resolvedI18n.labels.presetThisQuarter,
      resolvedI18n.labels.presetToday,
      resolvedI18n.labels.presetYearToDate,
    ],
  )

  const applyPresetRange = (preset: DateRangePreset) => {
    const anchorDay = preset.range.end ?? preset.range.start
    if (anchorDay) {
      setFocusDate(anchorDay)
      cal.goToMonth(startOfMonth(anchorDay))
    }
    selectRange(preset.range)
  }

  const isPresetActive = (preset: DateRangePreset) => {
    if (!selectedRange?.start || !selectedRange?.end || !preset.range.start || !preset.range.end) {
      return false
    }

    return (
      cal.isSameDay(selectedRange.start, preset.range.start) &&
      cal.isSameDay(selectedRange.end, preset.range.end)
    )
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = visibleRangeDays.findIndex(day => cal.isSameDay(day, focusDate))
    const currentIndex = idx >= 0 ? idx : 0
    const rowStart = currentIndex - (currentIndex % 7)

    const setByIndex = (nextIndex: number) => {
      if (nextIndex < 0) {
        moveFocusByDays(nextIndex - currentIndex)
        return
      }

      if (nextIndex >= visibleRangeDays.length) {
        moveFocusByDays(nextIndex - currentIndex)
        return
      }

      setFocusDate(visibleRangeDays[nextIndex])
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        setByIndex(currentIndex - 1)
        break
      case 'ArrowRight':
        event.preventDefault()
        setByIndex(currentIndex + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        setByIndex(currentIndex - 7)
        break
      case 'ArrowDown':
        event.preventDefault()
        setByIndex(currentIndex + 7)
        break
      case 'Home':
        event.preventDefault()
        setByIndex(rowStart)
        break
      case 'End':
        event.preventDefault()
        setByIndex(rowStart + 6)
        break
      case 'PageUp':
        event.preventDefault()
        setFocusDate(previous => addMonths(previous, event.shiftKey ? -12 : -1))
        break
      case 'PageDown':
        event.preventDefault()
        setFocusDate(previous => addMonths(previous, event.shiftKey ? 12 : 1))
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        selectRange(cal.nextRange(focusDate, selectedRange ?? cal.selectedRange))
        break
      default:
        break
    }
  }

  const headerLabel = useMemo(() => {
    if (visibleMonths.length === 1) {
      return format(visibleMonths[0].monthStart, resolvedI18n.format.monthLabel, formatOptions)
    }

    const first = format(visibleMonths[0].monthStart, resolvedI18n.format.monthLabel, formatOptions)
    const last = format(
      visibleMonths[visibleMonths.length - 1].monthStart,
      resolvedI18n.format.monthLabel,
      formatOptions,
    )

    return `${first} - ${last}`
  }, [visibleMonths, resolvedI18n.format.monthLabel, formatOptions])
  const monthRowStarts = useMemo(() => {
    let rowCursor = 1
    return visibleMonths.map(monthView => {
      const start = rowCursor
      rowCursor += monthView.weeks.length + 1
      return start
    })
  }, [visibleMonths])
  const totalGridRows = useMemo(
    () => visibleMonths.reduce((sum, monthView) => sum + monthView.weeks.length + 1, 0),
    [visibleMonths],
  )

  return (
    <div className={cx(getThemeScopeClassName(themeMode), 'inline-block')} data-rdp-theme={themeMode}>
      <div
        className={theme.containerClassName}
        role="grid"
        aria-labelledby={monthLabelId}
        aria-colcount={7}
        aria-rowcount={totalGridRows}
        data-rdp-theme={themeMode}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={gridRef}
      >
        <header className={theme.headerClassName}>
          <div className={theme.headerNavGroupClassName}>
            <button
              className={theme.headerNavButtonClassName}
              onClick={() => {
                cal.prevYear()
                setFocusDate(previous => addMonths(previous, -12))
              }}
              aria-label={resolvedI18n.labels.prevYear}
            >
              {theme.icons?.prevYear ?? '«'}
            </button>
            <button
              className={theme.headerNavButtonClassName}
              onClick={() => {
                cal.prev()
                setFocusDate(previous => addMonths(previous, -1))
              }}
              aria-label={resolvedI18n.labels.prevMonth}
            >
              {theme.icons?.prevMonth ?? '←'}
            </button>
          </div>
          <div id={monthLabelId} className={theme.monthLabelClassName}>
            {headerLabel}
          </div>
          <div className={theme.headerNavGroupClassName}>
            <button
              className={theme.headerNavButtonClassName}
              onClick={() => {
                cal.next()
                setFocusDate(previous => addMonths(previous, 1))
              }}
              aria-label={resolvedI18n.labels.nextMonth}
            >
              {theme.icons?.nextMonth ?? '→'}
            </button>
            <button
              className={theme.headerNavButtonClassName}
              onClick={() => {
                cal.nextYear()
                setFocusDate(previous => addMonths(previous, 12))
              }}
              aria-label={resolvedI18n.labels.nextYear}
            >
              {theme.icons?.nextYear ?? '»'}
            </button>
          </div>
        </header>

        {showPresets && (
          <section aria-label={resolvedI18n.labels.presetsTitle} className={theme.presetsSectionClassName}>
            <div className={theme.presetsListClassName}>
              {presetRanges.map(preset => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPresetRange(preset)}
                  className={theme.presetButtonClassName?.(isPresetActive(preset))}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <div ref={monthAnimatorRef} className={theme.monthsViewportClassName}>
          {visibleMonths.map((monthView, monthIndex) => {
            const rowStart = monthRowStarts[monthIndex]
            return (
            <section
              key={monthView.monthStart.getTime()}
              className={theme.monthPanelClassName}
            >
              <div className={theme.monthPanelTitleClassName}>
                {format(monthView.monthStart, resolvedI18n.format.monthLabel, formatOptions)}
              </div>
              <div role="rowgroup" aria-labelledby={monthLabelId}>
                <div className={theme.weekdayRowClassName} role="row" aria-rowindex={rowStart}>
                  {monthView.weekdayLabels.map((label, index) => (
                    <div
                      key={`${monthView.monthStart.getTime()}-weekday-${index}`}
                      className={theme.weekdayCellClassName}
                      role="columnheader"
                      aria-colindex={index + 1}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className={theme.weekRowsClassName}>
                  {monthView.weeks.map((week, weekIndex) => (
                    <div
                      key={`${monthView.monthStart.getTime()}-week-${weekIndex}`}
                      className={theme.weekRowClassName}
                      role="row"
                      aria-rowindex={rowStart + weekIndex + 1}
                    >
                      {week.map((day, dayIndex) => {
                    const faded = !cal.isSameMonth(day, monthView.monthStart)
                    const isRangeEdge = !!(selectedRange && cal.isRangeEdge(day, selectedRange))
                    const inRange = selectedRange ? cal.isInRange(day, selectedRange) : false
                    const isFocused = cal.isSameDay(day, focusDate) && cal.isSameMonth(day, focusDate)

                    const handleClick = () => {
                      const nextRange = cal.nextRange(day, selectedRange ?? cal.selectedRange)
                      setFocusDate(day)
                      selectRange(nextRange)
                    }

                    return (
                      <button
                        key={`${monthView.monthStart.getTime()}-${weekIndex}-${dayIndex}`}
                        role="gridcell"
                        aria-selected={isRangeEdge}
                        aria-rowindex={rowStart + weekIndex + 1}
                        aria-colindex={dayIndex + 1}
                        tabIndex={isFocused ? 0 : -1}
                        data-date-key={`${day.getTime()}-${monthView.monthStart.getTime()}`}
                        onClick={handleClick}
                        className={theme.dayButtonClassName?.({
                          rangeEdge: isRangeEdge,
                          inRange,
                          faded,
                          focused: isFocused,
                        }) ?? ''}
                        aria-label={format(day, resolvedI18n.format.dayAriaLabel, formatOptions)}
                      >
                        {format(day, resolvedI18n.format.dayLabel, formatOptions)}
                      </button>
                    )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )})}
        </div>
      </div>
    </div>
  )
}

export function createRangeCalendar(theme: RangeCalendarTheme = defaultRangeCalendarTheme) {
  return function ThemedRangeCalendar({ theme: themeMode, skin, ...props }: RangeCalendarProps) {
    const resolvedTheme = useMemo(() => {
      const themedBase = isMaterialTheme(themeMode)
        ? mergeThemeWithSkin(theme, materialRangeCalendarTheme)
        : isModernMinimalTheme(themeMode)
          ? mergeThemeWithSkin(theme, modernMinimalRangeCalendarTheme)
        : isBookingTheme(themeMode)
          ? mergeThemeWithSkin(theme, bookingRangeCalendarTheme)
        : theme

      return mergeThemeWithSkin(themedBase, skin)
    }, [skin, themeMode])

    return (
      <RangeCalendarThemeContext.Provider value={resolvedTheme}>
        <RangeCalendarRoot {...props} theme={themeMode} />
      </RangeCalendarThemeContext.Provider>
    )
  }
}

const RangeCalendar = createRangeCalendar()

export default RangeCalendar
