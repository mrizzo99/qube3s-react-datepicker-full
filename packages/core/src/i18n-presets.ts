import { enUS, fr, es } from 'date-fns/locale'
import type { CalendarI18n } from './i18n'

export const enUSI18n: CalendarI18n = {
  locale: enUS,
  weekStartsOn: 0,
  labels: {
    prevYear: 'Previous year',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    nextYear: 'Next year',
    calendar: 'Calendar',
    rangeCalendar: 'Range calendar',
    selectDatePlaceholder: 'Select date',
    startDatePlaceholder: 'Start date',
    endDatePlaceholder: 'End date',
    formatDescription: 'Date format: MM/DD/YYYY'
  }
}

export const frI18n: CalendarI18n = {
  locale: fr,
  weekStartsOn: 1,
  labels: {
    prevYear: 'Annee precedente',
    prevMonth: 'Mois precedent',
    nextMonth: 'Mois suivant',
    nextYear: 'Annee suivante',
    calendar: 'Calendrier',
    rangeCalendar: 'Calendrier des plages',
    selectDatePlaceholder: 'Choisir une date',
    startDatePlaceholder: 'Date de debut',
    endDatePlaceholder: 'Date de fin',
    formatDescription: 'Format de date : JJ/MM/AAAA'
  }
}

export const esI18n: CalendarI18n = {
  locale: es,
  weekStartsOn: 1,
  labels: {
    prevYear: 'Ano anterior',
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    nextYear: 'Ano siguiente',
    calendar: 'Calendario',
    rangeCalendar: 'Calendario de rangos',
    selectDatePlaceholder: 'Seleccionar fecha',
    startDatePlaceholder: 'Fecha de inicio',
    endDatePlaceholder: 'Fecha de fin',
    formatDescription: 'Formato de fecha: DD/MM/AAAA'
  }
}
