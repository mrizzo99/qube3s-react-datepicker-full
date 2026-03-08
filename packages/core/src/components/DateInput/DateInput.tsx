
import React, { useEffect, useMemo, useRef, useState, useId } from 'react'
import { createPortal } from 'react-dom'
import Calendar from '../Calendar'
import { format } from 'date-fns'
import { resolveCalendarI18n, type CalendarI18n } from '../../i18n'

export type DateInputProps = {
  value?: Date | null
  onChange?: (date: Date) => void
  placeholder?: string
  formatDescription?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  iconAriaLabel?: string
  inputClassName?: string
  triggerClassName?: string
  i18n?: CalendarI18n
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

export default function DateInput({
  value,
  onChange,
  placeholder,
  formatDescription,
  icon,
  iconPosition = 'right',
  iconAriaLabel = 'Open calendar',
  inputClassName = '',
  triggerClassName = '',
  i18n
}: DateInputProps) {
  const POPOVER_WIDTH = 288
  const POPOVER_GUTTER = 8
  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale]
  )
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<Date | null>(value ?? null)
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // unique ID for the hidden date format hint; avoids collisions across instances
  const describedById = useId()

  useEffect(() => {
    if (value !== undefined) setInternalDate(value ?? null)
  }, [value])

  const selectedDate = value ?? internalDate

  const formatted = useMemo(
    () =>
      selectedDate
        ? format(selectedDate, resolvedI18n.format.inputValue, formatOptions)
        : '',
    [selectedDate, resolvedI18n.format.inputValue, formatOptions]
  )
  const placeholderText = placeholder ?? resolvedI18n.labels.selectDatePlaceholder
  const formatDescriptionText = formatDescription ?? resolvedI18n.labels.formatDescription

  const handleSelectDate = (date: Date) => {
    if (value === undefined) setInternalDate(date)
    onChange?.(date)
    setOpen(false)
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const anchor = containerRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const maxLeft = Math.max(POPOVER_GUTTER, window.innerWidth - POPOVER_WIDTH - POPOVER_GUTTER)
      setPopoverPosition({
        top: rect.bottom + POPOVER_GUTTER,
        left: Math.min(Math.max(POPOVER_GUTTER, rect.left), maxLeft)
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  return (
    <div ref={containerRef} className="inline-flex items-center gap-1">
      {iconPosition === 'left' && (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={iconAriaLabel}
          className={`inline-flex items-center justify-center p-2 border border-gray-300 rounded hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white ${triggerClassName}`}
        >
          {icon ?? <DefaultCalendarIcon />}
        </button>
      )}
      <input
        readOnly
        className={`w-48 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
        placeholder={placeholderText}
        onClick={() => setOpen(o => !o)}
        value={formatted}
        ref={inputRef}
        aria-haspopup="grid"
        aria-expanded={open}
        aria-describedby={describedById}
      />
      {iconPosition === 'right' && (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={iconAriaLabel}
          className={`inline-flex items-center justify-center p-2 border border-gray-300 rounded hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white ${triggerClassName}`}
        >
          {icon ?? <DefaultCalendarIcon />}
        </button>
      )}
      <span id={describedById} style={visuallyHidden}>
        {formatDescriptionText}
      </span>
      {open && popoverPosition && typeof document !== 'undefined' && createPortal(
        <div
          className="rounded bg-white shadow"
          style={{
            position: 'fixed',
            top: popoverPosition.top,
            left: popoverPosition.left,
            zIndex: 'var(--rdp-z-popover, 1000)'
          }}
          role="dialog"
          aria-label={resolvedI18n.labels.calendar}
        >
          <Calendar
            selectedDate={selectedDate}
            selectDate={handleSelectDate}
            i18n={i18n}
            onEscape={() => {
              setOpen(false)
              inputRef.current?.focus()
            }}
          />
        </div>,
        document.body
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
      className="h-4 w-4 text-gray-600"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
