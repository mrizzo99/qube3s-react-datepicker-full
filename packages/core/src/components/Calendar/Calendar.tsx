
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useCalendar } from '../../headless/useCalendar'
import { addMonths, differenceInCalendarMonths, format, startOfMonth } from 'date-fns'
import { resolveCalendarI18n, type CalendarI18n } from '../../i18n'
import {
  getAppearanceScopeClassName,
  type CoreAppearance,
  type CoreStyleProperties,
} from '../../styling'
import {
  getThemeScopeClassName,
  isBookingTheme,
  isMaterialTheme,
  isModernMinimalTheme,
  mergeThemeWithSkin,
  type ThemeMode,
  type ThemeSkin,
} from '../../theming'
import { animateMonthSlide } from '../../motion'

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ')

export type CalendarProps = {
  selectedDate?: Date | null
  selectDate?: (date: Date) => void
  onEscape?: () => void
  i18n?: CalendarI18n
  appearance?: CoreAppearance
  className?: string
  style?: CoreStyleProperties
}

export type CalendarStylingProps = {
  theme?: ThemeMode
  skin?: CalendarSkin
}

export type CalendarDaySlotState = {
  active: boolean
  faded: boolean
  focused: boolean
}

export type CalendarTheme = {
  containerClassName?: string
  headerClassName?: string
  headerNavGroupClassName?: string
  headerNavButtonClassName?: string
  monthLabelClassName?: string
  weekdayRowClassName?: string
  weekdayCellClassName?: string
  gridClassName?: string
  dayButtonClassName?: (state: CalendarDaySlotState) => string
  icons?: {
    prevYear?: React.ReactNode
    prevMonth?: React.ReactNode
    nextMonth?: React.ReactNode
    nextYear?: React.ReactNode
  }
}

export type CalendarSkin = ThemeSkin<CalendarTheme>

const defaultCalendarTheme: CalendarTheme = {
  containerClassName:
    'w-72 rounded-lg border border-[var(--rdp-border)] bg-[var(--rdp-surface)] p-4 text-[var(--rdp-surface-foreground)] shadow',
  headerClassName: 'mb-2 flex justify-between',
  headerNavGroupClassName: 'flex gap-1',
  headerNavButtonClassName:
    'inline-flex h-8 w-8 items-center justify-center rounded border border-transparent text-[var(--rdp-muted)] hover:bg-[var(--rdp-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rdp-ring)]',
  monthLabelClassName: 'font-semibold text-[var(--rdp-surface-foreground)]',
  weekdayRowClassName: 'mb-1 grid grid-cols-7 text-sm text-[var(--rdp-muted)]',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ active, faded }) =>
    cx(
      'rounded border border-transparent p-1 text-[var(--rdp-surface-foreground)] hover:border-[var(--rdp-ring)] focus-visible:border-[var(--rdp-ring)] focus-visible:outline-none',
      active ? 'bg-[var(--rdp-accent)] text-[var(--rdp-accent-foreground)]' : '',
      faded ? 'text-[var(--rdp-muted-foreground)]' : 'hover:bg-[var(--rdp-accent-soft)]',
    ),
}

const defaultCalendarInheritAppearanceClassName = cx(
  '[--rdp-accent:#2563eb]',
  '[--rdp-accent-foreground:#ffffff]',
  '[--rdp-ring:#3b82f6]',
  '[--rdp-surface:#ffffff]',
  '[--rdp-surface-foreground:#111827]',
  '[--rdp-border:#e5e7eb]',
  '[--rdp-muted:#4b5563]',
  '[--rdp-muted-foreground:#9ca3af]',
  '[--rdp-accent-soft:#dbeafe]',
  'dark:[--rdp-accent:#2563eb]',
  'dark:[--rdp-accent-foreground:#ffffff]',
  'dark:[--rdp-ring:#93c5fd]',
  'dark:[--rdp-surface:#111827]',
  'dark:[--rdp-surface-foreground:#f9fafb]',
  'dark:[--rdp-border:#374151]',
  'dark:[--rdp-muted:#9ca3af]',
  'dark:[--rdp-muted-foreground:#4b5563]',
  'dark:[--rdp-accent-soft:#17255499]',
)

const lightCalendarStyleVariables = {
  '--rdp-accent': '#2563eb',
  '--rdp-accent-foreground': '#ffffff',
  '--rdp-ring': '#3b82f6',
  '--rdp-surface': '#ffffff',
  '--rdp-surface-foreground': '#111827',
  '--rdp-border': '#e5e7eb',
  '--rdp-muted': '#4b5563',
  '--rdp-muted-foreground': '#9ca3af',
  '--rdp-accent-soft': '#dbeafe',
} as React.CSSProperties

const darkCalendarStyleVariables = {
  '--rdp-accent': '#2563eb',
  '--rdp-accent-foreground': '#ffffff',
  '--rdp-ring': '#93c5fd',
  '--rdp-surface': '#111827',
  '--rdp-surface-foreground': '#f9fafb',
  '--rdp-border': '#374151',
  '--rdp-muted': '#9ca3af',
  '--rdp-muted-foreground': '#4b5563',
  '--rdp-accent-soft': '#17255499',
} as React.CSSProperties

const materialCalendarTheme: CalendarSkin = {
  containerClassName:
    'w-72 rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  headerClassName: 'mb-3 flex items-center justify-between',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  monthLabelClassName: 'text-base font-medium tracking-[0.01em] text-slate-900 dark:text-slate-50',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1.5',
  dayButtonClassName: ({ active, faded, focused }) =>
    cx(
      'rounded-full border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400',
      active ? 'bg-sky-600 text-white shadow-sm dark:bg-sky-500' : '',
      !active ? 'hover:bg-slate-200 dark:hover:bg-slate-800' : '',
      faded ? 'text-slate-300 dark:text-slate-600' : 'text-slate-900 dark:text-slate-50',
      focused && !active ? 'bg-slate-100 dark:bg-slate-800' : '',
    ),
}

const modernMinimalCalendarTheme: CalendarSkin = {
  containerClassName:
    'w-72 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
  headerClassName: 'mb-3 flex items-center justify-between',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-zinc-600 transition-colors hover:bg-zinc-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600',
  monthLabelClassName: 'text-sm font-medium tracking-[0.01em] text-zinc-900 dark:text-zinc-50',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ active, faded, focused }) =>
    cx(
      'rounded-xl border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600',
      active ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950' : '',
      !active ? 'hover:bg-zinc-200/80 dark:hover:bg-zinc-800' : '',
      faded ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-zinc-50',
      focused && !active ? 'bg-zinc-100 dark:bg-zinc-900' : '',
    ),
}

const bookingCalendarTheme: CalendarSkin = {
  containerClassName:
    'w-72 rounded-2xl border border-sky-200 bg-white p-4 text-slate-950 shadow-[0_20px_40px_rgba(0,53,128,0.14)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  headerClassName: 'mb-3 flex items-center justify-between',
  headerNavGroupClassName: 'flex items-center gap-1.5',
  headerNavButtonClassName:
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-sky-50 text-[#003580] transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  monthLabelClassName: 'text-sm font-semibold tracking-[0.01em] text-[#003580] dark:text-white',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1.5',
  dayButtonClassName: ({ active, faded, focused }) =>
    cx(
      'rounded-xl border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:focus-visible:ring-sky-400',
      active ? 'border-[#006ce4] bg-[#006ce4] text-white shadow-sm dark:border-sky-500 dark:bg-sky-500' : '',
      !active ? 'hover:border-sky-200 hover:bg-sky-50 dark:hover:border-slate-700 dark:hover:bg-slate-800' : '',
      faded ? 'text-slate-300 dark:text-slate-600' : 'text-slate-900 dark:text-slate-50',
      focused && !active ? 'bg-amber-50 dark:bg-slate-800' : '',
    ),
}

type InternalCalendarProps = CalendarProps & CalendarStylingProps

function CalendarRoot({
  selectedDate: controlledSelectedDate,
  selectDate: controlledSelectDate,
  onEscape,
  i18n,
  appearance = 'inherit',
  className,
  style,
  theme: themeMode,
}: InternalCalendarProps) {
  const calendarTheme = useCalendarTheme()
  const hasPresetTheme =
    isMaterialTheme(themeMode) || isModernMinimalTheme(themeMode) || isBookingTheme(themeMode)
  const resolvedAppearance: CoreAppearance =
    themeMode === 'light' || themeMode === 'dark' ? themeMode : appearance
  const appearanceClassName = !hasPresetTheme && resolvedAppearance === 'inherit'
    ? defaultCalendarInheritAppearanceClassName
    : ''
  const scopeClassName =
    themeMode !== undefined
      ? getThemeScopeClassName(themeMode)
      : getAppearanceScopeClassName(resolvedAppearance)
  const resolvedStyle = useMemo(() => {
    if (hasPresetTheme || resolvedAppearance === 'inherit') return style

    return {
      ...(resolvedAppearance === 'dark' ? darkCalendarStyleVariables : lightCalendarStyleVariables),
      ...style,
    }
  }, [hasPresetTheme, resolvedAppearance, style])
  const normalizedSelected =
    controlledSelectedDate instanceof Date && !Number.isNaN(controlledSelectedDate.getTime())
      ? controlledSelectedDate
      : null

  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale]
  )
  const cal = useCalendar(normalizedSelected ?? undefined, {
    locale: resolvedI18n.locale,
    weekStartsOn: resolvedI18n.weekStartsOn
  })
  const selectedDate = normalizedSelected ?? cal.selectedDate
  const selectDate = controlledSelectDate ?? cal.selectDate
  const monthLabelId = useMemo(
    () => `cal-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
    [cal.currentMonth]
  )

  const activeDate = selectedDate ?? cal.currentMonth
  const [focusDate, setFocusDate] = useState<Date>(activeDate)
  const gridRef = useRef<HTMLDivElement>(null)
  const monthAnimatorRef = useRef<HTMLDivElement>(null)
  const previousMonthRef = useRef(cal.currentMonth)
  const gridDays = useMemo(() => cal.weeks.flat(), [cal.weeks])
  const weekdayLabels = useMemo(
    () =>
      (cal.weeks[0] ?? []).map(day =>
        format(day, resolvedI18n.format.weekdayLabel, formatOptions)
      ),
    [cal.weeks, resolvedI18n.format.weekdayLabel, formatOptions]
  )

  const findGridDate = (date: Date) => gridDays.find(d => cal.isSameDay(d, date)) ?? gridDays[0]

  useEffect(() => {
    // Clamp focus to the visible grid and move DOM focus accordingly
    setFocusDate(prev => findGridDate(prev))
    const focusTarget = findGridDate(focusDate)
    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[role="gridcell"][data-date="${focusTarget.getTime()}"]`
    )
    cell?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cal.currentMonth, gridDays, focusDate])

  useEffect(() => {
    const prev = previousMonthRef.current
    const next = cal.currentMonth
    const monthDelta = differenceInCalendarMonths(startOfMonth(next), startOfMonth(prev))

    if (monthAnimatorRef.current) {
      animateMonthSlide(monthAnimatorRef.current, monthDelta)
    }

    previousMonthRef.current = next
  }, [cal.currentMonth])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = gridDays.findIndex(d => cal.isSameDay(d, focusDate))
    const currentIndex = idx >= 0 ? idx : 0
    const rowStart = currentIndex - (currentIndex % 7)

    const setByIndex = (newIndex: number) => {
      const clamped = Math.max(0, Math.min(gridDays.length - 1, newIndex))
      setFocusDate(gridDays[clamped])
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
        if (event.shiftKey) {
          cal.prevYear()
          setFocusDate(addMonths(focusDate, -12))
        } else {
          cal.prev()
          setFocusDate(addMonths(focusDate, -1))
        }
        break
      case 'PageDown':
        event.preventDefault()
        if (event.shiftKey) {
          cal.nextYear()
          setFocusDate(addMonths(focusDate, 12))
        } else {
          cal.next()
          setFocusDate(addMonths(focusDate, 1))
        }
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        selectDate(focusDate)
        break
      default:
        break
    }
  }

  return (
    <div
      className={cx('inline-block', className, appearanceClassName, scopeClassName)}
      style={resolvedStyle}
      data-rdp-theme={themeMode}
      data-rdp-appearance={resolvedAppearance}
    >
      <div
        className={calendarTheme.containerClassName}
        role="grid"
        tabIndex={0}
        aria-labelledby={monthLabelId}
        data-rdp-theme={themeMode}
        onKeyDown={handleKeyDown}
        ref={gridRef}
      >
        <header className={calendarTheme.headerClassName}>
          <div className={calendarTheme.headerNavGroupClassName}>
            <button className={calendarTheme.headerNavButtonClassName} onClick={cal.prevYear} aria-label={resolvedI18n.labels.prevYear}>
              {calendarTheme.icons?.prevYear ?? '«'}
            </button>
            <button className={calendarTheme.headerNavButtonClassName} onClick={cal.prev} aria-label={resolvedI18n.labels.prevMonth}>
              {calendarTheme.icons?.prevMonth ?? '←'}
            </button>
          </div>
          <div id={monthLabelId} className={calendarTheme.monthLabelClassName}>
            {format(cal.currentMonth, resolvedI18n.format.monthLabel, formatOptions)}
          </div>
          <div className={calendarTheme.headerNavGroupClassName}>
            <button className={calendarTheme.headerNavButtonClassName} onClick={cal.next} aria-label={resolvedI18n.labels.nextMonth}>
              {calendarTheme.icons?.nextMonth ?? '→'}
            </button>
            <button className={calendarTheme.headerNavButtonClassName} onClick={cal.nextYear} aria-label={resolvedI18n.labels.nextYear}>
              {calendarTheme.icons?.nextYear ?? '»'}
            </button>
          </div>
        </header>

        <div ref={monthAnimatorRef}>
          <div className={calendarTheme.weekdayRowClassName} aria-hidden="true">
            {weekdayLabels.map((label, index) => (
              <div key={index} className={calendarTheme.weekdayCellClassName}>
                {label}
              </div>
            ))}
          </div>

          <div className={calendarTheme.gridClassName}>
            {cal.weeks.map((week, wi) =>
              week.map((day, di) => {
                const faded = !cal.isSameMonth(day, cal.currentMonth)
                const isActive = selectedDate && cal.isSameDay(day, selectedDate)
                const isFocused = cal.isSameDay(day, focusDate)

                const handleClick = () => {
                  selectDate(day)
                }

                return (
                  <button
                    key={wi + '-' + di}
                    role="gridcell"
                    aria-selected={!!isActive}
                    tabIndex={isFocused ? 0 : -1}
                    data-date={day.getTime()}
                    onClick={handleClick}
                    className={calendarTheme.dayButtonClassName?.({
                      active: !!isActive,
                      faded,
                      focused: isFocused,
                    })}
                    aria-label={format(day, resolvedI18n.format.dayAriaLabel, formatOptions)}
                  >
                    {format(day, resolvedI18n.format.dayLabel, formatOptions)}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const CalendarThemeContext = React.createContext<CalendarTheme>(defaultCalendarTheme)

const useCalendarTheme = () => React.useContext(CalendarThemeContext)

export function createCalendar(theme: CalendarTheme = defaultCalendarTheme) {
  return function ThemedCalendar({
    theme: themeMode,
    skin,
    ...props
  }: InternalCalendarProps) {
    const resolvedTheme = useMemo(() => {
      const themedBase = isMaterialTheme(themeMode)
        ? mergeThemeWithSkin(theme, materialCalendarTheme)
        : isModernMinimalTheme(themeMode)
          ? mergeThemeWithSkin(theme, modernMinimalCalendarTheme)
        : isBookingTheme(themeMode)
          ? mergeThemeWithSkin(theme, bookingCalendarTheme)
        : theme

      return mergeThemeWithSkin(themedBase, skin)
    }, [skin, themeMode])

    return (
      <CalendarThemeContext.Provider value={resolvedTheme}>
        <CalendarRoot {...props} theme={themeMode} />
      </CalendarThemeContext.Provider>
    )
  }
}

const Calendar = createCalendar()

const PublicCalendar = (props: CalendarProps) => <Calendar {...props} />

export default PublicCalendar
