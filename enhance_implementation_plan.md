# WasteWise Dashboard — Full Overhaul

Complete rearchitecture of the PlasticPulse dashboard into WasteWise: new landing page, top-center navbar, page merges, data model migration from 7 plastic resin codes → 9 waste categories, ESP32 live camera view, and UX flow redesign.

## User Review Required

> [!IMPORTANT]
> This is a **major overhaul** touching almost every file. The plan is designed to be non-breaking at each step — old imports/routes are updated, not left dangling.

> [!WARNING]
> **Branding**: All "PlasticPulse" text will become "WasteWise". The logo `screen.png` in `/public` will stay as-is (just the alt-text changes). If you want a new logo image, provide one separately.

> [!IMPORTANT]
> **Backend**: The server.js still uses `plastic_type`, `resin_code` column names in PostgreSQL. This plan does **NOT** modify the database schema or server — only the frontend. The frontend will map the backend's old field names to the new UI labels client-side. When your friend migrates the backend to the 9-category model, the mapping is a single-point change.

## Proposed Changes

Changes are grouped into 6 phases executed in order.

---

### Phase 1: Landing Page (NEW)

A beautiful, animated landing page that serves as the entry point before the dashboard. Users click "Enter Dashboard" to proceed.

#### [NEW] [LandingPage.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/LandingPage.jsx)
- Full-screen hero section with animated gradient background and floating particles
- Product title "WasteWise" with animated tagline
- 3-step workflow section (Scan → Classify → Track) with scroll-triggered animations
- Feature cards: Live Monitoring, 9-Category AI, Scan History, Analytics
- "Enter Dashboard" CTA button that navigates to `/dashboard`
- Responsive design, dark theme consistent with existing design system

#### [MODIFY] [App.jsx](file:///Users/apple/Downloads/plasticpulse/src/App.jsx)
- Landing page at `/` (no Shell wrapper)
- All dashboard routes move under `/dashboard/*` prefix wrapped in Shell
- Route `/dashboard` → LiveFeed (default dashboard view)

---

### Phase 2: Navigation Overhaul — Top Center Navbar

Replace the left sidebar with a centered top navigation bar. The `Shell.jsx` layout changes from `flex-row (sidebar + content)` to `flex-col (topnav + content)`.

#### [DELETE] [Sidebar.jsx](file:///Users/apple/Downloads/plasticpulse/src/components/layout/Sidebar.jsx)
- Entire file removed — replaced by TopNav

#### [NEW] [TopNav.jsx](file:///Users/apple/Downloads/plasticpulse/src/components/layout/TopNav.jsx)
- Horizontal nav bar, logo on the left, centered nav links, notifications + avatar on the right
- **7 nav items** (per spec Section 6, with user's merges applied):
  1. **Live Feed** (`/dashboard`) — Live detection feed + ESP32 camera
  2. **Facility Map** (`/dashboard/map`) — WasteMap + Municipal ward data merged
  3. **Analytics** (`/dashboard/analytics`) — Deep-dive charts
  4. **Bins** (`/dashboard/bins`) — Bin monitoring
  5. **Community** (`/dashboard/community`) — Drives + Reports + Scoreboard in one page with tabs
  6. **Scan Records** (`/dashboard/history`) — Paginated scan log
  7. **Learn** (`/dashboard/learn`) — Learning hub
- Connection status indicator (live/polling/offline) shown as a small dot in the nav bar
- Mobile: hamburger menu with slide-out drawer
- WasteWise logo + branding (replaces PlasticPulse)

#### [MODIFY] [TopBar.jsx](file:///Users/apple/Downloads/plasticpulse/src/components/layout/TopBar.jsx)
- Stripped down to just the page title + subtitle (no longer needs search/notifications/avatar — those move to TopNav)
- OR merged entirely into TopNav. **Decision: merge into TopNav** to avoid redundancy. TopBar.jsx will be deleted.

#### [DELETE] [TopBar.jsx](file:///Users/apple/Downloads/plasticpulse/src/components/layout/TopBar.jsx)
- Notifications, search, and avatar move into TopNav

#### [MODIFY] [Shell.jsx](file:///Users/apple/Downloads/plasticpulse/src/components/layout/Shell.jsx)
- Change from `flex-row` to `flex-col`
- Replace `<Sidebar />` with `<TopNav />`
- Remove TopBar import

---

### Phase 3: Page Merges

#### 3A: Municipal → WasteMap

#### [MODIFY] [WasteMap.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/WasteMap.jsx)
- Add a tab/section toggle at the top: **"Map View" | "Ward Coverage"**
- **Map View**: existing bin markers, heatmap, drive locations (unchanged)
- **Ward Coverage**: absorb Municipal.jsx's WardMap component, stat cards (Wards Integrated, Avg Response Time, Alerts Resolved), ward detail panel, and overflow response log table
- Both views share the same page — no route change needed

#### [DELETE] [Municipal.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/Municipal.jsx)
- Content moved into WasteMap.jsx

#### 3B: Reports → DriveManager (Community Page)

#### [NEW] [Community.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/Community.jsx)
- Single page with **3 internal tabs**: "Drives", "Reports", "Scoreboard"
- **Drives tab**: absorbs DriveManager.jsx content
- **Reports tab**: absorbs AreaReport.jsx content
- **Scoreboard tab**: absorbs Scoreboard.jsx content

#### [DELETE] [DriveManager.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/DriveManager.jsx)
- Content moved to Community.jsx Drives tab

#### [DELETE] [AreaReport.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/AreaReport.jsx)
- Content moved to Community.jsx Reports tab

#### [DELETE] [Scoreboard.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/Scoreboard.jsx)
- Content moved to Community.jsx Scoreboard tab

---

### Phase 4: Live Feed — ESP32 Camera View + Scan Animation

#### [MODIFY] [LiveFeed.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/LiveFeed.jsx)
- **New section at top: "Live Camera View"**
  - Shows ESP32-S3 camera stream via `<img>` tag pointing to `http://<esp32-ip>:81/stream` (MJPEG) 
  - When no ESP32 is connected: shows a sleek placeholder with pulsing camera icon + "Waiting for ESP32 camera…"
  - ESP32 IP is configurable via a small settings input in the section header
- **Scan Progress Overlay enhancement**:
  - When scan starts (WebSocket `scan_start` message), a large animated circular progress indicator appears overlaid on the camera feed
  - Progress counts from 0→100 with smooth CSS animation (existing ScanProgressOverlay already handles this via WebSocket — just ensure it renders prominently inside the camera section)
- **Data model update**:
  - Replace `kgRecorded` stat card with `Total Items` (item count)
  - Replace `correct_bin` references with `handling_action`
  - Update `DetectionCard` to show `material_category` instead of `plastic_type`

#### [MODIFY] [WebSocketContext.jsx](file:///Users/apple/Downloads/plasticpulse/src/context/WebSocketContext.jsx)
- Add `cameraStreamUrl` state (ESP32 camera URL, stored in localStorage for persistence)
- Add `setCameraStreamUrl` to context value
- Map `plastic_type` → `material_category` in `processMessage` for frontend consistency

---

### Phase 5: Data Model Migration (7 Plastics → 9 Categories)

#### [MODIFY] [learn.json](file:///Users/apple/Downloads/plasticpulse/src/mock/learn.json)
- Replace `resin_codes` array with `categories` array containing all 9 WasteWise categories:
  - Biological, Cardboard, Glass, Metal, Miscellaneous, Paper, Plastic, Textile, Vegetation
- Each category has: `name`, `description`, `examples`, `handling`, `disposal_stream`, `icon_emoji`
- Replace quiz questions — new quiz covers all 9 categories with proper segregation questions

#### [MODIFY] [detections.json](file:///Users/apple/Downloads/plasticpulse/src/mock/detections.json)
- Replace `plastic_type` with `material_category`
- Remove `resin_code`
- Replace `correct_bin` with `handling_action`
- Update sample detections to span all 9 categories

#### [MODIFY] [LearningHub.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/LearningHub.jsx)
- **Remove "Know Your Plastic" section** entirely (the resin code grid + modal)
- **Remove "Plastic Journey Animation"** section (PET bottle lifecycle — plastic-specific)
- **Keep header**, update title to "WasteWise Learning Hub"
- **Rewrite quiz** to cover all 9 categories:
  - New question bank from updated `learn.json`
  - 4-option multiple choice
  - Correct/wrong feedback with explanation
  - Score message updated (remove "PlasticPulse expert" text)
- Replace `plasticpulse_quiz` localStorage key with `wastewise_quiz`

#### [MODIFY] [DetectionCard.jsx](file:///Users/apple/Downloads/plasticpulse/src/components/common/DetectionCard.jsx)
- Display `material_category` instead of `plastic_type`
- Remove resin code badge
- Update category colors to cover all 9 types

#### [MODIFY] [BinStatusPill.jsx](file:///Users/apple/Downloads/plasticpulse/src/components/common/BinStatusPill.jsx)
- Replace `top_plastic_type` with `most_detected_category`

#### [MODIFY] [ScanProgressOverlay.jsx](file:///Users/apple/Downloads/plasticpulse/src/components/common/ScanProgressOverlay.jsx)
- Adapt result display to show `material_category` instead of `plastic_type`
- Support 9-category color mapping

#### [MODIFY] [BinMonitor.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/BinMonitor.jsx)
- Replace `top_plastic_type` with `most_detected_category`

#### [MODIFY] [Analytics.jsx](file:///Users/apple/Downloads/plasticpulse/src/pages/Analytics.jsx)
- Update chart labels from plastic types to material categories
- Update color palette to accommodate 9 categories

---

### Phase 6: Branding Cleanup

All remaining "PlasticPulse" references updated to "WasteWise":

| File | Change |
|------|--------|
| `TopNav.jsx` (new) | Logo alt text + brand name |
| `LearningHub.jsx` | Header title, quiz score message |
| `Community.jsx` (new, from AreaReport) | WhatsApp share text |
| `Community.jsx` (new, from DriveManager) | WhatsApp share text |
| `package.json` (root) | Project name if applicable |
| `index.html` | Page `<title>` tag |

---

## Updated Route Structure

| Route | Page | Content |
|-------|------|---------|
| `/` | LandingPage | Animated landing page |
| `/dashboard` | LiveFeed | Live camera + detection feed |
| `/dashboard/analytics` | Analytics | Charts & deep-dive |
| `/dashboard/map` | WasteMap | Map + Ward Coverage |
| `/dashboard/bins` | BinMonitor | Bin status grid |
| `/dashboard/community` | Community | Drives + Reports + Scoreboard (tabbed) |
| `/dashboard/history` | ScanHistory | Paginated scan log |
| `/dashboard/learn` | LearningHub | Quiz + category reference |

---

## Files Summary

| Action | File Count | Details |
|--------|-----------|---------|
| **NEW** | 3 | `LandingPage.jsx`, `TopNav.jsx`, `Community.jsx` |
| **DELETE** | 5 | `Sidebar.jsx`, `TopBar.jsx`, `Municipal.jsx`, `DriveManager.jsx`, `AreaReport.jsx`, `Scoreboard.jsx` |
| **MODIFY** | ~15 | `App.jsx`, `Shell.jsx`, `LiveFeed.jsx`, `WasteMap.jsx`, `LearningHub.jsx`, `BinMonitor.jsx`, `Analytics.jsx`, `ScanHistory.jsx`, `WebSocketContext.jsx`, `DetectionCard.jsx`, `BinStatusPill.jsx`, `ScanProgressOverlay.jsx`, `learn.json`, `detections.json`, `index.html` |

---

## Verification Plan

### Automated Tests
```bash
npm run dev  # Frontend starts without errors
npm start    # Backend starts without errors (in server/)
```

### Manual Verification
- Landing page renders at `/` with animations
- "Enter Dashboard" navigates to `/dashboard`
- Top nav is centered, all 7 links work
- Live Feed shows camera placeholder when no ESP32 connected
- Facility Map shows both Map View and Ward Coverage tabs
- Community page has 3 working tabs (Drives, Reports, Scoreboard)
- Learning Hub has no resin code content, quiz covers 9 categories
- No "PlasticPulse" text visible anywhere in the UI
- No `resin_code` references in any component
- WebSocket connection still works (status indicator in top nav)
