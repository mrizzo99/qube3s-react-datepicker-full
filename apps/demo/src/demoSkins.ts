import type { CalendarSkin } from '@plus/components/Calendar'

export type SkinPresetKey = 'default' | 'sunrise' | 'midnight'

export type DemoCalendarSkinPreset = {
  label: string
  description: string
  skin?: CalendarSkin
}

export const calendarSkinPresets: Record<SkinPresetKey, DemoCalendarSkinPreset> = {
  default: {
    label: 'Default',
    description: 'Stock calendar styling with the default rounded panel and blue active day.',
  },
  sunrise: {
    label: 'Sunrise',
    description: 'A warm editorial skin with amber accents and softer day states.',
    skin: {
      containerClassName:
        'w-72 rounded-[28px] border border-amber-200 bg-gradient-to-b from-amber-50 via-orange-50 to-white p-5 text-amber-950 shadow-[0_24px_60px_rgba(251,191,36,0.18)]',
      headerClassName: 'mb-3 flex items-center justify-between',
      headerNavGroupClassName: 'flex gap-1.5',
      headerNavButtonClassName:
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-white/80 text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
      monthLabelClassName: 'text-sm font-semibold uppercase tracking-[0.18em] text-amber-900',
      weekdayRowClassName: 'mb-2 grid grid-cols-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700',
      weekdayCellClassName: 'text-center',
      gridClassName: 'grid grid-cols-7 gap-1.5',
      dayButtonClassName: ({ active, faded, focused }) =>
        [
          'rounded-full border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
          active ? 'border-amber-500 bg-amber-500 text-white shadow-sm' : '',
          !active ? 'hover:border-amber-300 hover:bg-amber-100/80' : '',
          faded ? 'text-amber-300' : 'text-amber-950',
          focused && !active ? 'bg-white ring-1 ring-amber-300' : '',
        ]
          .filter(Boolean)
          .join(' '),
    },
  },
  midnight: {
    label: 'Midnight',
    description: 'A tighter high-contrast skin with indigo edges and stronger focus treatment.',
    skin: {
      containerClassName:
        'w-72 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100 shadow-[0_24px_64px_rgba(15,23,42,0.55)]',
      headerClassName: 'mb-3 flex items-center justify-between',
      headerNavGroupClassName: 'flex gap-1',
      headerNavButtonClassName:
        'inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:border-indigo-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
      monthLabelClassName: 'text-sm font-semibold text-slate-50',
      weekdayRowClassName: 'mb-2 grid grid-cols-7 text-xs text-slate-500',
      weekdayCellClassName: 'text-center',
      gridClassName: 'grid grid-cols-7 gap-1',
      dayButtonClassName: ({ active, faded, focused }) =>
        [
          'rounded-md border border-transparent p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
          active ? 'border-indigo-500 bg-indigo-500 text-white' : '',
          !active ? 'hover:border-slate-600 hover:bg-slate-900' : '',
          faded ? 'text-slate-700' : 'text-slate-100',
          focused && !active ? 'border-slate-600 bg-slate-900' : '',
        ]
          .filter(Boolean)
          .join(' '),
    },
  },
}
