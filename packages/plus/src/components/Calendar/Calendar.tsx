import CoreCalendar, {
  type CalendarDaySlotState,
  type CalendarProps as CoreCalendarProps,
  type CalendarSkin,
  type CalendarTheme,
} from '@core/components/Calendar'
import type { ThemeMode } from '../../theming'

export type CalendarProps = Omit<CoreCalendarProps, 'theme' | 'skin'> & {
  theme?: ThemeMode
  skin?: CalendarSkin
}

export type { CalendarDaySlotState, CalendarSkin, CalendarTheme }

const Calendar = (props: CalendarProps) => <CoreCalendar {...props} />

export default Calendar
