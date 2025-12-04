✅ Full datepicker components

✅ Headless calendar hook

✅ UI calendar

✅ DateInput wrapper

✅ Storybook 8

✅ Vite React starter

✅ TailwindCSS

✅ TypeScript

✅ Everything wired together and runnable out-of-the-box

✅ Range selection for the calendar (pass `mode="range"` or `selectedRange`/`selectRange`)

📘 Developer documentation lives in [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) (architecture, state model, extension ideas).



✅ Quick Start Instructions

After downloading and extracting the ZIP:

1. Install dependencies

From inside the project folder:

npm install

🟦 Run the dev environment (Vite)

Runs your main demo app at:

📍 http://localhost:5173

npm run dev

🟩 Run Vitest for component test and results

npm run test

If want to see details about failed tests run:
npm run test --Vitest

If want to see vitest run in browser run
npm run test:browser

🟩 Run Storybook (Storybook 8)

Runs your component explorer at:

📍 http://localhost:6006

npm run storybook

🟧 Build the component library (Vite)

Creates a dist/ directory with production build:

npm run build

🟨 Preview production build (optional)
npm run preview

Range mode usage:

```tsx
const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })

<Calendar mode="range" selectedRange={range} selectRange={setRange} />
```

