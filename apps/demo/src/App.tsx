import { useState, type ReactNode } from 'react'
import { addDays, format, subDays } from 'date-fns'
import Calendar from '@qube3s/react-datepicker-core/components/Calendar'
import DatePicker from '@qube3s/react-datepicker-core/components/DatePicker'
import { esI18n } from '@qube3s/react-datepicker-core/i18n-presets'
import { shadcn } from '@qube3s/react-datepicker-plus/adapters'
import CalendarPlus from '@qube3s/react-datepicker-plus/components/Calendar'
import DatePickerPlus from '@qube3s/react-datepicker-plus/components/DatePicker'
import DateRangePicker from '@qube3s/react-datepicker-plus/components/DateRangePicker'
import RangeCalendar from '@qube3s/react-datepicker-plus/components/RangeCalendar'
import { fluentAnimationPack } from '@qube3s/react-datepicker-plus/presets/animationPack'
import type { ThemeMode } from '@qube3s/react-datepicker-plus/theming'
import { calendarSkinPresets, type SkinPresetKey } from './demoSkins'
import qube3sCubePng from '../public/brand/qube3s-cube.png'
import qube3sLogoPng from '../public/brand/qube3s-logo.png'

const panelClass =
  'relative z-0 rounded-2xl border border-[var(--q3-border)] bg-[color:rgb(17_24_39_/_0.82)] p-5 shadow-[0_12px_32px_rgba(2,6,23,0.32)] backdrop-blur focus-within:z-20'
const shadcnSurfaceClass =
  'rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.08)]'
const tabButtonClass =
  'inline-flex min-w-[10rem] items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition'
const adapterButtonClass =
  'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition'
const controlButtonClass = (active: boolean) =>
  [
    'rounded-full border px-3 py-1.5 text-sm transition-colors',
    active
      ? 'border-[var(--q3-primary-soft)] bg-[color:rgb(76_95_213_/_0.18)] text-[var(--q3-text-primary)]'
      : 'border-[var(--q3-border)] text-[var(--q3-text-disabled)] hover:border-[var(--q3-primary-soft)] hover:text-[var(--q3-text-primary)]',
  ].join(' ')

type DemoTabId = 'core' | 'plus'
type AdapterShowcaseId = 'shadcn'
type DemoRange = { start: Date | null; end: Date | null }
type NavItem = { id: string; label: string; detail: string }
type AdapterShowcase = {
  id: AdapterShowcaseId
  label: string
  status: string
  description: string
  highlights: string[]
}

const coreNavItems: NavItem[] = [
  { id: 'single-inline', label: 'Inline Calendar', detail: 'Core visual calendar' },
  { id: 'single-popover', label: 'Popover Picker', detail: 'Compound DatePicker' },
  { id: 'single-es', label: 'ES Locale Picker', detail: 'Core i18n preset' },
  { id: 'core-appearance', label: 'Light + Dark', detail: 'Default core appearance modes' }
]

const plusNavItems: NavItem[] = [
  { id: 'single-plus-constraints', label: 'Constrained Date', detail: 'Single-date business rules' },
  { id: 'single-plus-async-validation', label: 'Async Validation', detail: 'Server-backed date validation' },
  { id: 'stock-theme-playground', label: 'Theme Presets', detail: 'Built-in premium themes' },
  { id: 'stock-skin-playground', label: 'Skin Presets', detail: 'Slot-level visual overrides' },
  { id: 'fluent-animation-pack', label: 'Fluent Motion', detail: 'Animation pack showcase' },
  { id: 'range-inline-2', label: 'Inline Range 2-Month', detail: 'RangeCalendar baseline' },
  { id: 'range-inline-3', label: 'Inline Range 3-Month', detail: 'Expanded range view' },
  { id: 'range-popover-default', label: 'Default Range Picker', detail: 'Base compound range picker' },
  { id: 'range-popover-presets', label: 'Presets', detail: 'Quick-select ranges' },
  { id: 'range-async-validation', label: 'Range Async Validation', detail: 'Server-gated completed ranges' },
  { id: 'range-mobile-sheet', label: 'Mobile Sheet', detail: 'Forced mobile presentation' },
  { id: 'range-popover-2', label: 'Range Picker 2-Month', detail: 'Two visible months' },
  { id: 'range-popover-3', label: 'Range Picker 3-Month', detail: 'Three visible months' },
  { id: 'range-es', label: 'ES Locale Range', detail: 'Localized range picker' },
  { id: 'range-datetime-12h', label: 'Date + Time 12h', detail: 'Range with time wheels' },
  { id: 'range-datetime-24h', label: 'Date + Time 24h', detail: '24-hour time workflow' },
  { id: 'adapter-surfaces', label: 'Adapters', detail: 'Focus by adapter' }
]

const adapterShowcases: AdapterShowcase[] = [
  {
    id: 'shadcn',
    label: 'ShadCN',
    status: 'Available',
    description:
      'A complete adapter pass for the current surface area: base calendar, constrained single-date picker, inline range calendar, and range picker.',
    highlights: ['Calendar', 'DatePicker', 'RangeCalendar', 'DateRangePicker']
  }
]

const stockThemeOptions: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Default Light' },
  { value: 'dark', label: 'Default Dark' },
  { value: 'material-light', label: 'Material Light' },
  { value: 'material-dark', label: 'Material Dark' },
  { value: 'modern-minimal-light', label: 'Modern Minimal Light' },
  { value: 'modern-minimal-dark', label: 'Modern Minimal Dark' },
  { value: 'booking-light', label: 'Booking Light' },
  { value: 'booking-dark', label: 'Booking Dark' },
]

function OfferingTabs({
  activeTab,
  onChange
}: {
  activeTab: DemoTabId
  onChange: (tab: DemoTabId) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Demo offerings"
      className="inline-flex flex-wrap gap-2 rounded-2xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.6)] p-2"
    >
      <button
        id="core-tab"
        role="tab"
        type="button"
        aria-selected={activeTab === 'core'}
        aria-controls="core-panel"
        className={`${tabButtonClass} ${
          activeTab === 'core'
            ? 'border-[var(--q3-primary)] bg-[var(--q3-primary)] text-white shadow-[0_12px_28px_rgba(76,95,213,0.3)]'
            : 'border-[var(--q3-border)] bg-transparent text-[var(--q3-text-primary)] hover:border-[var(--q3-primary-soft)] hover:bg-[color:rgb(76_95_213_/_0.12)]'
        }`}
        onClick={() => onChange('core')}
      >
        Core
      </button>
      <button
        id="plus-tab"
        role="tab"
        type="button"
        aria-selected={activeTab === 'plus'}
        aria-controls="plus-panel"
        className={`${tabButtonClass} ${
          activeTab === 'plus'
            ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-[0_12px_28px_rgba(34,211,238,0.24)]'
            : 'border-[var(--q3-border)] bg-transparent text-[var(--q3-text-primary)] hover:border-cyan-400/70 hover:bg-[color:rgb(34_211_238_/_0.1)]'
        }`}
        onClick={() => onChange('plus')}
      >
        Plus
      </button>
    </div>
  )
}

function SectionCard({
  id,
  title,
  description,
  children,
  className = panelClass
}: {
  id: string
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={className}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mb-3 mt-1 text-sm text-[var(--q3-text-disabled)]">{description}</p>
      {children}
    </section>
  )
}

function SectionGroup({
  eyebrow,
  title,
  description,
  children,
  tone = 'default'
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  tone?: 'default' | 'plus'
}) {
  const headerClassName =
    tone === 'plus'
      ? 'rounded-2xl border border-cyan-400/35 bg-[linear-gradient(140deg,rgba(34,211,238,0.18),rgba(15,23,42,0.62))] p-5'
      : 'rounded-2xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.45)] p-5'

  return (
    <section className="space-y-5">
      <div className={headerClassName}>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--q3-text-disabled)]">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--q3-text-primary)]">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--q3-text-disabled)]">{description}</p>
      </div>
      {children}
    </section>
  )
}

function SummaryCard({
  title,
  badge,
  description,
  highlights,
  tone
}: {
  title: string
  badge: string
  description: string
  highlights: string[]
  tone: 'core' | 'plus'
}) {
  const toneClass =
    tone === 'core'
      ? 'border-[color:rgb(76_95_213_/_0.45)] bg-[linear-gradient(140deg,rgba(76,95,213,0.18),rgba(15,23,42,0.62))]'
      : 'border-cyan-400/35 bg-[linear-gradient(140deg,rgba(34,211,238,0.18),rgba(15,23,42,0.62))]'

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--q3-text-disabled)]">{badge}</p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--q3-text-primary)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--q3-text-disabled)]">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {highlights.map(highlight => (
          <span
            key={highlight}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--q3-text-primary)]"
          >
            {highlight}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<DemoTabId>('core')
  const [activeAdapterShowcase, setActiveAdapterShowcase] =
    useState<AdapterShowcaseId>('shadcn')
  const [inlineSelectedDate, setInlineSelectedDate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateEs, setSelectedDateEs] = useState<Date | null>(null)
  const [coreLightCalendarDate, setCoreLightCalendarDate] = useState<Date | null>(null)
  const [coreDarkCalendarDate, setCoreDarkCalendarDate] = useState<Date | null>(null)
  const [coreLightPickerDate, setCoreLightPickerDate] = useState<Date | null>(null)
  const [coreDarkPickerDate, setCoreDarkPickerDate] = useState<Date | null>(null)
  const [plusSelectedDate, setPlusSelectedDate] = useState<Date | null>(null)
  const [asyncSelectedDate, setAsyncSelectedDate] = useState<Date | null>(null)
  const [themeDemoMode, setThemeDemoMode] = useState<ThemeMode>('light')
  const [themeDemoDate, setThemeDemoDate] = useState<Date | null>(null)
  const [themeDemoRange, setThemeDemoRange] = useState<DemoRange>({ start: null, end: null })
  const [skinPreset, setSkinPreset] = useState<SkinPresetKey>('default')
  const [skinDemoDate, setSkinDemoDate] = useState<Date | null>(null)
  const [fluentCalendarDate, setFluentCalendarDate] = useState<Date | null>(null)
  const [fluentDatePickerDate, setFluentDatePickerDate] = useState<Date | null>(null)
  const [fluentRange, setFluentRange] = useState<DemoRange>({ start: null, end: null })
  const [fluentRangePicker, setFluentRangePicker] = useState<DemoRange>({ start: null, end: null })
  const [range, setRange] = useState<DemoRange>({ start: null, end: null })
  const [rangeThree, setRangeThree] = useState<DemoRange>({ start: null, end: null })
  const [rangeInput, setRangeInput] = useState<DemoRange>({ start: null, end: null })
  const [rangeInputDefault, setRangeInputDefault] = useState<DemoRange>({ start: null, end: null })
  const [rangeInputPresets, setRangeInputPresets] = useState<DemoRange>({ start: null, end: null })
  const [rangeInputAsync, setRangeInputAsync] = useState<DemoRange>({ start: null, end: null })
  const [rangeInputMobileSheet, setRangeInputMobileSheet] = useState<DemoRange>({
    start: null,
    end: null
  })
  const [rangeInputThree, setRangeInputThree] = useState<DemoRange>({ start: null, end: null })
  const [rangeInputEs, setRangeInputEs] = useState<DemoRange>({ start: null, end: null })
  const [rangeInputDateTime12h, setRangeInputDateTime12h] = useState<DemoRange>({
    start: null,
    end: null
  })
  const [rangeInputDateTime24h, setRangeInputDateTime24h] = useState<DemoRange>({
    start: null,
    end: null
  })
  const [shadcnSelectedDate, setShadcnSelectedDate] = useState<Date | null>(null)
  const [shadcnInlineDate, setShadcnInlineDate] = useState<Date | null>(null)
  const [shadcnRange, setShadcnRange] = useState<DemoRange>({ start: null, end: null })
  const [shadcnInlineRange, setShadcnInlineRange] = useState<DemoRange>({ start: null, end: null })

  const today = new Date()
  const activeCalendarSkin = calendarSkinPresets[skinPreset]
  const plusMinDate = subDays(today, 7)
  const plusMaxDate = addDays(today, 10)
  const activeNavItems = activeTab === 'core' ? coreNavItems : plusNavItems
  const activeAdapterMeta =
    adapterShowcases.find(showcase => showcase.id === activeAdapterShowcase) ??
    adapterShowcases[0]
  const activeSummary =
    activeTab === 'core'
      ? {
          title: 'Core primitives',
          description:
            'Core is the base layer: the single-date calendar, the composable popover picker, and the i18n-ready foundation that Plus builds on.'
        }
      : {
          title: 'Plus workflows',
          description:
            'Plus adds opinionated product features: constraints, named themes, skins, motion presets, range selection, time selection, mobile sheet behavior, and adapter surfaces.'
        }

  const validateDemoDateAsync = async (date: Date) => {
    await new Promise(resolve => window.setTimeout(resolve, 700))
    if (date.getDay() === 0) {
      return { valid: false as const, message: 'Demo server rejects Sundays.' }
    }
    return { valid: true as const }
  }

  const validateDemoRangeAsync = async (nextRange: DemoRange) => {
    await new Promise(resolve => window.setTimeout(resolve, 700))
    if (!nextRange.start || !nextRange.end) return { valid: true as const }
    const lengthInDays =
      Math.round((nextRange.end.getTime() - nextRange.start.getTime()) / 86400000) + 1
    if (lengthInDays > 5) {
      return {
        valid: false as const,
        message: 'Demo server rejects ranges longer than 5 days.'
      }
    }
    return { valid: true as const }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#16213d_0%,#0b1220_42%,#08101b_100%)] text-[var(--q3-text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.92)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={qube3sLogoPng} alt="Qube3s" className="h-12 w-auto object-contain" />
            <span className="hidden rounded-full border border-[var(--q3-primary-soft)] px-2 py-0.5 text-xs text-[var(--q3-primary-soft)] sm:inline">
              Demo Console
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-md border border-[var(--q3-border)] px-3 py-1.5 text-sm text-[var(--q3-text-primary)] hover:border-[var(--q3-primary-soft)]">
              Docs
            </button>
            <button className="rounded-md bg-[var(--q3-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--q3-primary-hover)]">
              Try Components
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-screen-2xl">
        <aside className="hidden w-80 shrink-0 border-r border-[var(--q3-border)] bg-[color:rgb(10_16_29_/_0.72)] md:block">
          <div className="sticky top-16 p-5">
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.4)] px-3 py-3">
              <img src={qube3sCubePng} alt="Qube3s cube" className="h-10 w-10 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-medium text-[var(--q3-text-primary)]">Qube3s</p>
                <p className="text-xs text-[var(--q3-text-disabled)]">Component Lab</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.45)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--q3-text-disabled)]">Offering</p>
              <div className="mt-3">
                <OfferingTabs activeTab={activeTab} onChange={setActiveTab} />
              </div>
              <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">{activeSummary.description}</p>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--q3-text-disabled)]">Navigation</p>
              <nav className="mt-3 space-y-2">
                {activeNavItems.map(item => (
                  <a
                    key={item.id}
                    className="block rounded-xl border border-transparent bg-[color:rgb(255_255_255_/_0.02)] px-3 py-3 text-sm text-[var(--q3-text-primary)] transition hover:border-[var(--q3-border)] hover:bg-[color:rgb(76_95_213_/_0.1)]"
                    href={`#${item.id}`}
                  >
                    <span className="block font-medium">{item.label}</span>
                    <span className="mt-1 block text-xs text-[var(--q3-text-disabled)]">{item.detail}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <main className="w-full p-4 sm:p-6 lg:p-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--q3-border)] bg-[linear-gradient(135deg,rgba(76,95,213,0.18),rgba(17,24,39,0.82),rgba(34,211,238,0.12))] p-6 sm:p-8">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.2),transparent_55%)]" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--q3-primary-soft)]">
                Product Showcase
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Demo the base system and the premium layer as separate products.
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-[var(--q3-text-disabled)] sm:text-base">
                The demo now splits the story into Core and Plus so the foundation stays legible while the advanced workflows still have room to breathe.
              </p>

              <div className="mt-6 md:hidden">
                <OfferingTabs activeTab={activeTab} onChange={setActiveTab} />
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <SummaryCard
                  title="Core"
                  badge="Foundation"
                  description="Single-date primitives for teams that want a clean base calendar and a composable picker without the opinionated range and validation layer."
                  highlights={['Calendar', 'DatePicker', 'i18n presets']}
                  tone="core"
                />
                <SummaryCard
                  title="Plus"
                  badge="Advanced"
                  description="Product-ready workflows for constrained booking, named themes, slot-level skins, fluent motion, multi-month range selection, time-aware ranges, mobile sheet mode, and design-system adapters."
                  highlights={['Themes + skins', 'Motion + range', 'Adapters']}
                  tone="plus"
                />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.45)] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--q3-text-disabled)]">
              Active View
            </p>
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{activeSummary.title}</h2>
                <p className="mt-2 max-w-3xl text-sm text-[var(--q3-text-disabled)]">
                  {activeSummary.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:hidden">
                {activeNavItems.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="rounded-full border border-[var(--q3-border)] px-3 py-1.5 text-xs text-[var(--q3-text-primary)]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {activeTab === 'core' ? (
            <div
              id="core-panel"
              role="tabpanel"
              aria-labelledby="core-tab"
              className="mt-6 space-y-6"
            >
              <SectionGroup
                eyebrow="Core"
                title="Single-date building blocks"
                description="This tab is intentionally limited to the single-date foundation. It shows the inline calendar surface, the composable popover picker, and localization support without introducing Plus-only features."
              >
                <div className="grid gap-5 xl:grid-cols-2">
                  <SectionCard
                    id="single-inline"
                    title="Single date selection (inline)"
                    description="Calendar component"
                  >
                    <Calendar
                      selectedDate={inlineSelectedDate}
                      selectDate={setInlineSelectedDate}
                    />
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {inlineSelectedDate
                        ? `Selected: ${format(inlineSelectedDate, 'PPP')}`
                        : 'Choose a date'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="single-popover"
                    title="Single date (popover)"
                    description="DatePicker compound API"
                  >
                    <DatePicker value={selectedDate} onChange={setSelectedDate}>
                      <DatePicker.Input />
                      <DatePicker.Calendar>
                        <DatePicker.CalendarHeader />
                        <DatePicker.CalendarGrid />
                      </DatePicker.Calendar>
                    </DatePicker>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {selectedDate ? `Selected: ${format(selectedDate, 'PPP')}` : 'Choose a date'}
                    </p>
                  </SectionCard>
                </div>

                <SectionCard
                  id="single-es"
                  title="Single date (popover, es locale)"
                  description="DatePicker + esI18n preset"
                >
                  <DatePicker
                    value={selectedDateEs}
                    onChange={setSelectedDateEs}
                    i18n={esI18n}
                  >
                    <DatePicker.Input />
                    <DatePicker.Calendar>
                      <DatePicker.CalendarHeader />
                      <DatePicker.CalendarGrid />
                    </DatePicker.Calendar>
                  </DatePicker>
                  <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                    {selectedDateEs
                      ? `Selected: ${format(selectedDateEs, 'PPP', { locale: esI18n.locale })}`
                      : 'Choose a date'}
                  </p>
                </SectionCard>
              </SectionGroup>

              <SectionGroup
                eyebrow="Core"
                title="Default light and dark appearance"
                description="Core keeps the base styling story simple: Calendar and DatePicker now expose an explicit appearance prop for light and dark mode without exposing Plus theme presets or slot-level skin APIs."
              >
                <SectionCard
                  id="core-appearance"
                  title="Light and dark styling"
                  description="The same Core components rendered with explicit light and dark appearance props."
                >
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900">
                      <p className="mb-3 text-sm font-medium text-slate-700">Light appearance</p>
                      <Calendar
                        appearance="light"
                        selectedDate={coreLightCalendarDate}
                        selectDate={setCoreLightCalendarDate}
                      />
                      <div className="mt-4">
                        <DatePicker
                          appearance="light"
                          value={coreLightPickerDate}
                          onChange={setCoreLightPickerDate}
                          portal={false}
                        >
                          <DatePicker.Input />
                          <DatePicker.Calendar>
                            <DatePicker.CalendarHeader />
                            <DatePicker.CalendarGrid />
                          </DatePicker.Calendar>
                        </DatePicker>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100">
                      <p className="mb-3 text-sm font-medium text-slate-300">Dark appearance</p>
                      <Calendar
                        appearance="dark"
                        selectedDate={coreDarkCalendarDate}
                        selectDate={setCoreDarkCalendarDate}
                      />
                      <div className="mt-4">
                        <DatePicker
                          appearance="dark"
                          value={coreDarkPickerDate}
                          onChange={setCoreDarkPickerDate}
                          portal={false}
                        >
                          <DatePicker.Input />
                          <DatePicker.Calendar>
                            <DatePicker.CalendarHeader />
                            <DatePicker.CalendarGrid />
                          </DatePicker.Calendar>
                        </DatePicker>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </SectionGroup>

            </div>
          ) : (
            <div
              id="plus-panel"
              role="tabpanel"
              aria-labelledby="plus-tab"
              className="mt-6 space-y-6"
            >
              <SectionGroup
                eyebrow="Plus"
                title="Single-date upgrades"
                description="These examples extend the same single-date surface with business constraints and async validation. They demonstrate how Plus adds workflow rules on top of the Core picker contract."
                tone="plus"
              >
                <div className="grid gap-5 xl:grid-cols-2">
                  <SectionCard
                    id="single-plus-constraints"
                    title="Single date (popover, Plus constraints)"
                    description="Plus DatePicker with min/max bounds and weekend blocking"
                  >
                    <DatePickerPlus
                      value={plusSelectedDate}
                      onChange={setPlusSelectedDate}
                      minDate={plusMinDate}
                      maxDate={plusMaxDate}
                      blockWeekends
                    >
                      <DatePickerPlus.Input />
                      <DatePickerPlus.Calendar>
                        <DatePickerPlus.CalendarHeader />
                        <DatePickerPlus.CalendarGrid />
                      </DatePickerPlus.Calendar>
                    </DatePickerPlus>
                    <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                      Allowed window: {format(plusMinDate, 'PPP')} to{' '}
                      {format(plusMaxDate, 'PPP')}, excluding Saturdays and Sundays.
                    </p>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {plusSelectedDate
                        ? `Selected: ${format(plusSelectedDate, 'PPP')}`
                        : 'Choose an allowed business day'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="single-plus-async-validation"
                    title="Single date (Plus async validation)"
                    description="Plus DatePicker with blocking async validation and inline status feedback"
                  >
                    <DatePickerPlus
                      value={asyncSelectedDate}
                      onChange={setAsyncSelectedDate}
                      validateAsync={validateDemoDateAsync}
                    >
                      <DatePickerPlus.Input />
                      <DatePickerPlus.Calendar>
                        <DatePickerPlus.CalendarHeader />
                        <DatePickerPlus.CalendarGrid />
                      </DatePickerPlus.Calendar>
                    </DatePickerPlus>
                    <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                      Demo rule: Sundays are rejected after a short simulated server round trip.
                    </p>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {asyncSelectedDate
                        ? `Selected: ${format(asyncSelectedDate, 'PPP')}`
                        : 'Choose a non-Sunday date'}
                    </p>
                  </SectionCard>
                </div>
              </SectionGroup>

              <SectionGroup
                eyebrow="Plus"
                title="Themes and skins"
                description="Advanced styling now lives in the Plus story. These examples keep named theme presets and slot-level skins attached only to Plus components."
                tone="plus"
              >
                <SectionCard
                  id="stock-theme-playground"
                  title="Theme preset playground"
                  description="Switch between the built-in Plus themes. Material, Modern Minimal, and Booking are premium theme presets, not external-system adapters."
                >
                  <div className="mb-5 flex flex-wrap gap-2">
                    {stockThemeOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={controlButtonClass(themeDemoMode === option.value)}
                        onClick={() => setThemeDemoMode(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                      <p className="mb-3 text-sm text-[var(--q3-text-disabled)]">
                        Plus `DatePicker` preview
                      </p>
                      <DatePickerPlus
                        value={themeDemoDate}
                        onChange={setThemeDemoDate}
                        theme={themeDemoMode}
                      >
                        <DatePickerPlus.Input />
                        <DatePickerPlus.Calendar>
                          <DatePickerPlus.CalendarHeader />
                          <DatePickerPlus.CalendarGrid />
                        </DatePickerPlus.Calendar>
                      </DatePickerPlus>
                      <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                        {themeDemoDate
                          ? `Selected: ${format(themeDemoDate, 'PPP')}`
                          : 'Choose a date'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                      <p className="mb-3 text-sm text-[var(--q3-text-disabled)]">
                        Plus `RangeCalendar` preview
                      </p>
                      <div className="overflow-x-auto pb-1">
                        <RangeCalendar
                          selectedRange={themeDemoRange}
                          selectRange={setThemeDemoRange}
                          numberOfMonths={2}
                          theme={themeDemoMode}
                        />
                      </div>
                      <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                        {themeDemoRange.start ? `Start: ${format(themeDemoRange.start, 'PPP')}` : 'Start: —'}{' '}
                        {themeDemoRange.end ? `End: ${format(themeDemoRange.end, 'PPP')}` : 'End: —'}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  id="stock-skin-playground"
                  title="Skin preset playground"
                  description="Swap slot-level skins on the Plus `Calendar` without changing its selection or keyboard behavior."
                >
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(Object.entries(calendarSkinPresets) as Array<
                      [SkinPresetKey, typeof calendarSkinPresets[SkinPresetKey]]
                    >).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        className={controlButtonClass(skinPreset === key)}
                        onClick={() => setSkinPreset(key)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <p className="mb-4 text-xs text-[var(--q3-text-disabled)]">
                    {activeCalendarSkin.description}
                  </p>
                  <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                      <CalendarPlus
                        selectedDate={skinDemoDate}
                        selectDate={setSkinDemoDate}
                        skin={activeCalendarSkin.skin}
                      />
                      <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                        {skinDemoDate ? `Selected: ${format(skinDemoDate, 'PPP')}` : 'Choose a date'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                      <p className="text-sm font-medium text-[var(--q3-text-primary)]">
                        What this is changing
                      </p>
                      <p className="mt-2 text-sm text-[var(--q3-text-disabled)]">
                        Each preset swaps slot classes through the Plus `skin` prop. The calendar
                        logic stays the same, but the shell, header buttons, weekday labels, and
                        day-cell states are restyled per instance.
                      </p>
                      <div className="mt-4 rounded-lg border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.45)] p-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[var(--q3-text-disabled)]">
                          Current preset
                        </p>
                        <p className="mt-2 text-sm text-[var(--q3-text-primary)]">
                          {activeCalendarSkin.label}
                        </p>
                        <p className="mt-1 text-xs text-[var(--q3-text-disabled)]">
                          {`${
                            skinPreset === 'default'
                              ? 'skin={undefined}'
                              : `skin={${activeCalendarSkin.label}}`
                          }`}
                        </p>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </SectionGroup>

              <SectionGroup
                eyebrow="Plus"
                title="Motion presets"
                description="This preserves the animation pack work from main and places it in the Plus story, where the motion preset spans inline calendars, popovers, range views, and mobile sheet interactions."
                tone="plus"
              >
                <SectionCard
                  id="fluent-animation-pack"
                  title="Fluent animation pack"
                  description="Motion preset coverage for inline calendar, popover date picker, inline range calendar, and range picker."
                >
                  <p className="mb-4 max-w-3xl text-sm text-[var(--q3-text-disabled)]">
                    This uses the additive `fluentAnimationPack` skin export, so the stock surface
                    styling stays intact while transitions, calendar slide motion,
                    micro-interactions, and popover or sheet animations are layered on top.
                  </p>
                  <div className="grid gap-4">
                    <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                      <p className="mb-3 text-sm text-[var(--q3-text-disabled)]">
                        Plus `Calendar` + fluent motion skin
                      </p>
                      <CalendarPlus
                        selectedDate={fluentCalendarDate}
                        selectDate={setFluentCalendarDate}
                        theme="light"
                        skin={fluentAnimationPack.calendar}
                      />
                      <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                        {fluentCalendarDate
                          ? `Selected: ${format(fluentCalendarDate, 'PPP')}`
                          : 'Choose a date'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                      <p className="mb-3 text-sm text-[var(--q3-text-disabled)]">
                        Plus `DatePicker` + fluent popover transitions
                      </p>
                      <DatePickerPlus
                        value={fluentDatePickerDate}
                        onChange={setFluentDatePickerDate}
                        theme="light"
                        skin={fluentAnimationPack.datePicker}
                      >
                        <DatePickerPlus.Input />
                        <DatePickerPlus.Calendar>
                          <DatePickerPlus.CalendarHeader />
                          <DatePickerPlus.CalendarGrid />
                        </DatePickerPlus.Calendar>
                      </DatePickerPlus>
                      <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                        {fluentDatePickerDate
                          ? `Selected: ${format(fluentDatePickerDate, 'PPP')}`
                          : 'Open the picker to preview fade and scale motion'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                      <p className="mb-3 text-sm text-[var(--q3-text-disabled)]">
                        Plus `RangeCalendar` + month slide animation
                      </p>
                      <div className="overflow-x-auto pb-1">
                        <RangeCalendar
                          selectedRange={fluentRange}
                          selectRange={setFluentRange}
                          numberOfMonths={2}
                          showPresets
                          theme="material-light"
                          skin={fluentAnimationPack.rangeCalendar}
                        />
                      </div>
                      <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                        {fluentRange.start ? `Start: ${format(fluentRange.start, 'PPP')}` : 'Start: —'}{' '}
                        {fluentRange.end ? `End: ${format(fluentRange.end, 'PPP')}` : 'End: —'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.3)] p-4">
                      <p className="mb-3 text-sm text-[var(--q3-text-disabled)]">
                        Plus `DateRangePicker` + fluent desktop and mobile motion
                      </p>
                      <DateRangePicker
                        value={fluentRangePicker}
                        onChange={setFluentRangePicker}
                        numberOfMonths={2}
                        showPresets
                        mobile={{
                          enabled: true,
                          mode: 'always',
                          gestures: { swipeMonth: true, swipeToClose: true }
                        }}
                        theme="material-light"
                        skin={fluentAnimationPack.dateRangePicker}
                      >
                        <DateRangePicker.Input />
                        <DateRangePicker.Calendar>
                          <DateRangePicker.CalendarHeader />
                          <DateRangePicker.CalendarGrid />
                        </DateRangePicker.Calendar>
                      </DateRangePicker>
                      <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                        Open on desktop for popover fade-scale. On narrow screens or forced sheet
                        mode, use the handle to see modal motion and snap-back.
                      </p>
                      <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                        {fluentRangePicker.start
                          ? `Start: ${format(fluentRangePicker.start, 'PPP')}`
                          : 'Start: —'}{' '}
                        {fluentRangePicker.end
                          ? `End: ${format(fluentRangePicker.end, 'PPP')}`
                          : 'End: —'}
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </SectionGroup>

              <SectionGroup
                eyebrow="Plus"
                title="Range workflows"
                description="Range selection is where Plus becomes materially different from Core. This group keeps inline calendars, popovers, presets, validation, mobile sheet behavior, and time-aware flows together."
                tone="plus"
              >
                <div className="grid gap-5 xl:grid-cols-2">
                  <SectionCard
                    id="range-inline-2"
                    title="Range selection (inline, 2 months)"
                    description="RangeCalendar component"
                    className={`${panelClass} xl:col-span-2`}
                  >
                    <RangeCalendar selectedRange={range} selectRange={setRange} numberOfMonths={2} />
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {range.start ? `Start: ${format(range.start, 'PPP')}` : 'Start: —'}{' '}
                      {range.end ? `End: ${format(range.end, 'PPP')}` : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-inline-3"
                    title="Range selection (inline, 3 months)"
                    description="RangeCalendar + numberOfMonths"
                    className={`${panelClass} xl:col-span-2`}
                  >
                    <RangeCalendar
                      selectedRange={rangeThree}
                      selectRange={setRangeThree}
                      numberOfMonths={3}
                    />
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeThree.start ? `Start: ${format(rangeThree.start, 'PPP')}` : 'Start: —'}{' '}
                      {rangeThree.end ? `End: ${format(rangeThree.end, 'PPP')}` : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-popover-default"
                    title="Range selection (popover, default)"
                    description="DateRangePicker default month view"
                  >
                    <DateRangePicker value={rangeInputDefault} onChange={setRangeInputDefault}>
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInputDefault.start
                        ? `Start: ${format(rangeInputDefault.start, 'PPP')}`
                        : 'Start: —'}{' '}
                      {rangeInputDefault.end
                        ? `End: ${format(rangeInputDefault.end, 'PPP')}`
                        : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-popover-presets"
                    title="Range selection (popover, presets enabled)"
                    description="DateRangePicker + quick presets"
                  >
                    <DateRangePicker
                      value={rangeInputPresets}
                      onChange={setRangeInputPresets}
                      showPresets
                    >
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInputPresets.start
                        ? `Start: ${format(rangeInputPresets.start, 'PPP')}`
                        : 'Start: —'}{' '}
                      {rangeInputPresets.end
                        ? `End: ${format(rangeInputPresets.end, 'PPP')}`
                        : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-async-validation"
                    title="Range selection (async validation)"
                    description="DateRangePicker with blocking async validation for completed ranges"
                  >
                    <DateRangePicker
                      value={rangeInputAsync}
                      onChange={setRangeInputAsync}
                      validateAsync={validateDemoRangeAsync}
                    >
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                      Demo rule: completed ranges longer than 5 days are rejected after a short simulated server round trip.
                    </p>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInputAsync.start
                        ? `Start: ${format(rangeInputAsync.start, 'PPP')}`
                        : 'Start: —'}{' '}
                      {rangeInputAsync.end
                        ? `End: ${format(rangeInputAsync.end, 'PPP')}`
                        : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-mobile-sheet"
                    title="Range selection (mobile sheet, forced)"
                    description="DateRangePicker mobile presentation + swipe gestures"
                  >
                    <DateRangePicker
                      value={rangeInputMobileSheet}
                      onChange={setRangeInputMobileSheet}
                      mobile={{
                        enabled: true,
                        mode: 'always',
                        gestures: { swipeMonth: true, swipeToClose: true }
                      }}
                    >
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-2 text-xs text-[var(--q3-text-disabled)]">
                      Swipe left or right on month panels to change month. Drag down on the sheet handle to close.
                    </p>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInputMobileSheet.start
                        ? `Start: ${format(rangeInputMobileSheet.start, 'PPP')}`
                        : 'Start: —'}{' '}
                      {rangeInputMobileSheet.end
                        ? `End: ${format(rangeInputMobileSheet.end, 'PPP')}`
                        : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-popover-2"
                    title="Range selection (popover, 2 months)"
                    description="DateRangePicker component"
                  >
                    <DateRangePicker
                      value={rangeInput}
                      onChange={setRangeInput}
                      numberOfMonths={2}
                    >
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInput.start ? `Start: ${format(rangeInput.start, 'PPP')}` : 'Start: —'}{' '}
                      {rangeInput.end ? `End: ${format(rangeInput.end, 'PPP')}` : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-popover-3"
                    title="Range selection (popover, 3 months)"
                    description="DateRangePicker + numberOfMonths"
                  >
                    <DateRangePicker
                      value={rangeInputThree}
                      onChange={setRangeInputThree}
                      numberOfMonths={3}
                    >
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInputThree.start
                        ? `Start: ${format(rangeInputThree.start, 'PPP')}`
                        : 'Start: —'}{' '}
                      {rangeInputThree.end
                        ? `End: ${format(rangeInputThree.end, 'PPP')}`
                        : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-es"
                    title="Range selection (popover, es locale)"
                    description="DateRangePicker + esI18n preset"
                  >
                    <DateRangePicker
                      value={rangeInputEs}
                      onChange={setRangeInputEs}
                      i18n={esI18n}
                    >
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInputEs.start
                        ? `Start: ${format(rangeInputEs.start, 'PPP', { locale: esI18n.locale })}`
                        : 'Start: —'}{' '}
                      {rangeInputEs.end
                        ? `End: ${format(rangeInputEs.end, 'PPP', { locale: esI18n.locale })}`
                        : 'End: —'}
                    </p>
                  </SectionCard>

                </div>
              </SectionGroup>

              <SectionGroup
                eyebrow="Plus"
                title="Date and time workflows"
                description="These examples focus on range selection with time controls enabled, separated from the calendar-only range flows so the mixed date-time behavior is easier to compare."
                tone="plus"
              >
                <div className="grid gap-5 xl:grid-cols-2">
                  <SectionCard
                    id="range-datetime-12h"
                    title="Range selection (date + time, 12-hour)"
                    description="DateRangePicker + time wheels (12h)"
                  >
                    <DateRangePicker
                      value={rangeInputDateTime12h}
                      onChange={setRangeInputDateTime12h}
                      enableTime
                      timeFormat="12h"
                      defaultStartTime="08:00 AM"
                      defaultEndTime="05:00 PM"
                    >
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInputDateTime12h.start
                        ? `Start: ${format(rangeInputDateTime12h.start, 'PPP hh:mm a')}`
                        : 'Start: —'}{' '}
                      {rangeInputDateTime12h.end
                        ? `End: ${format(rangeInputDateTime12h.end, 'PPP hh:mm a')}`
                        : 'End: —'}
                    </p>
                  </SectionCard>

                  <SectionCard
                    id="range-datetime-24h"
                    title="Range selection (date + time, 24-hour)"
                    description="DateRangePicker + time wheels (24h)"
                  >
                    <DateRangePicker
                      value={rangeInputDateTime24h}
                      onChange={setRangeInputDateTime24h}
                      enableTime
                      timeFormat="24h"
                      defaultStartTime="08:00"
                      defaultEndTime="17:00"
                    >
                      <DateRangePicker.Input />
                      <DateRangePicker.Calendar>
                        <DateRangePicker.CalendarHeader />
                        <DateRangePicker.CalendarGrid />
                      </DateRangePicker.Calendar>
                    </DateRangePicker>
                    <p className="mt-3 text-sm text-[var(--q3-text-disabled)]">
                      {rangeInputDateTime24h.start
                        ? `Start: ${format(rangeInputDateTime24h.start, 'PPP HH:mm')}`
                        : 'Start: —'}{' '}
                      {rangeInputDateTime24h.end
                        ? `End: ${format(rangeInputDateTime24h.end, 'PPP HH:mm')}`
                        : 'End: —'}
                    </p>
                  </SectionCard>
                </div>
              </SectionGroup>

              <SectionGroup
                eyebrow="Plus"
                title="Adapter surfaces"
                description="Adapters remain a Plus-only story. This section is now organized around adapter selection so each design-system integration gets its own focused workspace as more adapters land."
                tone="plus"
              >
                <SectionCard
                  id="adapter-surfaces"
                  title={`${activeAdapterMeta.label} adapter showcase`}
                  description="Select an adapter to focus the examples on that implementation only."
                >
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-[var(--q3-border)] bg-[color:rgb(11_18_32_/_0.4)] p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-xs uppercase tracking-[0.22em] text-[var(--q3-text-disabled)]">
                            Adapter Selector
                          </p>
                          <h3 className="mt-2 text-base font-semibold text-[var(--q3-text-primary)]">
                            {activeAdapterMeta.label}
                          </h3>
                          <p className="mt-2 text-sm text-[var(--q3-text-disabled)]">
                            {activeAdapterMeta.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activeAdapterMeta.highlights.map(highlight => (
                              <span
                                key={highlight}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--q3-text-primary)]"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div
                          role="tablist"
                          aria-label="Adapter showcase"
                          className="flex flex-wrap gap-2"
                        >
                          {adapterShowcases.map(showcase => (
                            <button
                              key={showcase.id}
                              id={`${showcase.id}-adapter-tab`}
                              role="tab"
                              type="button"
                              aria-selected={activeAdapterShowcase === showcase.id}
                              aria-controls={`${showcase.id}-adapter-panel`}
                              className={`${adapterButtonClass} ${
                                activeAdapterShowcase === showcase.id
                                  ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-[0_12px_28px_rgba(34,211,238,0.24)]'
                                  : 'border-[var(--q3-border)] bg-transparent text-[var(--q3-text-primary)] hover:border-cyan-400/70 hover:bg-[color:rgb(34_211_238_/_0.1)]'
                              }`}
                              onClick={() => setActiveAdapterShowcase(showcase.id)}
                            >
                              <span>{showcase.label}</span>
                              <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
                                {showcase.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {activeAdapterShowcase === 'shadcn' ? (
                      <div
                        id="shadcn-adapter-panel"
                        role="tabpanel"
                        aria-labelledby="shadcn-adapter-tab"
                        className="space-y-4"
                      >
                        <div className={shadcnSurfaceClass}>
                          <h3 className="text-base font-semibold">Inline calendar</h3>
                          <p className="mb-3 mt-1 text-sm text-slate-500">
                            `shadcn.Calendar` adapter for the Core `Calendar` surface.
                          </p>
                          <shadcn.Calendar
                            selectedDate={shadcnInlineDate}
                            selectDate={setShadcnInlineDate}
                          />
                          <p className="mt-3 text-sm text-slate-500">
                            {shadcnInlineDate
                              ? `Selected: ${format(shadcnInlineDate, 'PPP')}`
                              : 'Choose a date'}
                          </p>
                        </div>

                        <div className={shadcnSurfaceClass}>
                          <h3 className="text-base font-semibold">Single date picker</h3>
                          <p className="mb-3 mt-1 text-sm text-slate-500">
                            `shadcn.DatePicker` with Plus business-day constraints.
                          </p>
                          <shadcn.DatePicker
                            value={shadcnSelectedDate}
                            onChange={setShadcnSelectedDate}
                            minDate={plusMinDate}
                            maxDate={plusMaxDate}
                            blockWeekends
                          />
                          <p className="mt-3 text-sm text-slate-500">
                            {shadcnSelectedDate
                              ? `Selected: ${format(shadcnSelectedDate, 'PPP')}`
                              : 'Choose an allowed business day'}
                          </p>
                        </div>

                        <div className={shadcnSurfaceClass}>
                          <h3 className="text-base font-semibold">Inline range calendar</h3>
                          <p className="mb-3 mt-1 text-sm text-slate-500">
                            `shadcn.RangeCalendar` with presets and two visible months.
                          </p>
                          <div className="overflow-x-auto pb-1">
                            <shadcn.RangeCalendar
                              selectedRange={shadcnInlineRange}
                              selectRange={setShadcnInlineRange}
                              numberOfMonths={2}
                              showPresets
                            />
                          </div>
                          <p className="mt-3 text-sm text-slate-500">
                            {shadcnInlineRange.start
                              ? `Start: ${format(shadcnInlineRange.start, 'PPP')}`
                              : 'Start: —'}{' '}
                            {shadcnInlineRange.end
                              ? `End: ${format(shadcnInlineRange.end, 'PPP')}`
                              : 'End: —'}
                          </p>
                        </div>

                        <div className={shadcnSurfaceClass}>
                          <h3 className="text-base font-semibold">Range picker</h3>
                          <p className="mb-3 mt-1 text-sm text-slate-500">
                            `shadcn.DateRangePicker` with presets, time wheels, and two months.
                          </p>
                          <shadcn.DateRangePicker
                            value={shadcnRange}
                            onChange={setShadcnRange}
                            showPresets
                            enableTime
                            numberOfMonths={2}
                            timeFormat="12h"
                            defaultStartTime="09:00 AM"
                            defaultEndTime="05:00 PM"
                          />
                          <p className="mt-3 text-sm text-slate-500">
                            {shadcnRange.start
                              ? `Start: ${format(shadcnRange.start, 'PPP hh:mm a')}`
                              : 'Start: —'}{' '}
                            {shadcnRange.end
                              ? `End: ${format(shadcnRange.end, 'PPP hh:mm a')}`
                              : 'End: —'}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </SectionCard>
              </SectionGroup>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
