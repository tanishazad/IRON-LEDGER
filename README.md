# Iron Ledger — Personal Fitness & Workout Tracker

React + Vite single-page app. Evaluation 1 (vanilla HTML/CSS/JS) lives untouched in
[`evaluation-1-vanilla/`](evaluation-1-vanilla/); this is the Evaluation 2 version (Lectures 43–72),
which rebuilds the same app in React and adds routing, global state, validated forms, reusable UI
components and a REST-API-powered exercise explorer.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
```

No API key is needed. Existing Evaluation 1 data (accounts, routines, logs) is read from the same
`localStorage` keys, so it carries over in the same browser.

## Evaluation 2 topics → where to find them

| Lectures | Topic | Where |
|---|---|---|
| 43–48 | Navigation layout & page structure | `components/layout/AppLayout.jsx` (sidebar + `<Outlet/>`, `NavLink` active states, skip link) |
| 43–48 | Multi-page SPA design | `App.jsx` — route map, nested routes, dynamic `:routineId`, protected/public-only routes, 404, lazy-loaded pages |
| 49–54 | Context API | `context/AuthContext.jsx`, `context/ToastContext.jsx` |
| 49–54 | Global vs local state | see *State architecture* below |
| 49–54 | Redux Toolkit | `store/` — `createSlice`, `createAsyncThunk`, memoised selectors (`createSelector`) |
| 49–54 | Async state, loading / error handling | `store/workoutsSlice.js` (`status`, `error`, `saving`), `components/ui/Feedback.jsx` (spinner, skeleton, error + retry) |
| 55–60 | Form handling | `hooks/useForm.js` (controlled inputs, touched state, submit errors), `pages/Register.jsx`, `pages/Login.jsx`, `pages/LogWorkout.jsx` |
| 55–60 | Validation strategies | `utils/validators.js` — pure validators; errors shown on blur and on submit; cross-field check (confirm password); password-strength meter |
| 55–60 | Reusable input components | `components/ui/InputField.jsx` (label, hint, error, ARIA wiring, show/hide password) |
| 61–66 | Modal | `components/ui/Modal.jsx` (portal, focus trap, Esc, scroll lock), `ConfirmDialog.jsx` |
| 61–66 | Tabs | `components/ui/Tabs.jsx` (WAI-ARIA tabs, arrow-key navigation) — Progress and Routine detail pages |
| 61–66 | Dropdowns | `components/ui/Dropdown.jsx` (listbox pattern, keyboard + click-outside) |
| 61–66 | Toast notifications | `context/ToastContext.jsx` |
| 61–66 | Search / filter / sort | `pages/Routines.jsx` (debounced search + filter + sort with `useMemo`), `pages/Explore.jsx` |
| 61–66 | Mini project: registration form with validation | `pages/Register.jsx` |
| 67–72 | Consuming REST APIs with fetch/axios | `api/exerciseApi.js` — axios instance, query params, response normalisation |
| 67–72 | Loading states, retry, error handling | `withRetry()` (exponential back-off on network / 429 / 5xx), `getErrorMessage()`, "Try again" button, offline-library fallback |
| 67–72 | Pagination, infinite scroll | `components/ui/Pagination.jsx`, `hooks/useInfiniteScroll.js` (IntersectionObserver); switch between them in Explore's **View** dropdown |
| 67–72 | Debounce | `hooks/useDebounce.js` — Explore search only calls the API 400 ms after you stop typing |
| 67–72 | CRUD app workflows | Routines: create / edit (modal) / delete (confirm) / read (list + detail); "Add to routine" from an API exercise is an update |
| 67–72 | Third-party APIs | [wger](https://wger.de/en/software/api) exercise database |
| 67–72 | Mini project: movie search / GitHub profile viewer | `pages/Explore.jsx` (exercise search app — same pattern) |

Lectures 1–42 are still covered — now in React: `useState`, `useEffect`, `useRef`, `useMemo`,
`useCallback`, custom hooks (`hooks/`), lifting state up, props, conditional rendering and lists,
React Router basics, nested/dynamic routes, protected routes and a 404 page.

## Routes

```
/login, /register          public only (signed-in users are redirected away)
/                          protected → AppLayout
  /dashboard
  /routines                list + search/filter/sort + create/edit/delete modals
  /routines/:routineId     detail (tabs: Exercises / History)
  /log?routine=<id>        log a workout
  /progress                tabs: Chart / Table
  /explore                 wger exercise browser
*                          404
```

## State architecture — global vs local

| State | Where it lives | Why |
|---|---|---|
| Signed-in user | **Context** (`AuthContext`) | needed by many screens, changes rarely |
| Toast queue | **Context** (`ToastContext`) | app-wide, any component can fire a toast |
| Routines + workout logs | **Redux Toolkit** (`workoutsSlice`) | read by 5+ screens, changed by async operations that need loading/error states |
| Derived stats (streak, totals…) | **Selectors** (`createSelector`) | computed from the store, memoised |
| Form fields, modal open/closed, active tab, dropdown open, search text | **Local** `useState` | only one component cares |
| Explore results / page / status | **Local custom hook** (`useExerciseBrowser`) | server data used by one screen only |
| Explore "View" choice | `useLocalStorage` | per-browser preference |

`api/workoutApi.js` is a localStorage-backed async "backend" (with a small artificial delay) so
the thunks, spinners and error states behave exactly as they would against a real server.

## The Explore API

Explore calls the public wger API (`https://wger.de/api/v2/`):

- browse: `GET /exerciseinfo/?language=2&limit=12&offset=…&category=…`
- search: `GET /exercise/search/?term=…&language=en`

If the service is unreachable the page shows an error with **Try again**, plus **Use offline library**,
which falls back to the bundled `public/data/exercises.json` from Evaluation 1.

## Project structure

```
src/
├── api/          exerciseApi.js (axios, retry) · workoutApi.js (localStorage "backend")
├── components/
│   ├── ui/       InputField · Modal · ConfirmDialog · Tabs · Dropdown · Pagination · Feedback
│   ├── layout/   AppLayout · ProtectedRoute · AuthShell
│   ├── routines/ RoutineFormModal      explore/ ExerciseCard · ExerciseDetailModal
│   ├── dashboard/ Barbell              progress/ ProgressChart (Chart.js)
├── context/      AuthContext · ToastContext
├── hooks/        useForm · useDebounce · useInfiniteScroll · useExerciseBrowser · useLocalStorage · …
├── pages/        Login · Register · Dashboard · Routines · RoutineDetail · LogWorkout · Progress · Explore · NotFound
├── store/        index · workoutsSlice · selectors
├── styles/       index.css
└── utils/        validators · helpers
```

## Good to know

- Auth is still a **front-end-only demo**: accounts live in `localStorage` (passwords unhashed) and the
  Google/Facebook buttons are simulated. A real app needs a backend.
- Routines and logs are shared by every account in the same browser (same as Evaluation 1).
- Deploying: the app uses `BrowserRouter`, so the host must serve `index.html` for unknown paths.
  `public/_redirects` already does this for Netlify; Vercel/GitHub Pages need an equivalent rewrite/404 fallback.

## Putting this into your GitHub repo

Your repo currently has the Evaluation 1 files at the root. Move `index.html`, `data/` and `js/`
into `evaluation-1-vanilla/` (this zip already contains that folder), then add everything else from
this project to the repo root and commit.
