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
    formatDescription: 'Date format: MM/DD/YYYY',
    presetsTitle: 'Quick ranges',
    presetToday: 'Today',
    presetLast7Days: 'Last 7 days',
    presetLast30Days: 'Last 30 days',
    presetThisQuarter: 'This Quarter',
    presetYearToDate: 'Year to Date'
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
    formatDescription: 'Format de date : JJ/MM/AAAA',
    presetsTitle: 'Plages rapides',
    presetToday: "Aujourd'hui",
    presetLast7Days: '7 derniers jours',
    presetLast30Days: '30 derniers jours',
    presetThisQuarter: 'Ce trimestre',
    presetYearToDate: "Depuis le debut de l'annee"
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
    formatDescription: 'Formato de fecha: DD/MM/AAAA',
    presetsTitle: 'Rangos rapidos',
    presetToday: 'Hoy',
    presetLast7Days: 'Ultimos 7 dias',
    presetLast30Days: 'Ultimos 30 dias',
    presetThisQuarter: 'Este trimestre',
    presetYearToDate: 'Ano hasta la fecha'
  }
}
