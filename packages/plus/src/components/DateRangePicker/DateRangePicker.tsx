import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  addDays,
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import type {
  AsyncValidationBehavior,
  AsyncValidationResult,
  AsyncValidationState,
  AsyncValidationStateChange,
} from '@core/asyncValidation'
import { resolveCalendarI18n, type CalendarI18n } from '@core/i18n'
import {
  getThemeScopeClassName,
  isBookingTheme,
  isMaterialTheme,
  isModernMinimalTheme,
  mergeThemeWithSkin,
  type ThemeMode,
  type ThemeSkin,
} from '@core/theming'
import { useFloatingPopoverPosition } from '@core/floating'
import { animateMonthSlide, FLUENT_UI_DURATION_MS, usePresenceTransition } from '@core/motion'
import { useRangeCalendar, type DateRange } from '../../headless/useRangeCalendar'
import { getDateRangePresets, type DateRangePreset } from '../../presets/dateRangePresets'

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ')

type TimeParts = {
  hours: number
  minutes: number
}

type DateRangePickerContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedRange: DateRange
  selectRange: (range: DateRange) => void
  updateRangeTime: (boundary: 'start' | 'end', parts: TimeParts) => void
  inputRef: React.MutableRefObject<HTMLInputElement | null>
  containerRef: React.MutableRefObject<HTMLDivElement | null>
  formatDescriptionId: string
  validationMessageId: string
  describedById: string
  formattedStart: string
  formattedEnd: string
  placeholderStartText: string
  placeholderEndText: string
  formatDescriptionText: string
  validationState: AsyncValidationState
  validationMessage: string
  validationMessageClassName: string
  enableTime: boolean
  timeFormat: '12h' | '24h'
  minuteStep: number
  startDefaultTime: TimeParts
  endDefaultTime: TimeParts
  timeLabelIcon: React.ReactNode | null
  timeLabelIconClassName: string
  resolvedI18n: ReturnType<typeof resolveCalendarI18n>
  formatOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale'] }
  cal: ReturnType<typeof useRangeCalendar>
  focusDate: Date
  setFocusDate: React.Dispatch<React.SetStateAction<Date>>
  gridRef: React.MutableRefObject<HTMLDivElement | null>
  popoverRef: React.MutableRefObject<HTMLDivElement | null>
  monthLabelId: string
  numberOfMonths: number
  portal: boolean
  portalContainer: HTMLElement | null
  isMobilePresentation: boolean
  mobileGestures: {
    swipeMonth: boolean
    swipeToClose: boolean
  }
  showPresets: boolean
  presetRanges: DateRangePreset[]
  applyPresetRange: (preset: DateRangePreset) => void
  onConfirm: () => void
  onCancel: () => void
  onEscape: () => void
  themeMode?: ThemeMode
}

const DateRangePickerContext = createContext<DateRangePickerContextValue | null>(null)

const emptyRange: DateRange = { start: null, end: null }
const visuallyHidden = {
  position: 'absolute' as const,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
} satisfies React.CSSProperties

const DEFAULT_MOBILE_BREAKPOINT = 768
const SWIPE_MONTH_THRESHOLD = 48
const SWIPE_CLOSE_THRESHOLD = 56
const SHEET_CLOSE_RATIO_THRESHOLD = 0.22
const defaultValidatingMessage = 'Validating selection...'
const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export type DateRangePickerDaySlotState = {
  rangeEdge: boolean
  inRange: boolean
  faded: boolean
  focused: boolean
}

export type DateRangePickerTimeWheelState = {
  disabled: boolean
  selected: boolean
}

export type DateRangePickerTheme = {
  rootClassName?: string
  inputLayoutClassName?: string
  inputFieldsGroupClassName?: string
  inputFieldClassName?: string
  inputLabelClassName?: string
  inputGroupClassName?: string
  inputClassName?: string
  triggerClassName?: string
  validationMessageClassName?: string
  validationMessageInvalidClassName?: string
  validationMessageValidatingClassName?: string
  mobilePopoverShellClassName?: string
  mobileBackdropClassName?: string
  mobileSheetClassName?: string
  mobileSheetHandleWrapClassName?: string
  mobileSheetHandleClassName?: string
  desktopPopoverShellClassName?: string
  desktopPopoverPanelClassName?: string
  headerClassName?: string
  headerNavGroupClassName?: string
  headerNavButtonClassName?: string
  monthLabelClassName?: string
  timeWheelColumnClassName?: string
  timeWheelTitleClassName?: string
  timeWheelListClassName?: (disabled: boolean) => string
  timeWheelOptionClassName?: (state: DateRangePickerTimeWheelState) => string
  timeBoundarySectionClassName?: string
  timeBoundaryHeaderClassName?: string
  timeBoundaryIconWrapClassName?: string
  timeBoundaryGridClassName?: string
  timeSectionClassName?: string
  timeSectionTitleClassName?: string
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
  dayButtonClassName?: (state: DateRangePickerDaySlotState) => string
  actionsClassName?: string
  cancelButtonClassName?: string
  confirmButtonClassName?: string
  icons?: {
    calendar?: React.ReactNode
    clock?: React.ReactNode
    prevYear?: React.ReactNode
    prevMonth?: React.ReactNode
    nextMonth?: React.ReactNode
    nextYear?: React.ReactNode
  }
}

export type DateRangePickerSkin = ThemeSkin<DateRangePickerTheme>

const defaultDateRangePickerTheme: DateRangePickerTheme = {
  rootClassName: 'relative inline-flex flex-col gap-2',
  inputLayoutClassName: 'flex flex-wrap items-end gap-3',
  inputFieldsGroupClassName: 'flex flex-wrap gap-3',
  inputFieldClassName: 'flex flex-col gap-1',
  inputLabelClassName: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  inputGroupClassName: 'inline-flex items-center gap-1',
  inputClassName:
    'rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-400 dark:hover:border-blue-300 dark:focus-visible:ring-blue-400',
  triggerClassName:
    'inline-flex items-center justify-center rounded border border-gray-300 bg-white p-2 text-gray-700 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-300 dark:focus-visible:ring-blue-400',
  validationMessageClassName: 'text-sm',
  validationMessageInvalidClassName: 'text-red-600 dark:text-red-400',
  validationMessageValidatingClassName: 'text-gray-600 dark:text-gray-400',
  mobilePopoverShellClassName: 'fixed inset-0 z-[var(--rdp-z-popover,1000)] flex items-end justify-center',
  mobileBackdropClassName: 'absolute inset-0 bg-gray-900/45 transition-opacity duration-200 dark:bg-black/70',
  mobileSheetClassName:
    'relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-gray-200 bg-white p-4 text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50',
  mobileSheetHandleWrapClassName: 'mb-3 flex justify-center py-1',
  mobileSheetHandleClassName: 'h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600',
  desktopPopoverShellClassName: 'rounded bg-white shadow dark:bg-gray-900',
  desktopPopoverPanelClassName:
    'max-w-[calc(100vw-1rem)] rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50',
  headerClassName: 'mb-3 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex gap-1',
  headerNavButtonClassName:
    'inline-flex h-8 w-8 items-center justify-center rounded border border-transparent text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:ring-blue-400',
  monthLabelClassName: 'text-center text-sm font-semibold text-gray-900 dark:text-gray-50 sm:text-base',
  timeWheelColumnClassName: 'flex w-16 flex-none flex-col gap-1',
  timeWheelTitleClassName: 'text-xs font-medium text-gray-600 dark:text-gray-400',
  timeWheelListClassName: disabled =>
    cx(
      'h-16 overflow-y-auto rounded border border-gray-200 p-1 dark:border-gray-700',
      disabled
        ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800'
        : 'bg-white dark:bg-gray-950',
    ),
  timeWheelOptionClassName: ({ selected }) =>
    cx(
      'w-full rounded px-2 py-1 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400',
      selected ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-blue-950/50',
    ),
  timeBoundarySectionClassName: 'rounded-md border border-gray-200 bg-gray-50/70 p-2 dark:border-gray-700 dark:bg-gray-800/70',
  timeBoundaryHeaderClassName: 'mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200',
  timeBoundaryIconWrapClassName: 'inline-flex h-4 w-4 items-center justify-center overflow-hidden text-gray-500 dark:text-gray-400',
  timeBoundaryGridClassName: 'flex gap-2',
  timeSectionClassName: 'mt-2 border-t border-gray-200 pt-3 dark:border-gray-700',
  timeSectionTitleClassName: 'mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100',
  presetsSectionClassName: '',
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
  actionsClassName: 'mt-3 flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700',
  cancelButtonClassName:
    'rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors duration-150 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-gray-500 dark:focus-visible:ring-blue-400',
  confirmButtonClassName:
    'rounded border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors duration-150 hover:border-blue-700 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400',
}

const materialDateRangePickerTheme: DateRangePickerSkin = {
  rootClassName: 'relative inline-flex flex-col gap-3',
  inputLayoutClassName: 'flex flex-wrap items-end gap-3',
  inputFieldsGroupClassName: 'flex flex-wrap gap-3',
  inputFieldClassName: 'flex flex-col gap-1.5',
  inputLabelClassName: 'text-sm font-medium text-slate-700 dark:text-slate-300',
  inputGroupClassName: 'inline-flex items-center gap-2',
  inputClassName:
    'rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-400 dark:hover:border-slate-600 dark:focus-visible:ring-sky-400',
  triggerClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-sky-400',
  validationMessageInvalidClassName: 'text-rose-600 dark:text-rose-400',
  validationMessageValidatingClassName: 'text-slate-500 dark:text-slate-400',
  mobileBackdropClassName: 'absolute inset-0 bg-slate-950/45 transition-opacity duration-200 dark:bg-black/70',
  mobileSheetClassName:
    'relative max-h-[90vh] w-full overflow-y-auto rounded-t-[32px] border border-slate-200 bg-slate-50 p-4 text-slate-900 shadow-[0_20px_40px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  mobileSheetHandleClassName: 'h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600',
  desktopPopoverShellClassName: 'rounded-[32px] bg-transparent',
  desktopPopoverPanelClassName:
    'max-w-[calc(100vw-1rem)] rounded-[32px] border border-slate-200 bg-slate-50 p-4 text-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.14)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  headerClassName: 'mb-4 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  monthLabelClassName: 'text-center text-base font-medium tracking-[0.01em] text-slate-900 dark:text-slate-50',
  timeWheelTitleClassName: 'text-xs font-medium text-slate-500 dark:text-slate-400',
  timeWheelListClassName: disabled =>
    cx(
      'h-16 overflow-y-auto rounded-2xl border border-slate-200 p-1 dark:border-slate-700',
      disabled ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-950',
    ),
  timeWheelOptionClassName: ({ selected }) =>
    cx(
      'w-full rounded-xl px-2 py-1 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400',
      selected ? 'bg-sky-600 text-white dark:bg-sky-500' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
    ),
  timeBoundarySectionClassName: 'rounded-[24px] border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-950/70',
  timeBoundaryHeaderClassName: 'mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200',
  timeBoundaryIconWrapClassName: 'inline-flex h-4 w-4 items-center justify-center overflow-hidden text-slate-500 dark:text-slate-400',
  timeSectionClassName: 'mt-2 border-t border-slate-200 pt-3 dark:border-slate-700',
  timeSectionTitleClassName: 'mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100',
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
  actionsClassName: 'mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700',
  cancelButtonClassName:
    'rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  confirmButtonClassName:
    'rounded-full border border-sky-600 bg-sky-600 px-4 py-1.5 text-sm text-white transition-colors hover:border-sky-700 hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-sky-500 dark:bg-sky-500 dark:hover:border-sky-400 dark:hover:bg-sky-400 dark:focus-visible:ring-sky-400',
}

const modernMinimalDateRangePickerTheme: DateRangePickerSkin = {
  rootClassName: 'relative inline-flex flex-col gap-3',
  inputLayoutClassName: 'flex flex-wrap items-end gap-3',
  inputFieldsGroupClassName: 'flex flex-wrap gap-3',
  inputFieldClassName: 'flex flex-col gap-1.5',
  inputLabelClassName: 'text-sm font-medium text-zinc-700 dark:text-zinc-300',
  inputGroupClassName: 'inline-flex items-center gap-2',
  inputClassName:
    'rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-600',
  triggerClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-600',
  validationMessageInvalidClassName: 'text-rose-600 dark:text-rose-400',
  validationMessageValidatingClassName: 'text-zinc-500 dark:text-zinc-400',
  mobileBackdropClassName: 'absolute inset-0 bg-zinc-950/45 transition-opacity duration-200 dark:bg-black/70',
  mobileSheetClassName:
    'relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-950 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
  mobileSheetHandleClassName: 'h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700',
  desktopPopoverShellClassName: 'rounded-2xl bg-transparent',
  desktopPopoverPanelClassName:
    'max-w-[calc(100vw-1rem)] rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
  headerClassName: 'mb-4 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-zinc-600 transition-colors hover:bg-zinc-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600',
  monthLabelClassName: 'text-center text-sm font-medium tracking-[0.01em] text-zinc-900 dark:text-zinc-50',
  timeWheelTitleClassName: 'text-xs font-medium text-zinc-500 dark:text-zinc-400',
  timeWheelListClassName: disabled =>
    cx(
      'h-16 overflow-y-auto rounded-xl border border-zinc-200 p-1 dark:border-zinc-800',
      disabled ? 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-950',
    ),
  timeWheelOptionClassName: ({ selected }) =>
    cx(
      'w-full rounded-lg px-2 py-1 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600',
      selected ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950' : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
    ),
  timeBoundarySectionClassName: 'rounded-2xl border border-zinc-200 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/70',
  timeBoundaryHeaderClassName: 'mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200',
  timeBoundaryIconWrapClassName: 'inline-flex h-4 w-4 items-center justify-center overflow-hidden text-zinc-500 dark:text-zinc-400',
  timeSectionClassName: 'mt-2 border-t border-zinc-200 pt-3 dark:border-zinc-800',
  timeSectionTitleClassName: 'mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100',
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
  actionsClassName: 'mt-3 flex justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800',
  cancelButtonClassName:
    'rounded-full border border-zinc-200 bg-zinc-100 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600',
  confirmButtonClassName:
    'rounded-full border border-zinc-900 bg-zinc-900 px-4 py-1.5 text-sm text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-600',
}

const bookingDateRangePickerTheme: DateRangePickerSkin = {
  rootClassName: 'relative inline-flex flex-col gap-3',
  inputLayoutClassName: 'flex flex-wrap items-end gap-3',
  inputFieldsGroupClassName: 'flex flex-wrap gap-3',
  inputFieldClassName: 'flex flex-col gap-1.5',
  inputLabelClassName: 'text-sm font-medium text-[#003580] dark:text-sky-200',
  inputGroupClassName: 'inline-flex items-center gap-2',
  inputClassName:
    'rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm text-slate-950 placeholder:text-slate-500 transition-colors hover:border-[#006ce4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-400 dark:hover:border-sky-400 dark:focus-visible:ring-sky-400',
  triggerClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-[#003580] transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:border-slate-700 dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  validationMessageInvalidClassName: 'text-rose-600 dark:text-rose-400',
  validationMessageValidatingClassName: 'text-slate-500 dark:text-slate-400',
  mobileBackdropClassName: 'absolute inset-0 bg-[#003580]/35 transition-opacity duration-200 dark:bg-black/70',
  mobileSheetClassName:
    'relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-sky-200 bg-white p-4 text-slate-950 shadow-[0_24px_48px_rgba(0,53,128,0.18)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  mobileSheetHandleClassName: 'h-1.5 w-12 rounded-full bg-sky-200 dark:bg-slate-600',
  desktopPopoverShellClassName: 'rounded-2xl bg-transparent',
  desktopPopoverPanelClassName:
    'max-w-[calc(100vw-1rem)] rounded-2xl border border-sky-200 bg-white p-4 text-slate-950 shadow-[0_20px_40px_rgba(0,53,128,0.14)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  headerClassName: 'mb-4 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1.5',
  headerNavButtonClassName:
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-sky-50 text-[#003580] transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  monthLabelClassName: 'text-center text-sm font-semibold tracking-[0.01em] text-[#003580] dark:text-white',
  timeWheelTitleClassName: 'text-xs font-medium text-slate-500 dark:text-slate-400',
  timeWheelListClassName: disabled =>
    cx(
      'h-16 overflow-y-auto rounded-xl border border-sky-200 p-1 dark:border-slate-700',
      disabled ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-950',
    ),
  timeWheelOptionClassName: ({ selected }) =>
    cx(
      'w-full rounded-lg px-2 py-1 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:focus-visible:ring-sky-400',
      selected ? 'bg-[#006ce4] text-white dark:bg-sky-500' : 'text-[#003580] hover:bg-sky-50 dark:text-sky-100 dark:hover:bg-slate-800',
    ),
  timeBoundarySectionClassName: 'rounded-2xl border border-sky-100 bg-sky-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/70',
  timeBoundaryHeaderClassName: 'mb-2 flex items-center gap-2 text-sm font-medium text-[#003580] dark:text-sky-100',
  timeBoundaryIconWrapClassName: 'inline-flex h-4 w-4 items-center justify-center overflow-hidden text-[#006ce4] dark:text-sky-300',
  timeSectionClassName: 'mt-2 border-t border-sky-100 pt-3 dark:border-slate-700',
  timeSectionTitleClassName: 'mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100',
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
  actionsClassName: 'mt-3 flex justify-end gap-2 border-t border-sky-100 pt-3 dark:border-slate-700',
  cancelButtonClassName:
    'rounded-full border border-sky-200 bg-white px-4 py-1.5 text-sm text-[#003580] transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:border-slate-700 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800 dark:focus-visible:ring-sky-400',
  confirmButtonClassName:
    'rounded-full border border-[#006ce4] bg-[#006ce4] px-4 py-1.5 text-sm text-white transition-colors hover:border-[#0057b8] hover:bg-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:border-sky-500 dark:bg-sky-500 dark:hover:border-sky-400 dark:hover:bg-sky-400 dark:focus-visible:ring-sky-400',
}

const DateRangePickerThemeContext = createContext<DateRangePickerTheme>(defaultDateRangePickerTheme)

const useDateRangePickerTheme = () => useContext(DateRangePickerThemeContext)

const getFocusableElements = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    element =>
      !element.hasAttribute('disabled')
      && element.getAttribute('aria-hidden') !== 'true'
      && !element.hasAttribute('inert'),
  )

const clampNumberOfMonths = (value: number | undefined) => {
  if (!value) return 1
  return Math.max(1, Math.min(3, Math.trunc(value)))
}

const normalizeIconNode = (icon: React.ReactNode, iconClassName = 'h-4 w-4 object-contain') => {
  if (!React.isValidElement(icon)) return icon
  const props = icon.props as { className?: string; ['aria-hidden']?: boolean }
  const className = `${iconClassName} ${props.className ?? ''}`.trim()
  return React.cloneElement(
    icon as React.ReactElement<{ className?: string; ['aria-hidden']?: boolean }>,
    {
      className,
      'aria-hidden': props['aria-hidden'] ?? true,
    },
  )
}

const renderPickerIcon = (icon: React.ReactNode | undefined, fallbackIcon?: React.ReactNode) => (
  <span className="inline-flex h-4 w-4 items-center justify-center overflow-hidden" aria-hidden="true">
    {icon ? normalizeIconNode(icon) : fallbackIcon ?? <DefaultCalendarIcon />}
  </span>
)

type MonthView = {
  monthStart: Date
  weeks: Date[][]
  weekdayLabels: string[]
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

export type DateRangePickerProps = {
  children?: React.ReactNode
  value?: DateRange | null
  onChange?: (range: DateRange) => void
  validateAsync?: (range: DateRange) => Promise<AsyncValidationResult>
  validationBehavior?: AsyncValidationBehavior
  validationState?: AsyncValidationState
  validationMessage?: string
  validationMessageClassName?: string
  onValidationStateChange?: (detail: AsyncValidationStateChange<DateRange>) => void
  placeholderStart?: string
  placeholderEnd?: string
  formatDescription?: string
  i18n?: CalendarI18n
  numberOfMonths?: number
  showPresets?: boolean
  enableTime?: boolean
  timeFormat?: '12h' | '24h'
  minuteStep?: number
  defaultStartTime?: string
  defaultEndTime?: string
  timeLabelIcon?: React.ReactNode
  timeLabelIconClassName?: string
  portal?: boolean
  portalContainer?: HTMLElement | null
  mobile?: DateRangePickerMobileOptions
  theme?: ThemeMode
  skin?: DateRangePickerSkin
}

export type DateRangePickerMobileMode = 'auto' | 'always' | 'never'

export type DateRangePickerMobileOptions = {
  enabled?: boolean
  mode?: DateRangePickerMobileMode
  breakpoint?: number
  gestures?: {
    swipeMonth?: boolean
    swipeToClose?: boolean
  }
}

export type DateRangePickerInputProps = {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  iconAriaLabel?: string
  inputClassName?: string
  triggerClassName?: string
  placeholderStart?: string
  placeholderEnd?: string
  formatDescription?: string
}

export type DateRangePickerCalendarProps = {
  children?: React.ReactNode
  className?: string
  popoverClassName?: string
}

const DEFAULT_START_TIME: TimeParts = { hours: 9, minutes: 0 }
const DEFAULT_END_TIME: TimeParts = { hours: 17, minutes: 0 }

const normalizeValidationResult = (result: AsyncValidationResult): AsyncValidationResult => {
  if (result.valid) return result
  return {
    valid: false,
    message: result.message || 'Validation failed.',
    code: result.code,
  }
}

const getValidationErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message
  return 'Validation failed.'
}

const normalizeMinuteStep = (value: number | undefined) => {
  if (!value || Number.isNaN(value)) return 1
  return Math.max(1, Math.min(30, Math.trunc(value)))
}

const normalizeMobileBreakpoint = (value: number | undefined) => {
  if (!value || Number.isNaN(value)) return DEFAULT_MOBILE_BREAKPOINT
  return Math.max(320, Math.min(1600, Math.trunc(value)))
}

const normalizeTimeParts = (parts: TimeParts, minuteStep: number): TimeParts => {
  const nextHours = Math.max(0, Math.min(23, Math.trunc(parts.hours)))
  const normalizedMinutes = Math.max(0, Math.min(59, Math.trunc(parts.minutes)))
  const snappedMinutes = Math.floor(normalizedMinutes / minuteStep) * minuteStep
  return {
    hours: nextHours,
    minutes: Math.max(0, Math.min(59, snappedMinutes)),
  }
}

const parseTimeParts = (value: string | undefined, fallback: TimeParts, minuteStep: number): TimeParts => {
  if (!value) return normalizeTimeParts(fallback, minuteStep)

  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/)
  if (!match) return normalizeTimeParts(fallback, minuteStep)

  const rawHours = Number(match[1])
  const rawMinutes = Number(match[2])
  const meridiem = match[3]?.toLowerCase()
  if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) {
    return normalizeTimeParts(fallback, minuteStep)
  }

  if (meridiem) {
    if (rawHours < 1 || rawHours > 12) return normalizeTimeParts(fallback, minuteStep)
    const base = rawHours % 12
    const hours = meridiem === 'pm' ? base + 12 : base
    return normalizeTimeParts({ hours, minutes: rawMinutes }, minuteStep)
  }

  return normalizeTimeParts({ hours: rawHours, minutes: rawMinutes }, minuteStep)
}

const applyTimeParts = (date: Date, parts: TimeParts): Date => {
  const next = new Date(date)
  next.setHours(parts.hours, parts.minutes, 0, 0)
  return next
}

const getTimePartsFromDate = (date: Date | null, fallback: TimeParts): TimeParts => {
  if (!date) return fallback
  return { hours: date.getHours(), minutes: date.getMinutes() }
}

const withBoundaryTime = (
  range: DateRange,
  boundary: 'start' | 'end',
  parts: TimeParts,
): DateRange => {
  const target = boundary === 'start' ? range.start : range.end
  if (!target) return range

  const next = {
    start: range.start ? new Date(range.start) : null,
    end: range.end ? new Date(range.end) : null,
  }

  if (boundary === 'start' && next.start) next.start = applyTimeParts(next.start, parts)
  if (boundary === 'end' && next.end) next.end = applyTimeParts(next.end, parts)

  if (next.start && next.end && isSameDay(next.start, next.end) && next.start.getTime() > next.end.getTime()) {
    if (boundary === 'start') {
      next.start = new Date(next.end)
    } else {
      next.end = new Date(next.start)
    }
  }

  return next
}

const coerceRangeWithTime = (
  range: DateRange,
  previousRange: DateRange,
  startFallback: TimeParts,
  endFallback: TimeParts,
): DateRange => {
  const start =
    range.start
      ? applyTimeParts(
          range.start,
          previousRange.start && isSameDay(range.start, previousRange.start)
            ? { hours: previousRange.start.getHours(), minutes: previousRange.start.getMinutes() }
            : startFallback,
        )
      : null

  const end =
    range.end
      ? applyTimeParts(
          range.end,
          previousRange.end && isSameDay(range.end, previousRange.end)
            ? { hours: previousRange.end.getHours(), minutes: previousRange.end.getMinutes() }
            : endFallback,
        )
      : null

  return { start, end }
}

function useDateRangePickerContext() {
  const context = useContext(DateRangePickerContext)
  if (!context) {
    throw new Error('DateRangePicker compound components must be used inside <DateRangePicker>.')
  }
  return context
}

function DateRangePickerRoot({
  children,
  value,
  onChange,
  validateAsync,
  validationBehavior = 'blocking',
  validationState,
  validationMessage,
  validationMessageClassName = '',
  onValidationStateChange,
  placeholderStart,
  placeholderEnd,
  formatDescription,
  i18n,
  numberOfMonths,
  showPresets = false,
  enableTime = false,
  timeFormat = '12h',
  minuteStep = 1,
  defaultStartTime,
  defaultEndTime,
  timeLabelIcon = null,
  timeLabelIconClassName = '',
  portal = true,
  portalContainer = null,
  mobile,
  theme: themeMode,
}: DateRangePickerProps) {
  const theme = useDateRangePickerTheme()
  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale],
  )
  const normalizedMonths = clampNumberOfMonths(numberOfMonths)
  const normalizedMinuteStep = normalizeMinuteStep(minuteStep)
  const startTimeFallback = useMemo(
    () => parseTimeParts(defaultStartTime, DEFAULT_START_TIME, normalizedMinuteStep),
    [defaultStartTime, normalizedMinuteStep],
  )
  const endTimeFallback = useMemo(
    () => parseTimeParts(defaultEndTime, DEFAULT_END_TIME, normalizedMinuteStep),
    [defaultEndTime, normalizedMinuteStep],
  )
  const inputValueFormat = useMemo(
    () => (enableTime ? (timeFormat === '24h' ? 'PPP HH:mm' : 'PPP hh:mm a') : resolvedI18n.format.inputValue),
    [enableTime, resolvedI18n.format.inputValue, timeFormat],
  )
  const [open, setOpen] = useState(false)
  const mobileEnabled = mobile?.enabled ?? false
  const mobileMode = mobile?.mode ?? 'auto'
  const mobileBreakpoint = normalizeMobileBreakpoint(mobile?.breakpoint)
  const swipeMonthGesture = mobile?.gestures?.swipeMonth ?? true
  const swipeToCloseGesture = mobile?.gestures?.swipeToClose ?? true
  const [autoMobileMatch, setAutoMobileMatch] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange>(value ?? emptyRange)
  const [draftRange, setDraftRange] = useState<DateRange>(value ?? emptyRange)
  const [internalValidationState, setInternalValidationState] = useState<AsyncValidationState>('idle')
  const [internalValidationMessage, setInternalValidationMessage] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const formatDescriptionId = useId()
  const validationMessageId = useId()
  const validationRequestRef = useRef(0)

  const committedRange = value ?? internalRange

  useEffect(() => {
    if (value === undefined) return
    const nextValue = value ?? emptyRange
    setInternalRange(nextValue)
    setDraftRange(nextValue)
  }, [value])

  useEffect(() => {
    if (!open) return
    setDraftRange(committedRange)
  }, [open, committedRange])

  const selectedRange = open && (enableTime || internalValidationState !== 'idle')
    ? draftRange
    : committedRange

  const cal = useRangeCalendar(selectedRange, {
    locale: resolvedI18n.locale,
    weekStartsOn: resolvedI18n.weekStartsOn,
  })

  const monthLabelId = useMemo(
    () => `date-range-picker-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
    [cal.currentMonth],
  )

  const anchorDate = selectedRange.start ?? selectedRange.end ?? cal.currentMonth
  const [focusDate, setFocusDate] = useState<Date>(anchorDate)
  const emitValidationStateChange = (
    nextState: AsyncValidationState,
    candidate: DateRange | null,
    message = '',
    code?: string,
  ) => {
    onValidationStateChange?.({
      state: nextState,
      candidate,
      message: message || undefined,
      code,
    })
  }

  const setValidationFeedback = (
    nextState: AsyncValidationState,
    candidate: DateRange | null,
    message = '',
    code?: string,
  ) => {
    setInternalValidationState(nextState)
    setInternalValidationMessage(message)
    emitValidationStateChange(nextState, candidate, message, code)
  }

  const closePicker = () => {
    setOpen(false)
    inputRef.current?.focus()
  }

  const commitRange = (range: DateRange) => {
    if (value === undefined) setInternalRange(range)
    onChange?.(range)
  }

  const rollbackOptimisticRange = (previousRange: DateRange) => {
    if (value === undefined) {
      setInternalRange(previousRange)
    } else {
      onChange?.(previousRange)
    }
  }

  useEffect(() => {
    if (!mobileEnabled || mobileMode !== 'auto') {
      setAutoMobileMatch(false)
      return
    }

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setAutoMobileMatch(false)
      return
    }

    const viewportQuery = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`)
    const pointerQuery = window.matchMedia('(pointer: coarse)')
    const updateMatch = () => {
      setAutoMobileMatch(viewportQuery.matches || pointerQuery.matches)
    }

    updateMatch()

    if (typeof viewportQuery.addEventListener === 'function') {
      viewportQuery.addEventListener('change', updateMatch)
      pointerQuery.addEventListener('change', updateMatch)
      return () => {
        viewportQuery.removeEventListener('change', updateMatch)
        pointerQuery.removeEventListener('change', updateMatch)
      }
    }

    viewportQuery.addListener(updateMatch)
    pointerQuery.addListener(updateMatch)
    return () => {
      viewportQuery.removeListener(updateMatch)
      pointerQuery.removeListener(updateMatch)
    }
  }, [mobileEnabled, mobileMode, mobileBreakpoint])

  const isMobilePresentation =
    mobileEnabled
      ? (mobileMode === 'always' || (mobileMode === 'auto' && autoMobileMatch))
      : false
  const mobileGestures = useMemo(
    () => ({
      swipeMonth: isMobilePresentation && swipeMonthGesture,
      swipeToClose: isMobilePresentation && swipeToCloseGesture,
    }),
    [isMobilePresentation, swipeMonthGesture, swipeToCloseGesture],
  )

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (containerRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [open])

  useEffect(() => {
    if (!open || portal) return

    const frame = window.requestAnimationFrame(() => {
      const popover = popoverRef.current
      if (!popover) return

      const rect = popover.getBoundingClientRect()
      const overflowBottom = rect.bottom + POPOVER_VIEWPORT_PADDING - window.innerHeight
      if (overflowBottom > 0) {
        window.scrollBy({ top: overflowBottom, behavior: 'smooth' })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, portal])

  useEffect(() => {
    if (!open && internalValidationState !== 'validating') {
      setDraftRange(committedRange)
    }
  }, [open, internalValidationState, committedRange])

  useEffect(() => {
    if (!open) return
    const nextFocus = selectedRange.start ?? selectedRange.end ?? new Date()
    setFocusDate(nextFocus)
  }, [open, selectedRange.start, selectedRange.end])

  const formattedStart = useMemo(
    () =>
      committedRange.start
        ? format(committedRange.start, inputValueFormat, formatOptions)
        : '',
    [committedRange.start, inputValueFormat, formatOptions],
  )

  const formattedEnd = useMemo(
    () =>
      committedRange.end
        ? format(committedRange.end, inputValueFormat, formatOptions)
        : '',
    [committedRange.end, inputValueFormat, formatOptions],
  )

  const placeholderStartText = placeholderStart ?? resolvedI18n.labels.startDatePlaceholder
  const placeholderEndText = placeholderEnd ?? resolvedI18n.labels.endDatePlaceholder
  const formatDescriptionText = formatDescription
    ?? (enableTime
      ? (timeFormat === '24h'
        ? 'Date and time format: MM/DD/YYYY HH:mm'
        : 'Date and time format: MM/DD/YYYY hh:mm AM/PM')
      : resolvedI18n.labels.formatDescription)
  const resolvedValidationState = validationState ?? internalValidationState
  const resolvedValidationMessage = validationMessage
    ?? (resolvedValidationState === 'validating'
      ? (internalValidationMessage || defaultValidatingMessage)
      : internalValidationMessage)
  const describedById = resolvedValidationState === 'idle'
    ? formatDescriptionId
    : `${formatDescriptionId} ${validationMessageId}`

  const maybeValidateRange = async (
    nextRange: DateRange,
    previousRange: DateRange,
    options: { closeOnSuccess: boolean; closeImmediatelyOnOptimistic: boolean },
  ) => {
    if (!nextRange.start || !nextRange.end || !validateAsync) {
      commitRange(nextRange)
      if (options.closeOnSuccess) closePicker()
      setValidationFeedback('idle', null)
      return
    }

    const requestId = validationRequestRef.current + 1
    validationRequestRef.current = requestId
    setDraftRange(nextRange)
    setValidationFeedback('validating', nextRange, defaultValidatingMessage)

    if (validationBehavior === 'optimistic') {
      commitRange(nextRange)
      if (options.closeImmediatelyOnOptimistic) closePicker()
    }

    let validationResult: AsyncValidationResult
    try {
      validationResult = normalizeValidationResult(await validateAsync(nextRange))
    } catch (error) {
      validationResult = {
        valid: false,
        message: getValidationErrorMessage(error),
      }
    }

    if (validationRequestRef.current !== requestId) return

    if (validationResult.valid) {
      setValidationFeedback('idle', null)
      if (validationBehavior === 'blocking') {
        commitRange(nextRange)
        if (options.closeOnSuccess) closePicker()
      }
      return
    }

    setValidationFeedback('invalid', nextRange, validationResult.message, validationResult.code)
    if (validationBehavior === 'optimistic') {
      rollbackOptimisticRange(previousRange)
      setDraftRange(previousRange)
    }
  }

  const selectRange = (range: DateRange) => {
    const previousRange = committedRange
    const nextRange = enableTime
      ? coerceRangeWithTime(range, selectedRange, startTimeFallback, endTimeFallback)
      : range

    if (enableTime) {
      setDraftRange(nextRange)
      return
    }

    if (!nextRange.start || !nextRange.end) {
      setValidationFeedback('idle', null)
      commitRange(nextRange)
      return
    }

    void maybeValidateRange(nextRange, previousRange, {
      closeOnSuccess: true,
      closeImmediatelyOnOptimistic: true,
    })
  }

  const updateRangeTime = (boundary: 'start' | 'end', parts: TimeParts) => {
    const nextRange = withBoundaryTime(selectedRange, boundary, normalizeTimeParts(parts, normalizedMinuteStep))
    if (nextRange === selectedRange) return
    if (enableTime) {
      setDraftRange(nextRange)
      return
    }

    setValidationFeedback('idle', null)
    commitRange(nextRange)
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

  const onConfirm = () => {
    if (!enableTime) {
      closePicker()
      return
    }

    void maybeValidateRange(draftRange, committedRange, {
      closeOnSuccess: true,
      closeImmediatelyOnOptimistic: true,
    })
  }

  const onCancel = () => {
    if (enableTime) {
      setDraftRange(committedRange)
    }
    closePicker()
  }

  const onEscape = () => {
    if (enableTime) {
      onCancel()
      return
    }
    closePicker()
  }

  const contextValue: DateRangePickerContextValue = {
    open,
    setOpen,
    selectedRange,
    selectRange,
    updateRangeTime,
    inputRef,
    containerRef,
    formatDescriptionId,
    validationMessageId,
    describedById,
    formattedStart,
    formattedEnd,
    placeholderStartText,
    placeholderEndText,
    formatDescriptionText,
    validationState: resolvedValidationState,
    validationMessage: resolvedValidationMessage,
    validationMessageClassName,
    enableTime,
    timeFormat,
    minuteStep: normalizedMinuteStep,
    startDefaultTime: startTimeFallback,
    endDefaultTime: endTimeFallback,
    timeLabelIcon,
    timeLabelIconClassName,
    resolvedI18n,
    formatOptions,
    cal,
    focusDate,
    setFocusDate,
    gridRef,
    popoverRef,
    monthLabelId,
    numberOfMonths: normalizedMonths,
    portal,
    portalContainer,
    isMobilePresentation,
    mobileGestures,
    showPresets,
    presetRanges,
    applyPresetRange,
    onConfirm,
    onCancel,
    onEscape,
    themeMode,
  }

  return (
    <DateRangePickerContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cx(
          getThemeScopeClassName(themeMode),
          theme.rootClassName ?? defaultDateRangePickerTheme.rootClassName,
        )}
        data-rdp-theme={themeMode}
        style={open ? { zIndex: 'var(--rdp-z-popover, 1000)' } : undefined}
      >
        {children ?? (
          <>
            <DateRangePicker.Input />
            <DateRangePicker.Calendar>
              <DateRangePicker.CalendarHeader />
              <DateRangePicker.CalendarGrid />
            </DateRangePicker.Calendar>
          </>
        )}
      </div>
    </DateRangePickerContext.Provider>
  )
}

function DateRangePickerInput({
  icon,
  iconPosition = 'right',
  iconAriaLabel = 'Open calendar',
  inputClassName = '',
  triggerClassName = '',
  placeholderStart,
  placeholderEnd,
  formatDescription,
}: DateRangePickerInputProps) {
  const theme = useDateRangePickerTheme()
  const inputIdBase = useId()
  const startInputId = `${inputIdBase}-start`
  const endInputId = `${inputIdBase}-end`
  const {
    open,
    setOpen,
    inputRef,
    formatDescriptionId,
    validationMessageId,
    describedById,
    formattedStart,
    formattedEnd,
    placeholderStartText,
    placeholderEndText,
    formatDescriptionText,
    validationState,
    validationMessage,
    validationMessageClassName,
    enableTime,
    isMobilePresentation,
  } = useDateRangePickerContext()

  const resolvedPlaceholderStart = placeholderStart ?? placeholderStartText
  const resolvedPlaceholderEnd = placeholderEnd ?? placeholderEndText
  const resolvedFormatDescription = formatDescription ?? formatDescriptionText

  const dateInputWidthClass = enableTime ? 'w-56' : 'w-40'
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
    }
  }

  return (
    <>
      <div className={theme.inputLayoutClassName}>
        <div className={theme.inputFieldsGroupClassName}>
          <div className={theme.inputFieldClassName}>
            <label htmlFor={startInputId} className={theme.inputLabelClassName}>
              {resolvedPlaceholderStart}
            </label>
            <div className={theme.inputGroupClassName}>
              {iconPosition === 'left' && (
                <button
                  type="button"
                  onClick={() => setOpen(current => !current)}
                  aria-label={iconAriaLabel}
                  className={cx(theme.triggerClassName, triggerClassName)}
                >
                  {renderPickerIcon(icon, theme.icons?.calendar)}
                </button>
              )}
              <input
                id={startInputId}
                readOnly
                className={cx(dateInputWidthClass, theme.inputClassName, inputClassName)}
                placeholder={resolvedPlaceholderStart}
                onClick={() => setOpen(current => !current)}
                onKeyDown={handleInputKeyDown}
                value={formattedStart}
                ref={inputRef}
                aria-haspopup={isMobilePresentation ? 'dialog' : 'grid'}
                aria-expanded={open}
                aria-describedby={describedById}
                aria-invalid={validationState === 'invalid'}
                aria-busy={validationState === 'validating'}
              />
              {iconPosition === 'right' && (
                <button
                  type="button"
                  onClick={() => setOpen(current => !current)}
                  aria-label={iconAriaLabel}
                  className={cx(theme.triggerClassName, triggerClassName)}
                >
                  {renderPickerIcon(icon, theme.icons?.calendar)}
                </button>
              )}
            </div>
          </div>

          <div className={theme.inputFieldClassName}>
            <label htmlFor={endInputId} className={theme.inputLabelClassName}>
              {resolvedPlaceholderEnd}
            </label>
            <div className={theme.inputGroupClassName}>
              {iconPosition === 'left' && (
                <button
                  type="button"
                  onClick={() => setOpen(current => !current)}
                  aria-label={iconAriaLabel}
                  className={cx(theme.triggerClassName, triggerClassName)}
                >
                  {renderPickerIcon(icon, theme.icons?.calendar)}
                </button>
              )}
              <input
                id={endInputId}
                readOnly
                className={cx(dateInputWidthClass, theme.inputClassName, inputClassName)}
                placeholder={resolvedPlaceholderEnd}
                onClick={() => setOpen(current => !current)}
                onKeyDown={handleInputKeyDown}
                value={formattedEnd}
                aria-describedby={describedById}
                aria-invalid={validationState === 'invalid'}
                aria-busy={validationState === 'validating'}
              />
              {iconPosition === 'right' && (
                <button
                  type="button"
                  onClick={() => setOpen(current => !current)}
                  aria-label={iconAriaLabel}
                  className={cx(theme.triggerClassName, triggerClassName)}
                >
                  {renderPickerIcon(icon, theme.icons?.calendar)}
                </button>
              )}
            </div>
          </div>
        </div>
        {validationState !== 'idle' && (
          <span
            id={validationMessageId}
            className={cx(
              theme.validationMessageClassName,
              validationState === 'invalid'
                ? theme.validationMessageInvalidClassName
                : theme.validationMessageValidatingClassName,
              validationMessageClassName,
            )}
            aria-live="polite"
          >
            {validationMessage}
          </span>
        )}
      </div>

      <span id={formatDescriptionId} style={visuallyHidden}>
        {resolvedFormatDescription}
      </span>
    </>
  )
}

function DateRangePickerCalendar({
  children,
  className = '',
  popoverClassName = '',
}: DateRangePickerCalendarProps) {
  const theme = useDateRangePickerTheme()
  const {
    open,
    resolvedI18n,
    containerRef,
    popoverRef,
    portal,
    portalContainer,
    isMobilePresentation,
    mobileGestures,
    onEscape,
    themeMode,
  } = useDateRangePickerContext()
  const { isMounted, presenceState } = usePresenceTransition(open, FLUENT_UI_DURATION_MS)
  const shouldPortal = isMobilePresentation || portal
  const shouldUseAnchorPosition = shouldPortal && !isMobilePresentation
  const {
    floatingStyle,
    isPositioned,
    panelStyle,
  } = useFloatingPopoverPosition({
    open,
    enabled: shouldUseAnchorPosition,
    referenceRef: containerRef,
    floatingRef: popoverRef,
  })
  const sheetDragStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const [sheetDragOffset, setSheetDragOffset] = useState(0)
  const [isSheetDragging, setIsSheetDragging] = useState(false)

  const handleSheetPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mobileGestures.swipeToClose) return
    sheetDragStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    setIsSheetDragging(true)
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  const handleSheetPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mobileGestures.swipeToClose || !sheetDragStartRef.current) return
    if (event.pointerId !== sheetDragStartRef.current.pointerId) return

    const start = sheetDragStartRef.current
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaY) < Math.abs(deltaX)) return

    setSheetDragOffset(Math.max(0, deltaY))
  }

  const handleSheetPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mobileGestures.swipeToClose || !sheetDragStartRef.current) return
    if (event.pointerId !== sheetDragStartRef.current.pointerId) return

    if (
      typeof event.currentTarget.hasPointerCapture === 'function' &&
      typeof event.currentTarget.releasePointerCapture === 'function' &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const start = sheetDragStartRef.current
    sheetDragStartRef.current = null
    setIsSheetDragging(false)

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    const dialogHeight = popoverRef.current?.getBoundingClientRect().height ?? 0
    const ratioThreshold = dialogHeight > 0 ? dialogHeight * SHEET_CLOSE_RATIO_THRESHOLD : SWIPE_CLOSE_THRESHOLD
    const shouldClose =
      deltaY > SWIPE_CLOSE_THRESHOLD &&
      deltaY >= ratioThreshold &&
      Math.abs(deltaY) > Math.abs(deltaX)

    if (shouldClose) {
      setSheetDragOffset(0)
      onEscape()
      return
    }

    setSheetDragOffset(0)
  }
  useEffect(() => {
    if (!open || !isMobilePresentation) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
      sheetDragStartRef.current = null
      setSheetDragOffset(0)
      setIsSheetDragging(false)
    }
  }, [open, isMobilePresentation])

  useEffect(() => {
    if (!open) return
    if (shouldUseAnchorPosition && !isPositioned) return

    const frame = window.requestAnimationFrame(() => {
      const dialog = popoverRef.current
      if (!dialog) return
      const initialTarget = dialog.querySelector<HTMLElement>('[data-initial-focus="true"]')
        ?? dialog.querySelector<HTMLElement>('[role="grid"]')
        ?? getFocusableElements(dialog)[0]
      initialTarget?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, isPositioned, popoverRef, shouldUseAnchorPosition])

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented && event.key !== 'Tab') return

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onEscape()
      return
    }

    if (event.key !== 'Tab') return

    const dialog = popoverRef.current
    if (!dialog) return
    const focusable = getFocusableElements(dialog)
    if (focusable.length === 0) {
      event.preventDefault()
      dialog.focus()
      return
    }

    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const activeIndex = activeElement ? focusable.indexOf(activeElement) : -1

    if (event.shiftKey) {
      if (activeIndex <= 0) {
        event.preventDefault()
        focusable[focusable.length - 1].focus()
      }
      return
    }

    if (activeIndex === -1 || activeIndex === focusable.length - 1) {
      event.preventDefault()
      focusable[0].focus()
    }
  }

  if (!isMounted) return null

  const content = isMobilePresentation ? (
    <div
      className={cx(getThemeScopeClassName(themeMode), theme.mobilePopoverShellClassName, popoverClassName)}
      data-rdp-theme={themeMode}
      data-state={presenceState}
    >
      <button
        type="button"
        aria-label="Close range calendar"
        className={theme.mobileBackdropClassName}
        data-state={presenceState}
        style={{ opacity: Math.max(0.2, 1 - sheetDragOffset / 280) }}
        onClick={onEscape}
      />
      <div
        style={{
          transform: `translateY(${sheetDragOffset}px)`,
          transition: isSheetDragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label={resolvedI18n.labels.rangeCalendar}
          tabIndex={-1}
          onKeyDown={handleDialogKeyDown}
          className={cx(theme.mobileSheetClassName, className)}
          data-state={presenceState}
        >
          <div
            className={theme.mobileSheetHandleWrapClassName}
            onPointerDown={handleSheetPointerDown}
            onPointerMove={handleSheetPointerMove}
            onPointerUp={handleSheetPointerEnd}
            onPointerCancel={handleSheetPointerEnd}
            data-testid="range-sheet-handle"
          >
            <div className={theme.mobileSheetHandleClassName} aria-hidden="true" />
          </div>
          {children ?? (
            <>
              <DateRangePickerCalendarHeader />
              <DateRangePickerCalendarGrid />
            </>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div
      ref={popoverRef}
      className={cx(
        shouldPortal ? 'absolute' : 'absolute left-0 top-full mt-2',
        getThemeScopeClassName(themeMode),
        theme.desktopPopoverShellClassName,
        popoverClassName,
      )}
      data-rdp-theme={themeMode}
      data-state={presenceState}
      style={shouldPortal
        ? {
            ...floatingStyle,
            zIndex: 'var(--rdp-z-popover, 1000)',
            opacity: open && shouldUseAnchorPosition && !isPositioned ? 0 : undefined,
            pointerEvents: open && shouldUseAnchorPosition && !isPositioned ? 'none' : undefined,
          }
        : { zIndex: 'var(--rdp-z-popover, 1000)' }}
      role="dialog"
      aria-label={resolvedI18n.labels.rangeCalendar}
      tabIndex={-1}
      onKeyDown={handleDialogKeyDown}
    >
      <div className={cx(theme.desktopPopoverPanelClassName, className)} data-state={presenceState} style={panelStyle}>
        {children ?? (
          <>
            <DateRangePickerCalendarHeader />
            <DateRangePickerCalendarGrid />
          </>
        )}
      </div>
    </div>
  )

  if (shouldPortal) {
    const target = portalContainer ?? (typeof document !== 'undefined' ? document.body : null)
    return target ? createPortal(content, target) : null
  }

  return (
    content
  )
}

function DateRangePickerCalendarHeader() {
  const theme = useDateRangePickerTheme()
  const { cal, resolvedI18n, formatOptions, numberOfMonths, monthLabelId, setFocusDate } = useDateRangePickerContext()

  const visibleMonths = useMemo(
    () => Array.from({ length: numberOfMonths }, (_, index) => addMonths(cal.currentMonth, index)),
    [cal.currentMonth, numberOfMonths],
  )

  const headerLabel = useMemo(() => {
    if (visibleMonths.length === 1) {
      return format(visibleMonths[0], resolvedI18n.format.monthLabel, formatOptions)
    }

    const first = format(visibleMonths[0], resolvedI18n.format.monthLabel, formatOptions)
    const last = format(
      visibleMonths[visibleMonths.length - 1],
      resolvedI18n.format.monthLabel,
      formatOptions,
    )
    return `${first} - ${last}`
  }, [visibleMonths, resolvedI18n.format.monthLabel, formatOptions])

  return (
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
  )
}

type TimeWheelOption<T extends string | number> = {
  value: T
  label: string
  ariaLabel: string
}

type TimeWheelColumnProps<T extends string | number> = {
  title: string
  ariaLabel: string
  options: TimeWheelOption<T>[]
  value: T
  disabled?: boolean
  onChange: (value: T) => void
}

function TimeWheelColumn<T extends string | number>({
  title,
  ariaLabel,
  options,
  value,
  disabled = false,
  onChange,
}: TimeWheelColumnProps<T>) {
  const theme = useDateRangePickerTheme()
  const optionIdBase = useId()
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = selectedRef.current
    if (!button || typeof button.scrollIntoView !== 'function') return
    button.scrollIntoView({ block: 'start' })
  }, [value])

  const selectedIndex = options.findIndex(option => option.value === value)
  const selectedOptionId = selectedIndex >= 0 ? `${optionIdBase}-option-${selectedIndex}` : undefined

  const setByIndex = (nextIndex: number) => {
    if (options.length === 0) return
    onChange(options[Math.max(0, Math.min(options.length - 1, nextIndex))].value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || options.length === 0) return

    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        setByIndex(currentIndex - 1)
        break
      case 'ArrowDown':
        event.preventDefault()
        setByIndex(currentIndex + 1)
        break
      case 'Home':
        event.preventDefault()
        setByIndex(0)
        break
      case 'End':
        event.preventDefault()
        setByIndex(options.length - 1)
        break
      case 'PageUp':
        event.preventDefault()
        setByIndex(currentIndex - 5)
        break
      case 'PageDown':
        event.preventDefault()
        setByIndex(currentIndex + 5)
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        setByIndex(currentIndex)
        break
      default:
        break
    }
  }

  return (
    <div className={theme.timeWheelColumnClassName}>
      <div className={theme.timeWheelTitleClassName}>{title}</div>
      <div
        className={theme.timeWheelListClassName?.(disabled)}
        onKeyDown={handleKeyDown}
        role="listbox"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-activedescendant={selectedOptionId}
        aria-orientation="vertical"
        aria-disabled={disabled}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value
          return (
            <button
              key={String(option.value)}
              id={`${optionIdBase}-option-${index}`}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              role="option"
              aria-selected={isSelected}
              tabIndex={-1}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              aria-label={`${ariaLabel} - ${option.ariaLabel}`}
              className={theme.timeWheelOptionClassName?.({
                disabled,
                selected: isSelected,
              })}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const twoDigit = (value: number) => String(value).padStart(2, '0')

const getMeridiem = (hours: number) => (hours >= 12 ? 'PM' : 'AM')

const getTwelveHour = (hours: number) => {
  const normalized = hours % 12
  return normalized === 0 ? 12 : normalized
}

const toTwentyFourHour = (hour12: number, meridiem: 'AM' | 'PM') => {
  const normalized = hour12 % 12
  return meridiem === 'PM' ? normalized + 12 : normalized
}

function DateRangePickerTimeWheels() {
  const theme = useDateRangePickerTheme()
  const {
    enableTime,
    timeFormat,
    minuteStep,
    selectedRange,
    startDefaultTime,
    endDefaultTime,
    timeLabelIcon,
    timeLabelIconClassName,
    updateRangeTime,
  } = useDateRangePickerContext()
  const summaryId = useId()

  if (!enableTime) return null

  const startParts = getTimePartsFromDate(selectedRange.start, startDefaultTime)
  const endParts = getTimePartsFromDate(selectedRange.end, endDefaultTime)
  const minuteOptions: TimeWheelOption<number>[] = []
  for (let minute = 0; minute < 60; minute += minuteStep) {
    minuteOptions.push({
      value: minute,
      label: twoDigit(minute),
      ariaLabel: `Set minutes to ${twoDigit(minute)}`,
    })
  }

  const hour24Options: TimeWheelOption<number>[] = Array.from({ length: 24 }, (_, hour) => ({
    value: hour,
    label: twoDigit(hour),
    ariaLabel: `Set hour to ${twoDigit(hour)}`,
  }))

  const hour12Options: TimeWheelOption<number>[] = Array.from({ length: 12 }, (_, index) => {
    const hour = index + 1
    return {
      value: hour,
      label: String(hour),
      ariaLabel: `Set hour to ${hour}`,
    }
  })

  const periodOptions: TimeWheelOption<'AM' | 'PM'>[] = [
    { value: 'AM', label: 'AM', ariaLabel: 'Set period to AM' },
    { value: 'PM', label: 'PM', ariaLabel: 'Set period to PM' },
  ]

  const renderBoundaryWheels = (boundary: 'start' | 'end', parts: TimeParts, disabled: boolean) => {
    const meridiem = getMeridiem(parts.hours)
    const hour12 = getTwelveHour(parts.hours)
    const titlePrefix = boundary === 'start' ? 'Start' : 'End'
    const iconNode = timeLabelIcon ? normalizeIconNode(timeLabelIcon) : theme.icons?.clock ?? <DefaultClockIcon />

    return (
      <section className={theme.timeBoundarySectionClassName}>
        <div className={theme.timeBoundaryHeaderClassName}>
          <span className={cx(theme.timeBoundaryIconWrapClassName, timeLabelIconClassName)} aria-hidden="true">
            {iconNode}
          </span>
          <span>{titlePrefix} time</span>
        </div>
        <div className={theme.timeBoundaryGridClassName}>
          {timeFormat === '24h' ? (
            <>
              <TimeWheelColumn
                title="Hour"
                ariaLabel={`${titlePrefix} hour`}
                options={hour24Options}
                value={parts.hours}
                disabled={disabled}
                onChange={nextHour => updateRangeTime(boundary, { ...parts, hours: nextHour })}
              />
              <TimeWheelColumn
                title="Minute"
                ariaLabel={`${titlePrefix} minute`}
                options={minuteOptions}
                value={parts.minutes}
                disabled={disabled}
                onChange={nextMinute => updateRangeTime(boundary, { ...parts, minutes: nextMinute })}
              />
            </>
          ) : (
            <>
              <TimeWheelColumn
                title="Hour"
                ariaLabel={`${titlePrefix} hour`}
                options={hour12Options}
                value={hour12}
                disabled={disabled}
                onChange={nextHour =>
                  updateRangeTime(boundary, {
                    ...parts,
                    hours: toTwentyFourHour(nextHour, meridiem),
                  })}
              />
              <TimeWheelColumn
                title="Minute"
                ariaLabel={`${titlePrefix} minute`}
                options={minuteOptions}
                value={parts.minutes}
                disabled={disabled}
                onChange={nextMinute => updateRangeTime(boundary, { ...parts, minutes: nextMinute })}
              />
              <TimeWheelColumn
                title="AM/PM"
                ariaLabel={`${titlePrefix} period`}
                options={periodOptions}
                value={meridiem}
                disabled={disabled}
                onChange={nextPeriod =>
                  updateRangeTime(boundary, {
                    ...parts,
                    hours: toTwentyFourHour(hour12, nextPeriod),
                  })}
              />
            </>
          )}
        </div>
      </section>
    )
  }

  const startSummary = selectedRange.start
    ? format(selectedRange.start, timeFormat === '24h' ? 'PPP HH:mm' : 'PPP hh:mm a')
    : 'not selected'
  const endSummary = selectedRange.end
    ? format(selectedRange.end, timeFormat === '24h' ? 'PPP HH:mm' : 'PPP hh:mm a')
    : 'not selected'

  return (
    <section className={theme.timeSectionClassName} aria-label="Time range selectors" aria-describedby={summaryId}>
      <div className={theme.timeSectionTitleClassName}>Time range</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {renderBoundaryWheels('start', startParts, !selectedRange.start)}
        {renderBoundaryWheels('end', endParts, !selectedRange.end)}
      </div>
      <span id={summaryId} style={visuallyHidden} aria-live="polite">
        {`Start ${startSummary}. End ${endSummary}.`}
      </span>
    </section>
  )
}

function DateRangePickerCalendarGrid() {
  const theme = useDateRangePickerTheme()
  const {
    cal,
    selectedRange,
    selectRange,
    enableTime,
    resolvedI18n,
    formatOptions,
    focusDate,
    setFocusDate,
    gridRef,
    monthLabelId,
    numberOfMonths,
    mobileGestures,
    showPresets,
    presetRanges,
    applyPresetRange,
    onConfirm,
    onCancel,
    onEscape,
  } = useDateRangePickerContext()

  const weekOptions = useMemo(
    () => ({
      locale: resolvedI18n.locale,
      weekStartsOn: (resolvedI18n.weekStartsOn ?? 0) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    }),
    [resolvedI18n.locale, resolvedI18n.weekStartsOn],
  )

  const visibleMonths = useMemo(
    () =>
      Array.from({ length: numberOfMonths }, (_, index) => {
        const monthStart = startOfMonth(addMonths(cal.currentMonth, index))
        return {
          monthStart,
          weeks: buildMonthWeeks(monthStart, weekOptions),
          weekdayLabels: buildMonthWeeks(monthStart, weekOptions)[0].map(day =>
            format(day, resolvedI18n.format.weekdayLabel, formatOptions),
          ),
        } satisfies MonthView
      }),
    [
      cal.currentMonth,
      numberOfMonths,
      weekOptions,
      resolvedI18n.format.weekdayLabel,
      formatOptions,
    ],
  )

  const visibleRangeDays = useMemo(
    () => getVisibleRangeDays(cal.currentMonth, numberOfMonths, weekOptions),
    [cal.currentMonth, numberOfMonths, weekOptions],
  )
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

  const monthAnimatorRef = useRef<HTMLDivElement>(null)
  const previousMonthRef = useRef(cal.currentMonth)
  const monthSwipeStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const monthOffset = differenceInCalendarMonths(startOfMonth(focusDate), startOfMonth(cal.currentMonth))

    if (monthOffset < 0) {
      cal.goToMonth(startOfMonth(focusDate))
      return
    }

    if (monthOffset >= numberOfMonths) {
      cal.goToMonth(addMonths(startOfMonth(focusDate), -(numberOfMonths - 1)))
    }
  }, [focusDate, cal, numberOfMonths])

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
      focusMonthOffset < 0 ? 0 : Math.min(numberOfMonths - 1, focusMonthOffset)
    const focusPanelMonth = visibleMonths[focusPanelIndex]?.monthStart ?? visibleMonths[0]?.monthStart

    if (!focusPanelMonth) return

    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[role="gridcell"][data-date-key="${focusDate.getTime()}-${focusPanelMonth.getTime()}"]`,
    )
    cell?.focus()
  }, [cal.currentMonth, focusDate, gridRef, numberOfMonths, visibleMonths])

  const moveFocusByDays = (delta: number) => {
    setFocusDate(previous => addDays(previous, delta))
  }

  const handleMonthViewportPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mobileGestures.swipeMonth) return
    monthSwipeStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const handleMonthViewportPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mobileGestures.swipeMonth || !monthSwipeStartRef.current) return

    const start = monthSwipeStartRef.current
    monthSwipeStartRef.current = null
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaX) < SWIPE_MONTH_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return

    if (deltaX < 0) {
      cal.next()
      setFocusDate(previous => addMonths(previous, 1))
      return
    }

    cal.prev()
    setFocusDate(previous => addMonths(previous, -1))
  }

  const isPresetActive = (preset: DateRangePreset) => {
    if (!selectedRange.start || !selectedRange.end || !preset.range.start || !preset.range.end) {
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
        onEscape()
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        selectRange(cal.nextRange(focusDate, selectedRange))
        break
      default:
        break
    }
  }

  return (
    <div className="flex flex-col gap-3">
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
      <div
        role="grid"
        tabIndex={0}
        aria-labelledby={monthLabelId}
        aria-colcount={7}
        aria-rowcount={totalGridRows}
        onKeyDown={handleKeyDown}
        ref={gridRef}
        data-initial-focus="true"
      >
      <div
        ref={monthAnimatorRef}
        className={theme.monthsViewportClassName}
        onPointerDown={handleMonthViewportPointerDown}
        onPointerUp={handleMonthViewportPointerUp}
        onPointerCancel={() => { monthSwipeStartRef.current = null }}
        data-testid="range-month-viewport"
      >
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
                  const isRangeEdge = !!cal.isRangeEdge(day, selectedRange)
                  const inRange = cal.isInRange(day, selectedRange)
                  const isFocused = cal.isSameDay(day, focusDate) && cal.isSameMonth(day, focusDate)

                  return (
                    <button
                      key={`${monthView.monthStart.getTime()}-${weekIndex}-${dayIndex}`}
                      role="gridcell"
                      aria-selected={isRangeEdge}
                      aria-rowindex={rowStart + weekIndex + 1}
                      aria-colindex={dayIndex + 1}
                      tabIndex={isFocused ? 0 : -1}
                      data-date-key={`${day.getTime()}-${monthView.monthStart.getTime()}`}
                      onClick={() => {
                        const nextRange = cal.nextRange(day, selectedRange)
                        setFocusDate(day)
                        selectRange(nextRange)
                      }}
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
    <DateRangePickerTimeWheels />
    {enableTime && (
      <div className={theme.actionsClassName}>
        <button
          type="button"
          onClick={onCancel}
          className={theme.cancelButtonClassName}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={theme.confirmButtonClassName}
        >
          OK
        </button>
      </div>
    )}
    </div>
  )
}

function DefaultCalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-gray-600 dark:text-gray-300"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function DefaultClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 dark:text-gray-300"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

type DateRangePickerCompoundComponent = React.FC<DateRangePickerProps> & {
  Input: typeof DateRangePickerInput
  Calendar: typeof DateRangePickerCalendar
  CalendarHeader: typeof DateRangePickerCalendarHeader
  CalendarGrid: typeof DateRangePickerCalendarGrid
}

export function createDateRangePicker(baseTheme: DateRangePickerTheme = defaultDateRangePickerTheme) {
  const ThemedDateRangePicker = (({ skin, ...props }: DateRangePickerProps) => {
    const resolvedTheme = useMemo(() => {
      const themedBase = isMaterialTheme(props.theme)
        ? mergeThemeWithSkin(baseTheme, materialDateRangePickerTheme)
        : isModernMinimalTheme(props.theme)
          ? mergeThemeWithSkin(baseTheme, modernMinimalDateRangePickerTheme)
        : isBookingTheme(props.theme)
          ? mergeThemeWithSkin(baseTheme, bookingDateRangePickerTheme)
        : baseTheme

      return mergeThemeWithSkin(themedBase, skin)
    }, [props.theme, skin])

    return (
      <DateRangePickerThemeContext.Provider value={resolvedTheme}>
        <DateRangePickerRoot {...props} />
      </DateRangePickerThemeContext.Provider>
    )
  }) as DateRangePickerCompoundComponent

  ThemedDateRangePicker.Input = DateRangePickerInput
  ThemedDateRangePicker.Calendar = DateRangePickerCalendar
  ThemedDateRangePicker.CalendarHeader = DateRangePickerCalendarHeader
  ThemedDateRangePicker.CalendarGrid = DateRangePickerCalendarGrid

  return ThemedDateRangePicker
}

const DateRangePicker = createDateRangePicker()

export default DateRangePicker
