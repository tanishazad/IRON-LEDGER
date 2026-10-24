# Iron Ledger — Patch Notes

Changes made to bring this in line with the project brief and Lecture 1–42:

1. **Chart.js instead of hand-built SVG** — the progress chart now uses
   Chart.js (loaded via CDN, `chart.js@4.4.4`), matching the brief's
   named tech stack. The old `buildLineChart()` SVG function was removed
   and replaced with a `Chart(canvas, {...})` line chart in
   `renderProgress()`.

2. **`fetch` + `async`/`await` + ES6 modules** — added two new files:
   - `data/exercises.json` — a small exercise library
   - `js/exerciseLibrary.js` — an ES6 module (`export async function
     loadExerciseLibrary()`) that fetches that JSON file

   `index.html` imports it with a `<script type="module">` block and uses
   the result to power autosuggestions on the "Exercise" field in the
   Routines tab (a `<datalist>`). This covers the fetch/Promises/JSON/
   modules items from Lecture 13–18 that the single-file version skipped.

3. **Accessibility** — the Log In / Sign Up toggle now has
   `role="tablist"` / `role="tab"` / `aria-selected`, the auth error box
   has `role="alert"`, and toast notifications have `role="status"
   aria-live="polite"` so screen readers announce them.

## File structure

```
iron-ledger/
├── index.html              Everything else — layout, styles, app logic
├── data/exercises.json      Exercise names, fetched by the module below
├── js/exerciseLibrary.js    ES6 module: fetch() + async/await wrapper
└── README.md
```

Keep this structure intact — `index.html` references the other two files
by their relative path (`data/exercises.json`, `./js/exerciseLibrary.js`).

## How to run it

Because `js/exerciseLibrary.js` now does a real `fetch()` call, opening
`index.html` by double-clicking it (a `file://` URL) will make that fetch
fail with a CORS error in the console — the app still works (there's a
fallback exercise list), but the "live" fetched suggestions won't load.

To get the full behavior, serve the folder instead:

- **VS Code:** install the **Live Server** extension → right-click
  `index.html` → **Open with Live Server**
- **Or from a terminal**, inside the `iron-ledger` folder:
  ```bash
  npx serve .
  ```
  then open the printed `http://localhost:...` address.

## Still worth knowing

- Auth (email/password and the "Google"/"Facebook" buttons) is a
  **front-end-only demo** — accounts live in `localStorage`, and the
  social buttons are simulated, not real OAuth. That's disclosed in the
  UI itself (see the note under the login form).
- Everything else (routines, logging, dashboard stats, streaks) is
  unchanged from your version — only the chart, the exercise-suggestion
  fetch, and the accessibility attributes were added.
