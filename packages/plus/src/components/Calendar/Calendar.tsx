import {
  createCalendar,
  type CalendarDaySlotState,
  type CalendarProps as CoreCalendarProps,
  type CalendarSkin,
  type CalendarStylingProps,
  type CalendarTheme,
} from '@qube3s/react-datepicker-core/components/Calendar/Calendar'

export type CalendarProps = CoreCalendarProps & CalendarStylingProps

export type { CalendarDaySlotState, CalendarSkin, CalendarTheme }

const PlusCalendarBase = createCalendar()

const Calendar = (props: CalendarProps) => <PlusCalendarBase {...props} />

export default Calendar
