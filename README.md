# README — **chord-story** (interactive D3 + Svelte narrative)



## 1-line summary

A small Svelte app that tells a data story with an interactive D3 chord diagram showing co-occurrence / intersection patterns between categorical hate-speech labels. Built for storytelling: scroll → reveal → highlight.

## Why this project exists

This repo turns a labelled, cleaned dataset of comments into a story-driven visualization that highlights how categories of hate intersect. The visualization is an annotated chord diagram with focused “steps” (grayscale → intro → targeted highlights → full) to guide readers from overview to detailed intersections.

## What's included

* `src/lib/chord.js` — D3 implementation of the chord diagram (loading JSONs, gradients, static tooltips, step styling).
* Svelte scaffold:

  * `App.svelte` — story flow, scrollytelling mapping to steps.
  * `ChartLayer.svelte` — chart mounting, data load + update.
  * `TextPanel.svelte`, `Article.svelte`, `Observer.svelte` — narrative & layout.
* Styling: `app.css`.
* Data-loading hooks expect a Supabase storage layout (signed private JSON + public JSONs).
* Small utilities for signed URLs and JSON loads.

(See code excerpts and logic inside the project files for implementation details.) 
![Diagram](image.png)

## Tech stack

* Frontend: Svelte (componentized)
* Visualization: D3 v7 (plain JS module inside `src/lib/chord.js`)
* Storage: Supabase object store (signed URL for private counts.json + public JSONs for percentages)
* Build: Vite / npm

## Data requirements / format

The chord code expects three JSON resources:

1. `counts.json` (private — loaded via signed URL):

   ```json
   {
     "columns": ["sexist","political","communal", ...],
     "data": [[0,12,3,...], [5,0,14,...], ...]  // square co-occurrence count matrix
   }
   ```
2. `percentage_column.json` (public) — contains column-wise percentages (for tooltips).
3. `percentage_global.json` (public) — global intersection percentages.

(Names and structure are those used by the project; if you change column order you must preserve matrix alignment.)

## How to run (local dev)

1. Clone the repo.
2. Install:

   ```bash
   npm install
   ```
3. Create a `supabaseConfig.js` (or use environment approach) with:

   ```js
   export const SUPABASE_URL = "https://your-supabase-url";
   export const SUPABASE_KEY = "service_role_or_key"; // must be allowed to sign objects
   export const PRIVATE_BUCKET = "private-bucket-name";
   export const PUBLIC_BUCKET = "public-bucket-name";
   ```

   — **Important:** only use service keys that you control; do not leak secrets in public repos.
4. Start dev server:

   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` (or the port Vite reports).

## How the story interaction maps to code

* `App.svelte` calculates scroll progress and sets a `currentStep` store.
* `ChartLayer.svelte` loads data via `loadAllData()` in `src/lib/chord.js` and calls `renderChord()` / `updateChord()` when `currentStep` changes.
* `chord.js` contains:

  * data loading (`getSignedUrl`, `loadPublicJSON`)
  * rendering (`renderChord`): groups, ribbons, gradients
  * transitions and staged visual logic (`applyStepStyling`)
  * static tooltip layout for annotated pairs

## Extending or customizing

* Labels / colors: edit `colors` mapping in `chord.js`.
* Tooltip content: modify `pctColMatrix` / tooltip text formatting in `chord.js`.
* Steps: `orderedSteps` in `App.svelte` and the `applyStepStyling` function in `chord.js` are the primary places to add/remove narrative frames.

## Testing & data checks

* Validate your `counts.json` is square and label order matches `columns`.
* If chords don't appear, ensure all JSON endpoints return expected shapes and that signed URL logic returns a usable URL.

## Notes & caveats

* Signed URL expiry: the code requests signed URLs that expire (default in code: 3600s). For production, implement server-side signing if needed.
* Accessibility: the visualization uses SVG tooltips but not full ARIA support. Consider adding keyboard interactivity and ARIA labels for production.

