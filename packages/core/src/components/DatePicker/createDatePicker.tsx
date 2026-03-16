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
import { addMonths, differenceInCalendarMonths, format, startOfMonth } from 'date-fns'
import { resolveCalendarI18n, type CalendarI18n } from '../../i18n'
import { useCalendar } from '../../headless/useCalendar'
import {
  getThemeScopeClassName,
  isBookingTheme,
  isMaterialTheme,
  isModernMinimalTheme,
  mergeThemeWithSkin,
  type ThemeMode,
  type ThemeSkin,
} from '../../theming'
import { useFloatingPopoverPosition } from '../../floating'
import { animateMonthSlide, FLUENT_UI_DURATION_MS, usePresenceTransition } from '../../motion'
import type {
  AsyncValidationBehavior,
  AsyncValidationResult,
  AsyncValidationState,
  AsyncValidationStateChange,
} from '../../asyncValidation'

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ')

type DatePickerContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedDate: Date | null
  selectDate: (date: Date) => void
  inputRef: React.MutableRefObject<HTMLInputElement | null>
  containerRef: React.MutableRefObject<HTMLDivElement | null>
  formatDescriptionId: string
  validationMessageId: string
  describedById: string
  formatted: string
  placeholderText: string
  formatDescriptionText: string
  resolvedI18n: ReturnType<typeof resolveCalendarI18n>
  formatOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale'] }
  cal: ReturnType<typeof useCalendar>
  focusDate: Date
  setFocusDate: React.Dispatch<React.SetStateAction<Date>>
  gridRef: React.MutableRefObject<HTMLDivElement | null>
  popoverRef: React.MutableRefObject<HTMLDivElement | null>
  monthLabelId: string
  portal: boolean
  portalContainer: HTMLElement | null
  onEscape: () => void
  isDateDisabled: (date: Date) => boolean
  validationState: AsyncValidationState
  validationMessage: string
  validationMessageClassName: string
  themeMode?: ThemeMode
}

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

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const getFocusableElements = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    element =>
      !element.hasAttribute('disabled')
      && element.getAttribute('aria-hidden') !== 'true'
      && !element.hasAttribute('inert'),
  )

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

const defaultIsDateDisabled = () => false
const defaultValidatingMessage = 'Validating selection...'

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

export type DatePickerBaseProps = {
  children?: React.ReactNode
  value?: Date | null
  onChange?: (date: Date) => void
  placeholder?: string
  formatDescription?: string
  i18n?: CalendarI18n
  portal?: boolean
  portalContainer?: HTMLElement | null
  theme?: ThemeMode
  skin?: DatePickerSkin
}

export type DatePickerAsyncValidationProps = {
  validateAsync?: (date: Date) => Promise<AsyncValidationResult>
  validationBehavior?: AsyncValidationBehavior
  validationState?: AsyncValidationState
  validationMessage?: string
  validationMessageClassName?: string
  onValidationStateChange?: (detail: AsyncValidationStateChange<Date>) => void
}

export type DatePickerResolvedProps = DatePickerBaseProps & DatePickerAsyncValidationProps & {
  isDateDisabled?: (date: Date) => boolean
}

export type DatePickerInputProps = {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  iconAriaLabel?: string
  inputClassName?: string
  triggerClassName?: string
  placeholder?: string
  formatDescription?: string
}

export type DatePickerCalendarProps = {
  children?: React.ReactNode
  className?: string
  popoverClassName?: string
}

export type DatePickerDaySlotState = {
  active: boolean
  disabled: boolean
  faded: boolean
  focused: boolean
}

export type DatePickerAdapterTheme = {
  rootClassName?: string
  inputLayoutClassName?: string
  inputGroupClassName?: string
  inputClassName?: string
  triggerClassName?: string
  validationMessageClassName?: string
  validationMessageInvalidClassName?: string
  validationMessageValidatingClassName?: string
  popoverShellClassName?: string
  popoverPanelClassName?: string
  headerClassName?: string
  headerNavGroupClassName?: string
  headerNavButtonClassName?: string
  monthLabelClassName?: string
  weekdayRowClassName?: string
  weekdayCellClassName?: string
  gridClassName?: string
  dayButtonClassName?: (state: DatePickerDaySlotState) => string
  icons?: {
    calendar?: React.ReactNode
    prevYear?: React.ReactNode
    prevMonth?: React.ReactNode
    nextMonth?: React.ReactNode
    nextYear?: React.ReactNode
  }
}

export type DatePickerSkin = ThemeSkin<DatePickerAdapterTheme>

const defaultDatePickerAdapterTheme: DatePickerAdapterTheme = {
  rootClassName: 'relative inline-flex items-center gap-1',
  inputLayoutClassName: 'inline-flex flex-wrap items-center gap-3',
  inputGroupClassName: 'inline-flex items-center gap-1',
  inputClassName:
    'w-48 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-400 dark:hover:border-blue-300 dark:focus-visible:ring-blue-400',
  triggerClassName:
    'inline-flex items-center justify-center rounded border border-gray-300 bg-white p-2 text-gray-700 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-300 dark:focus-visible:ring-blue-400',
  validationMessageClassName: 'text-sm',
  validationMessageInvalidClassName: 'text-red-600 dark:text-red-400',
  validationMessageValidatingClassName: 'text-gray-600 dark:text-gray-400',
  popoverShellClassName: 'rounded bg-white shadow dark:bg-gray-900',
  popoverPanelClassName:
    'w-72 rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50',
  headerClassName: 'mb-2 flex justify-between',
  headerNavGroupClassName: 'flex gap-1',
  headerNavButtonClassName:
    'inline-flex h-8 w-8 items-center justify-center rounded border border-transparent text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:ring-blue-400',
  monthLabelClassName: 'font-semibold text-gray-900 dark:text-gray-50',
  weekdayRowClassName: 'mb-1 grid grid-cols-7 text-sm text-gray-600 dark:text-gray-400',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ active, disabled, faded }) =>
    cx(
      'rounded border border-transparent p-1 text-gray-900 focus-visible:border-blue-500 focus-visible:outline-none dark:text-gray-100 dark:focus-visible:border-blue-300',
      disabled
        ? 'cursor-not-allowed border-transparent bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600'
        : cx(
          'hover:border-blue-400 dark:hover:border-blue-300',
          active
            ? 'bg-blue-600 text-white'
            : faded
              ? 'text-gray-300 hover:bg-transparent dark:text-gray-600'
              : 'hover:bg-blue-100 dark:hover:bg-blue-950/60',
        ),
    ),
}

const materialDatePickerTheme: DatePickerSkin = {
  inputGroupClassName: 'inline-flex items-center gap-2',
  inputClassName:
    'w-52 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder:text-slate-500 transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-400 dark:hover:border-slate-600 dark:focus-visible:ring-sky-400',
  triggerClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-sky-400',
  validationMessageInvalidClassName: 'text-rose-600 dark:text-rose-400',
  validationMessageValidatingClassName: 'text-slate-500 dark:text-slate-400',
  popoverShellClassName: 'rounded-[32px] bg-transparent',
  popoverPanelClassName:
    'w-[320px] rounded-[32px] border border-slate-200 bg-slate-50 p-4 text-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.14)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  headerClassName: 'mb-3 flex items-center justify-between',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  monthLabelClassName: 'text-base font-medium tracking-[0.01em] text-slate-900 dark:text-slate-50',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1.5',
  dayButtonClassName: ({ active, disabled, faded, focused }) =>
    cx(
      'rounded-full border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400',
      disabled
        ? 'cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
        : '',
      active ? 'bg-sky-600 text-white shadow-sm dark:bg-sky-500' : '',
      !active && !disabled ? 'hover:bg-slate-200 dark:hover:bg-slate-800' : '',
      !active && faded ? 'text-slate-300 dark:text-slate-600' : '',
      focused && !active && !disabled ? 'bg-slate-100 dark:bg-slate-800' : '',
    ),
}

const modernMinimalDatePickerTheme: DatePickerSkin = {
  inputGroupClassName: 'inline-flex items-center gap-2',
  inputClassName:
    'w-52 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-zinc-950 placeholder:text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-600',
  triggerClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-600',
  validationMessageInvalidClassName: 'text-rose-600 dark:text-rose-400',
  validationMessageValidatingClassName: 'text-zinc-500 dark:text-zinc-400',
  popoverShellClassName: 'rounded-2xl bg-transparent',
  popoverPanelClassName:
    'w-[320px] rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
  headerClassName: 'mb-3 flex items-center justify-between',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-zinc-600 transition-colors hover:bg-zinc-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600',
  monthLabelClassName: 'text-sm font-medium tracking-[0.01em] text-zinc-900 dark:text-zinc-50',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ active, disabled, faded, focused }) =>
    cx(
      'rounded-xl border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600',
      disabled ? 'cursor-not-allowed bg-zinc-100 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700' : '',
      active ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950' : '',
      !active && !disabled ? 'hover:bg-zinc-200/80 dark:hover:bg-zinc-800' : '',
      !active && faded ? 'text-zinc-300 dark:text-zinc-700' : '',
      focused && !active && !disabled ? 'bg-zinc-100 dark:bg-zinc-900' : '',
    ),
}

const bookingDatePickerTheme: DatePickerSkin = {
  inputGroupClassName: 'inline-flex items-center gap-2',
  inputClassName:
    'w-52 rounded-xl border border-sky-200 bg-white px-4 py-2 text-slate-950 placeholder:text-slate-500 transition-colors hover:border-[#006ce4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-400 dark:hover:border-sky-400 dark:focus-visible:ring-sky-400',
  triggerClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-[#003580] transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:border-slate-700 dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  validationMessageInvalidClassName: 'text-rose-600 dark:text-rose-400',
  validationMessageValidatingClassName: 'text-slate-500 dark:text-slate-400',
  popoverShellClassName: 'rounded-2xl bg-transparent',
  popoverPanelClassName:
    'w-[320px] rounded-2xl border border-sky-200 bg-white p-4 text-slate-950 shadow-[0_20px_40px_rgba(0,53,128,0.14)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
  headerClassName: 'mb-3 flex items-center justify-between',
  headerNavGroupClassName: 'flex items-center gap-1.5',
  headerNavButtonClassName:
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-sky-50 text-[#003580] transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700 dark:focus-visible:ring-sky-400',
  monthLabelClassName: 'text-sm font-semibold tracking-[0.01em] text-[#003580] dark:text-white',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1.5',
  dayButtonClassName: ({ active, disabled, faded, focused }) =>
    cx(
      'rounded-xl border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006ce4] dark:focus-visible:ring-sky-400',
      disabled ? 'cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600' : '',
      active ? 'border-[#006ce4] bg-[#006ce4] text-white shadow-sm dark:border-sky-500 dark:bg-sky-500' : '',
      !active && !disabled ? 'hover:border-sky-200 hover:bg-sky-50 dark:hover:border-slate-700 dark:hover:bg-slate-800' : '',
      !active && faded ? 'text-slate-300 dark:text-slate-600' : '',
      focused && !active && !disabled ? 'bg-amber-50 dark:bg-slate-800' : '',
    ),
}

const DatePickerThemeContext = createContext<DatePickerAdapterTheme>(defaultDatePickerAdapterTheme)

const useDatePickerTheme = () => useContext(DatePickerThemeContext)

type DatePickerCompoundComponent<TRootProps> = React.FC<TRootProps> & {
  Input: React.FC<DatePickerInputProps>
  Calendar: React.FC<DatePickerCalendarProps>
  CalendarHeader: React.FC
  CalendarGrid: React.FC
}

export function createDatePicker<TRootProps>(
  useResolvedProps: (props: TRootProps) => DatePickerResolvedProps,
  baseTheme: DatePickerAdapterTheme = defaultDatePickerAdapterTheme,
) {
  const DatePickerContext = createContext<DatePickerContextValue | null>(null)

  function useDatePickerContext() {
    const context = useContext(DatePickerContext)
    if (!context) throw new Error('DatePicker compound components must be used inside <DatePicker>.')
    return context
  }

  function DatePickerRoot(props: TRootProps) {
    const {
      children,
      value,
      onChange,
      placeholder,
      formatDescription,
      i18n,
      portal = true,
      portalContainer = null,
      theme: themeMode,
      skin,
      isDateDisabled,
      validateAsync,
      validationBehavior = 'blocking',
      validationState,
      validationMessage,
      validationMessageClassName = '',
      onValidationStateChange,
    } = useResolvedProps(props)
    const resolvedTheme = useMemo(() => {
      const themedBase = isMaterialTheme(themeMode)
        ? mergeThemeWithSkin(baseTheme, materialDatePickerTheme)
        : isModernMinimalTheme(themeMode)
          ? mergeThemeWithSkin(baseTheme, modernMinimalDatePickerTheme)
        : isBookingTheme(themeMode)
          ? mergeThemeWithSkin(baseTheme, bookingDatePickerTheme)
        : baseTheme

      return mergeThemeWithSkin(themedBase, skin)
    }, [skin, themeMode])

    const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
    const formatOptions = useMemo(
      () => ({ locale: resolvedI18n.locale }),
      [resolvedI18n.locale],
    )
    const [open, setOpen] = useState(false)
    const [internalDate, setInternalDate] = useState<Date | null>(value ?? null)
    const [pendingDate, setPendingDate] = useState<Date | null>(null)
    const [internalValidationState, setInternalValidationState] = useState<AsyncValidationState>('idle')
    const [internalValidationMessage, setInternalValidationMessage] = useState('')
    const containerRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const gridRef = useRef<HTMLDivElement | null>(null)
    const popoverRef = useRef<HTMLDivElement | null>(null)
    const formatDescriptionId = useId()
    const validationMessageId = useId()
    const validationRequestRef = useRef(0)
    const resolvedIsDateDisabled = useMemo(
      () => isDateDisabled ?? defaultIsDateDisabled,
      [isDateDisabled],
    )

    useEffect(() => {
      if (value !== undefined) setInternalDate(value ?? null)
    }, [value])

    const committedDate = value ?? internalDate
    const selectedDate = pendingDate ?? committedDate

    const cal = useCalendar(selectedDate ?? undefined, {
      locale: resolvedI18n.locale,
      weekStartsOn: resolvedI18n.weekStartsOn,
    })

    const monthLabelId = useMemo(
      () => `date-picker-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
      [cal.currentMonth],
    )

    const activeDate = committedDate ?? cal.currentMonth
    const [focusDate, setFocusDate] = useState<Date>(activeDate)

    const emitValidationStateChange = (
      nextState: AsyncValidationState,
      candidate: Date | null,
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
      candidate: Date | null,
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

    const commitDate = (date: Date) => {
      if (value === undefined) setInternalDate(date)
      onChange?.(date)
    }

    const rollbackOptimisticDate = (previousDate: Date | null) => {
      if (value === undefined) {
        setInternalDate(previousDate)
      } else if (previousDate) {
        onChange?.(previousDate)
      }
    }

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
        setPendingDate(null)
      }
    }, [open, internalValidationState])

    const formatted = useMemo(
      () =>
        committedDate
          ? format(committedDate, resolvedI18n.format.inputValue, formatOptions)
          : '',
      [committedDate, resolvedI18n.format.inputValue, formatOptions],
    )

    const placeholderText = placeholder ?? resolvedI18n.labels.selectDatePlaceholder
    const formatDescriptionText = formatDescription ?? resolvedI18n.labels.formatDescription
    const resolvedValidationState = validationState ?? internalValidationState
    const resolvedValidationMessage = validationMessage
      ?? (resolvedValidationState === 'validating'
        ? (internalValidationMessage || defaultValidatingMessage)
        : internalValidationMessage)
    const describedById = resolvedValidationState === 'idle'
      ? formatDescriptionId
      : `${formatDescriptionId} ${validationMessageId}`

    const selectDate = async (date: Date) => {
      if (resolvedIsDateDisabled(date)) return
      const previousDate = committedDate
      const requestId = validationRequestRef.current + 1
      validationRequestRef.current = requestId

      if (!validateAsync) {
        setPendingDate(null)
        setValidationFeedback('idle', null)
        commitDate(date)
        closePicker()
        return
      }

      setPendingDate(date)
      setValidationFeedback('validating', date, defaultValidatingMessage)

      if (validationBehavior === 'optimistic') {
        commitDate(date)
        closePicker()
      }

      let validationResult: AsyncValidationResult
      try {
        validationResult = normalizeValidationResult(await validateAsync(date))
      } catch (error) {
        validationResult = {
          valid: false,
          message: getValidationErrorMessage(error),
        }
      }

      if (validationRequestRef.current !== requestId) return

      if (validationResult.valid) {
        setPendingDate(null)
        setValidationFeedback('idle', null)
        if (validationBehavior === 'blocking') {
          commitDate(date)
          closePicker()
        }
        return
      }

      setValidationFeedback('invalid', date, validationResult.message, validationResult.code)
      if (validationBehavior === 'optimistic') {
        setPendingDate(null)
        rollbackOptimisticDate(previousDate)
      }
    }

    const onEscape = () => {
      closePicker()
    }

    const contextValue: DatePickerContextValue = {
      open,
      setOpen,
      selectedDate,
      selectDate,
      inputRef,
      containerRef,
      formatDescriptionId,
      validationMessageId,
      describedById,
      formatted,
      placeholderText,
      formatDescriptionText,
      resolvedI18n,
      formatOptions,
      cal,
      focusDate,
      setFocusDate,
      gridRef,
      popoverRef,
      monthLabelId,
      portal,
      portalContainer,
      onEscape,
      isDateDisabled: resolvedIsDateDisabled,
      validationState: resolvedValidationState,
      validationMessage: resolvedValidationMessage,
      validationMessageClassName,
      themeMode,
    }

    return (
      <DatePickerThemeContext.Provider value={resolvedTheme}>
        <DatePickerContext.Provider value={contextValue}>
          <div
            ref={containerRef}
            className={cx(
              getThemeScopeClassName(themeMode),
              resolvedTheme.rootClassName ?? defaultDatePickerAdapterTheme.rootClassName,
            )}
            data-rdp-theme={themeMode}
            style={open ? { zIndex: 'var(--rdp-z-popover, 1000)' } : undefined}
          >
            {children ?? (
              <>
                <DatePickerInput />
                <DatePickerCalendar>
                  <DatePickerCalendarHeader />
                  <DatePickerCalendarGrid />
                </DatePickerCalendar>
              </>
            )}
          </div>
        </DatePickerContext.Provider>
      </DatePickerThemeContext.Provider>
    )
  }

  function DatePickerInput({
    icon,
    iconPosition = 'right',
    iconAriaLabel = 'Open calendar',
    inputClassName = '',
    triggerClassName = '',
    placeholder,
    formatDescription,
  }: DatePickerInputProps) {
    const theme = useDatePickerTheme()
    const {
      open,
      setOpen,
      inputRef,
      formatDescriptionId,
      validationMessageId,
      describedById,
      formatted,
      placeholderText,
      formatDescriptionText,
      validationState,
      validationMessage,
      validationMessageClassName,
    } = useDatePickerContext()

    const resolvedPlaceholder = placeholder ?? placeholderText
    const resolvedFormatDescription = formatDescription ?? formatDescriptionText
    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        setOpen(true)
      }
    }

    return (
      <>
        <div className={theme.inputLayoutClassName ?? defaultDatePickerAdapterTheme.inputLayoutClassName}>
          <div className={theme.inputGroupClassName ?? defaultDatePickerAdapterTheme.inputGroupClassName}>
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
              readOnly
              className={cx(theme.inputClassName, inputClassName)}
              placeholder={resolvedPlaceholder}
              onClick={() => setOpen(current => !current)}
              onKeyDown={handleInputKeyDown}
              value={formatted}
              ref={inputRef}
              aria-haspopup="grid"
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

  function DatePickerCalendar({
    children,
    className = '',
    popoverClassName = '',
  }: DatePickerCalendarProps) {
    const theme = useDatePickerTheme()
    const { open, resolvedI18n, containerRef, popoverRef, portal, portalContainer, onEscape, themeMode } = useDatePickerContext()
    const { isMounted, presenceState } = usePresenceTransition(open, FLUENT_UI_DURATION_MS)
    const {
      floatingStyle,
      isPositioned,
      panelStyle,
    } = useFloatingPopoverPosition({
      open,
      enabled: portal,
      referenceRef: containerRef,
      floatingRef: popoverRef,
    })

    useEffect(() => {
      if (!open) return
      if (portal && !isPositioned) return

      const frame = window.requestAnimationFrame(() => {
        const dialog = popoverRef.current
        if (!dialog) return
        const initialTarget = dialog.querySelector<HTMLElement>('[data-initial-focus="true"]')
          ?? dialog.querySelector<HTMLElement>('[role="grid"]')
          ?? getFocusableElements(dialog)[0]
        initialTarget?.focus()
      })

      return () => window.cancelAnimationFrame(frame)
    }, [open, isPositioned, portal, popoverRef])

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

    const content = (
      <div
        ref={popoverRef}
        className={cx(
          portal ? 'absolute' : 'absolute left-0 top-full mt-2',
          getThemeScopeClassName(themeMode),
          theme.popoverShellClassName,
          popoverClassName,
        )}
        data-rdp-theme={themeMode}
        data-state={presenceState}
        style={portal
          ? {
              ...floatingStyle,
              zIndex: 'var(--rdp-z-popover, 1000)',
              opacity: open && !isPositioned ? 0 : undefined,
              pointerEvents: open && !isPositioned ? 'none' : undefined,
            }
          : { zIndex: 'var(--rdp-z-popover, 1000)' }}
        role="dialog"
        aria-label={resolvedI18n.labels.calendar}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <div className={cx(theme.popoverPanelClassName, className)} data-state={presenceState} style={panelStyle}>
          {children ?? (
            <>
              <DatePickerCalendarHeader />
              <DatePickerCalendarGrid />
            </>
          )}
        </div>
      </div>
    )

    if (portal) {
      const target = portalContainer ?? (typeof document !== 'undefined' ? document.body : null)
      return target ? createPortal(content, target) : null
    }

    return (
      content
    )
  }

  function DatePickerCalendarHeader() {
    const theme = useDatePickerTheme()
    const { cal, resolvedI18n, formatOptions, monthLabelId } = useDatePickerContext()

    return (
      <header className={theme.headerClassName}>
        <div className={theme.headerNavGroupClassName}>
          <button className={theme.headerNavButtonClassName} onClick={cal.prevYear} aria-label={resolvedI18n.labels.prevYear}>
            {theme.icons?.prevYear ?? '«'}
          </button>
          <button className={theme.headerNavButtonClassName} onClick={cal.prev} aria-label={resolvedI18n.labels.prevMonth}>
            {theme.icons?.prevMonth ?? '←'}
          </button>
        </div>
        <div id={monthLabelId} className={theme.monthLabelClassName}>
          {format(cal.currentMonth, resolvedI18n.format.monthLabel, formatOptions)}
        </div>
        <div className={theme.headerNavGroupClassName}>
          <button className={theme.headerNavButtonClassName} onClick={cal.next} aria-label={resolvedI18n.labels.nextMonth}>
            {theme.icons?.nextMonth ?? '→'}
          </button>
          <button className={theme.headerNavButtonClassName} onClick={cal.nextYear} aria-label={resolvedI18n.labels.nextYear}>
            {theme.icons?.nextYear ?? '»'}
          </button>
        </div>
      </header>
    )
  }

  function DatePickerCalendarGrid() {
    const theme = useDatePickerTheme()
    const {
      cal,
      selectedDate,
      selectDate,
      resolvedI18n,
      formatOptions,
      focusDate,
      setFocusDate,
      gridRef,
      monthLabelId,
      onEscape,
      isDateDisabled,
    } = useDatePickerContext()

    const gridDays = useMemo(() => cal.weeks.flat(), [cal.weeks])
    const monthAnimatorRef = useRef<HTMLDivElement>(null)
    const previousMonthRef = useRef(cal.currentMonth)
    const weekdayLabels = useMemo(
      () =>
        (cal.weeks[0] ?? []).map(day =>
          format(day, resolvedI18n.format.weekdayLabel, formatOptions),
        ),
      [cal.weeks, resolvedI18n.format.weekdayLabel, formatOptions],
    )

    const findGridDate = (date: Date) => gridDays.find(d => cal.isSameDay(d, date)) ?? gridDays[0]

    useEffect(() => {
      setFocusDate(previous => findGridDate(previous))
      const focusTarget = findGridDate(focusDate)
      const cell = gridRef.current?.querySelector<HTMLButtonElement>(
        `button[role="gridcell"][data-date="${focusTarget.getTime()}"]`,
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
          onEscape()
          break
        case ' ':
        case 'Enter':
          event.preventDefault()
          if (!isDateDisabled(focusDate)) selectDate(focusDate)
          break
        default:
          break
      }
    }

    return (
      <div
        role="grid"
        tabIndex={0}
        aria-labelledby={monthLabelId}
        onKeyDown={handleKeyDown}
        ref={gridRef}
        data-initial-focus="true"
      >
        <div ref={monthAnimatorRef}>
          <div className={theme.weekdayRowClassName} aria-hidden="true">
            {weekdayLabels.map((label, index) => (
              <div key={index} className={theme.weekdayCellClassName}>
                {label}
              </div>
            ))}
          </div>

          <div className={theme.gridClassName}>
            {cal.weeks.map((week, wi) =>
              week.map((day, di) => {
                const faded = !cal.isSameMonth(day, cal.currentMonth)
                const disabled = isDateDisabled(day)
                const isActive = selectedDate ? cal.isSameDay(day, selectedDate) : false
                const isFocused = cal.isSameDay(day, focusDate)

                return (
                  <button
                    key={wi + '-' + di}
                    role="gridcell"
                    aria-selected={isActive}
                    aria-disabled={disabled}
                    tabIndex={isFocused ? 0 : -1}
                    data-date={day.getTime()}
                    onClick={() => {
                      if (disabled) return
                      selectDate(day)
                    }}
                    className={theme.dayButtonClassName?.({
                      active: isActive,
                      disabled,
                      faded,
                      focused: isFocused,
                    })}
                    aria-label={format(day, resolvedI18n.format.dayAriaLabel, formatOptions)}
                  >
                    {format(day, resolvedI18n.format.dayLabel, formatOptions)}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      </div>
    )
  }

  const DatePicker = DatePickerRoot as DatePickerCompoundComponent<TRootProps>
  DatePicker.Input = DatePickerInput
  DatePicker.Calendar = DatePickerCalendar
  DatePicker.CalendarHeader = DatePickerCalendarHeader
  DatePicker.CalendarGrid = DatePickerCalendarGrid

  return DatePicker
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
