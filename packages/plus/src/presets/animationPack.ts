import type { CalendarSkin } from '@core/components/Calendar'
import type {
  DatePickerDaySlotState,
  DatePickerSkin,
} from '@core/components/DatePicker/createDatePicker'
import type { DateRangePickerSkin } from '../components/DateRangePicker'
import type { RangeCalendarSkin } from '../components/RangeCalendar'
import type {
  DateRangePickerDaySlotState,
  DateRangePickerTimeWheelState,
} from '../components/DateRangePicker'
import type { RangeCalendarDaySlotState } from '../components/RangeCalendar'

const fluentDuration = 'motion-safe:duration-[220ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]'
const fluentTransition =
  `motion-safe:transform-gpu motion-safe:transition-[transform,box-shadow,background-color,border-color,color,opacity] ${fluentDuration}`
const fluentPress =
  `${fluentTransition} motion-safe:hover:-translate-y-px motion-safe:hover:shadow-sm motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]`
const fluentPopoverShell =
  `motion-safe:origin-top motion-safe:transition-[opacity,transform] ${fluentDuration} motion-safe:data-[state=closed]:pointer-events-none motion-safe:data-[state=closed]:translate-y-2 motion-safe:data-[state=closed]:opacity-0 motion-safe:data-[state=open]:translate-y-0 motion-safe:data-[state=open]:opacity-100`
const fluentPopoverPanel =
  `motion-safe:origin-top motion-safe:transition-[opacity,transform,box-shadow,filter] ${fluentDuration} motion-safe:data-[state=closed]:scale-[0.97] motion-safe:data-[state=closed]:opacity-0 motion-safe:data-[state=closed]:shadow-sm motion-safe:data-[state=open]:scale-100 motion-safe:data-[state=open]:opacity-100`
const fluentModalBackdrop =
  `motion-safe:transition-opacity ${fluentDuration} motion-safe:data-[state=closed]:opacity-0 motion-safe:data-[state=open]:opacity-100`
const fluentSheet =
  `motion-safe:origin-bottom motion-safe:transition-[opacity,transform,box-shadow] ${fluentDuration} motion-safe:data-[state=closed]:translate-y-6 motion-safe:data-[state=closed]:scale-[0.985] motion-safe:data-[state=closed]:opacity-0 motion-safe:data-[state=open]:translate-y-0 motion-safe:data-[state=open]:scale-100 motion-safe:data-[state=open]:opacity-100`

export type FluentAnimationPack = {
  calendar: CalendarSkin
  datePicker: DatePickerSkin
  rangeCalendar: RangeCalendarSkin
  dateRangePicker: DateRangePickerSkin
}

export const fluentAnimationPack: FluentAnimationPack = {
  calendar: {
    __mergeClassSlots: true,
    containerClassName: 'motion-safe:will-change-transform',
    headerNavButtonClassName: fluentPress,
    dayButtonClassName: ({ active, faded }) =>
      [
        !faded ? fluentPress : `${fluentTransition} motion-safe:active:scale-[0.98]`,
        active ? 'motion-safe:shadow-sm' : '',
      ]
        .filter(Boolean)
        .join(' '),
  },
  datePicker: {
    __mergeClassSlots: true,
    inputClassName:
      'motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]',
    triggerClassName: fluentPress,
    popoverShellClassName: fluentPopoverShell,
    popoverPanelClassName: fluentPopoverPanel,
    headerNavButtonClassName: fluentPress,
    dayButtonClassName: ({ active, disabled, faded }: DatePickerDaySlotState) =>
      [
        disabled ? 'motion-safe:transition-none' : !faded ? fluentPress : `${fluentTransition} motion-safe:active:scale-[0.98]`,
        active ? 'motion-safe:shadow-sm' : '',
      ]
        .filter(Boolean)
        .join(' '),
  },
  rangeCalendar: {
    __mergeClassSlots: true,
    containerClassName: 'motion-safe:will-change-transform',
    headerNavButtonClassName: fluentPress,
    presetButtonClassName: active => `${fluentPress} ${active ? 'motion-safe:shadow-sm' : ''}`.trim(),
    monthsViewportClassName: 'motion-safe:will-change-transform',
    monthPanelClassName:
      'motion-safe:transition-[transform,box-shadow,background-color,border-color] motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]',
    dayButtonClassName: ({ rangeEdge, faded }: RangeCalendarDaySlotState) =>
      [
        !faded ? fluentPress : `${fluentTransition} motion-safe:active:scale-[0.98]`,
        rangeEdge ? 'motion-safe:shadow-sm' : '',
      ]
        .filter(Boolean)
        .join(' '),
  },
  dateRangePicker: {
    __mergeClassSlots: true,
    inputClassName:
      'motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]',
    triggerClassName: fluentPress,
    mobileBackdropClassName: `${fluentModalBackdrop} motion-safe:data-[state=closed]:pointer-events-none`,
    mobileSheetClassName: fluentSheet,
    desktopPopoverShellClassName: fluentPopoverShell,
    desktopPopoverPanelClassName: fluentPopoverPanel,
    headerNavButtonClassName: fluentPress,
    timeWheelOptionClassName: ({ disabled, selected }: DateRangePickerTimeWheelState) =>
      [
        disabled ? 'motion-safe:transition-none' : fluentPress,
        selected ? 'motion-safe:shadow-sm' : '',
      ]
        .filter(Boolean)
        .join(' '),
    presetButtonClassName: active => `${fluentPress} ${active ? 'motion-safe:shadow-sm' : ''}`.trim(),
    monthsViewportClassName: 'motion-safe:will-change-transform',
    monthPanelClassName:
      'motion-safe:transition-[transform,box-shadow,background-color,border-color] motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]',
    dayButtonClassName: ({ rangeEdge, faded }: DateRangePickerDaySlotState) =>
      [
        !faded ? fluentPress : `${fluentTransition} motion-safe:active:scale-[0.98]`,
        rangeEdge ? 'motion-safe:shadow-sm' : '',
      ]
        .filter(Boolean)
        .join(' '),
    cancelButtonClassName: fluentPress,
    confirmButtonClassName: `${fluentPress} motion-safe:hover:brightness-[1.02]`,
  },
}
