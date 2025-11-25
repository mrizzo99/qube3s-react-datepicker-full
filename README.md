✅ Full datepicker components

✅ Headless calendar hook

✅ UI calendar

✅ DateInput wrapper

✅ Storybook 8

✅ Vite React starter

✅ TailwindCSS

✅ TypeScript

✅ Everything wired together and runnable out-of-the-box

📘 Developer documentation lives in `docs/DEVELOPER_GUIDE.md` (architecture, state model, extension ideas).



✅ Quick Start Instructions

After downloading and extracting the ZIP:

1. Install dependencies

From inside the project folder:

npm install

🟦 Run the dev environment (Vite)

Runs your main demo app at:

📍 http://localhost:5173

npm run dev

🟩 Run Storybook (Storybook 8)

Runs your component explorer at:

📍 http://localhost:6006

npm run storybook

🟧 Build the component library (Vite)

Creates a dist/ directory with production build:

npm run build

🟨 Preview production build (optional)
npm run preview

📂 What’s Included in the ZIP
```
react-datepicker-full/<br>
├─ package.json<br>
├─ vite.config.ts<br>
├─ tsconfig.json<br>
├─ postcss.config.js<br>
├─ tailwind.config.js<br>
├─ .storybook/<br>
│   ├─ main.ts<br>
│   └─ preview.ts<br>
├─ src/<br>
│   ├─ main.tsx<br>
│   ├─ App.tsx<br>
│   ├─ index.css<br>
│   ├─ headless/<br>
│   │    └─ useCalendar.ts<br>
│   └─ components/<br>
│        ├─ Calendar.tsx<br>
│        ├─ DateInput.tsx<br>
│        └─ Calendar.stories.tsx<br>
