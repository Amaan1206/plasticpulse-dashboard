# WasteWise Frontend Migration Brief

## 1. Project Context
This frontend was originally built for **PlasticPulse**, a specialized platform focused entirely on identifying and classifying 7 plastic resin codes. It is now being migrated to **WasteWise**—a generic, 9-category waste segregation platform (Biological, Cardboard, Glass, Metal, Miscellaneous, Paper, Plastic, Textile, Vegetation). Please refer to the root `README.md` as the definitive source of truth for the product scope, feature set, and target audience. 

## 2. Known Backend Mismatch — Read Before Starting
**Do not wire the frontend directly to the current backend API.** 
The current backend is an older Express server built for PlasticPulse with endpoints like `/api/detect`, `/api/drives`, `/api/scoreboard`, and `/api/municipal`. It **does not yet match** the new WasteWise Hono/TypeScript API contract specified in the README.

To avoid rewriting the frontend twice, all frontend development should be done against mocked or stubbed data that matches the **new expected API shape**.

**Expected WasteWise API Endpoints & Shapes:**
*   `GET /detections`
    *   *Shape:* `[{ id, device_id, timestamp, material_category, confidence, fill_level_pct, location: { facility, line } }]`
*   `GET /analytics/summary`
    *   *Shape:* `{ total_scans, category_breakdown: { plastic: 10, glass: 5... }, average_confidence }`
*   `GET /bins/status`
    *   *Shape:* `[{ device_id, fill_level_pct, location, last_detection, most_detected_category }]`
*   `GET /facility/throughput`
    *   *Shape:* `[{ date, facility, line, total_items }]`
*   `GET /learn/categories`
    *   *Shape:* `[{ category, description, examples: [], typical_handling }]`
*   `GET /analytics/heatmap`
    *   *Shape:* GeoJSON or point array with `{ lat, lng, dominant_category, intensity }`

## 3. Components to KEEP As-Is (tech stack is correct, structure is reusable)
The underlying tech stack (React, Tailwind, Recharts, Leaflet, WebSocket) is correct and the structure is highly reusable. 

**Pages (`src/pages/`)**
*   `LiveFeed.jsx` — Keep the layout. Replace the plastic-density "kg Recorded" metric with total item counts or accuracy rates. Update the feed cards to accept the 9 material categories.
*   `WasteMap.jsx` — Keep. The Leaflet/heatmap layer maps perfectly to the README's "Facility Operations Map".
*   `Analytics.jsx` — Keep structure. Swap the plastic resin-code donut and bar charts for the 9-category equivalents.
*   `BinMonitor.jsx` — Keep. Decouple from plastic-specific fields (change `top_plastic_type` to `most_detected_category`).
*   `ScanHistory.jsx` — Keep. Simply update the table columns to reflect `material_category` rather than `plastic_type` or `resin_code`.

**Components (`src/components/`)**
*   `common/DetectionCard.jsx` — Keep, swap `plastic_type` for `material_category`.
*   `common/BinStatusPill.jsx` — Keep, swap `top_plastic_type`.
*   `common/ScanProgressOverlay.jsx` — Keep, adapt logic to handle the 9 classes.
*   `layout/Sidebar.jsx` & `TopBar.jsx` — Keep, but rename "PlasticPulse" to "WasteWise" and update navigation links (see Section 6).
*   `charts/*` (BarChart, DonutChart, LineChart, Sparkline) — Keep completely intact.

## 4. Components to REMOVE (plastic-specific branding only)
*   Remove hardcoded resin-code (1-7) logic found throughout UI components and charts.
*   Remove "PlasticPulse" logos, branding text, and page titles across `TopBar.jsx`, `Sidebar.jsx`, and `App.jsx`.

## 5. Components to REWRITE — Learning Hub & Quiz
`src/pages/LearningHub.jsx` currently contains hardcoded, static content exclusively for the 7 plastic resin codes (PET, HDPE, etc.). 
*   **The Hub:** Rewrite this page to cover all 9 WasteWise material categories. Use the README's classification table to populate: what it is, common examples, correct handling/disposal stream, and why it matters. 
*   **The Quiz:** The quiz mode must be rebuilt. Instead of quizzing on resin codes, it must draw from a shuffled question bank covering the 9 categories. Present an item/image, ask the user to pick the correct material category out of the 9, and provide instant feedback based on the README's typical handling rules.
*   **Data Source:** Rewrite `src/mock/learn.json` to supply the 9 categories instead of resin codes.

## 5b. Components to ADAPT — Community and Citizen Features
*   **`DriveManager.jsx`** — Keep. Adapt cleanup drives to track any of the 9 waste categories instead of plastic only. 
    *   *Mock Update:* Update `src/mock/drives.json` to use a `material_category` array rather than `plastic_type`.
*   **`Scoreboard.jsx`** — Keep. Adapt eco-points and badges to award for correct segregation across all 9 categories. Remove `resin_code` references. 
    *   *Mock Update:* Update `src/mock/scoreboard.json` and `src/mock/sustainability.json` to replace plastic-centric fields with the WasteWise data model.
*   **`Municipal.jsx`** — Keep. Adapt citizen rankings leaderboard to show performance across all 9 categories. 
    *   *Mock Update:* Update `src/mock/municipal.json` to reflect generic material segregation stats instead of plastic.
*   **`AreaReport.jsx`** — Keep. Adapt plastic-focused impact reports to display generic waste segregation progress and improvements.

## 6. UX Overhaul — Admin-Focused Flow
The current dashboard "shouts data" at the user with a flat grid of disconnected widgets. Redesign the Information Architecture (IA) for a facility administrator managing a live intake stream.

**Design Principles:**
*   Lead with a clear, glanceable status (e.g., bin alerts at the top) before diving into raw charts.
*   Reduce visual noise using progressive disclosure (summary cards that click through to details).
*   Ensure urgent info (overflowing bin, low-confidence spike) commands the highest visual hierarchy.

**Proposed Sidebar Navigation Structure:**
1.  **Overview:** Combines the top metrics of `LiveFeed.jsx` and the urgent warnings of `BinMonitor.jsx`. (Answers: "Is the facility healthy right now?")
2.  **Live Intake:** The scrolling WebSocket feed of items arriving on the conveyor (`LiveFeed.jsx` feed component).
3.  **Facility Map:** The Leaflet node/heatmap view (`WasteMap.jsx`) for spatial context across multiple facilities.
4.  **Analytics:** Deep-dive historical charts, throughput, and confidence distributions (`Analytics.jsx`).
5.  **Community:** Hub for `DriveManager.jsx`, `Scoreboard.jsx`, and `Municipal.jsx` citizen features.
6.  **Scan Records:** The raw data log for auditing (`ScanHistory.jsx`).
7.  **Reference Hub:** Material handling guidelines (`LearningHub.jsx`).

## 7. Data Model Changes
Search and replace the following PlasticPulse-specific fields across the entire frontend (especially in contexts, hooks, and components):

*   `plastic_type` ➔ `material_category` (e.g., Biological, Paper, Plastic, Metal...)
*   `resin_code` ➔ Remove entirely (no longer applicable)
*   `top_plastic_type` ➔ `most_detected_category`
*   `correct_bin` ➔ `handling_action` or `disposal_stream`
*   `kg` / `kgRecorded` ➔ Replace with `total_items` or item count (unless specifically integrating a weight sensor, which the README excludes).

## 8. Acceptance Checklist
*   [ ] No references to plastic resin codes (#1-7) remain anywhere in UI copy
*   [ ] No references to "PlasticPulse" remain in `package.json`, page titles, or UI text
*   [ ] All 9 WasteWise categories represented in Learning Hub and Quiz
*   [ ] Cleanup Drive Manager adapted to all 9 waste categories (not removed)
*   [ ] Sustainability Scoreboard adapted to all 9 waste categories (not removed)
*   [ ] Municipal/Citizen Rankings adapted to material_category across all 9 classes (not removed)
*   [ ] Dashboard navigation follows the proposed admin-flow structure
*   [ ] All API calls match the README's endpoint contract (not the old Express endpoints)
