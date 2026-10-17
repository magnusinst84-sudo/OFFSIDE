# OFFSIDE — UI Architecture, Design System & User Interface Guide

## 1. Design Philosophy & Aesthetic Blueprint

**OFFSIDE** is styled as an **elite tactical command center / cyberpunk analytics war room**. Its interface delivers mission-critical football telemetry, live match momentum shifts, predictive modeling, and multi-voice generative commentary.

### Visual Design Principles
- **Base Environment**: Deep Void Obsidian (`#050508`). High contrast, low-glare, dark-room tactical command.
- **Card Surfaces**: Layered obsidian and dark graphite (`#0F1117` and `#1A1D27`) with translucent glass borders (`rgba(255,255,255,0.08)`).
- **Strict Semantic Color System**:
  - **Brand Accent / Tactical HUD** (`#00FF87`): Brand identity, live pulse badges, primary interactive callouts. Reserved strictly for system UI.
  - **Home Club** (`#38BDF8` - Electric Cyan): Home scoreline digit, home possession bar, home tactical formation nodes.
  - **Away Club** (`#F43F5E` - Rose Coral): Away scoreline digit, away possession bar, away tactical formation nodes.
  - **Draw / Neutral** (`#64748B` - Slate): Draw probability, neutral match states.
  - **Live Indicator** (`#EF4444` - Crimson): Live in-play minute badges and match status rings.
  - **AI / Tactical Intelligence** (`#7C3AED` - Royal Purple): AI engine status, machine learning discoveries, tactical insights.
  - **Warning / Upset** (`#F59E0B` - Amber): Yellow cards, upset alerts, caution states.
  - **Primary Text** (`#F0F4F8` - Chalk White): High-clarity typography and headings.
  - **Muted Steel** (`#94A3B8` / `#6B7280`): Telemetry labels, venue metadata, timestamps, secondary metrics.

### Typography Hierarchy & Type Floor
- **Type Size Floor**: Hard floor of **12px** for all readable body text, labels, and metadata. (10–11px reserved strictly for uppercase micro-badges).
- **Header & Title Display**: `Space Grotesk` (weights: 600, 700) — Bold, angular, modern geometric display.
- **Body & Content Text**: `Inter` (weights: 400, 500) — High readability for dense analytical reports.
- **Telemetry, Metrics & Badges**: `IBM Plex Mono` / `JetBrains Mono` (weights: 400, 500, 600) — Fixed-width scorebugs, timers, percentages, and telemetry counters.

---

## 2. Global Shell & Core Layout Architecture

### Standard Layout Shell (`PageShell.tsx`)
All views (except the fixed full-height War Room) are wrapped in `PageShell` and `PageHeader`:
- **Viewport Constraints**: `max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32`.
- **Bottom Dock Clearance**: Enforced `pb-32` ensures zero overlap between page content and the floating bottom command dock.
- **Consistent Header Hierarchy**: Standardized eyebrow tag (`11px mono uppercase`), page title (`28-36px Space Grotesk`), and description subtitle (`14-16px Inter`).

### Persistent Navigation Dock (`CommandConsole.tsx`)
A docked bottom command bar (`fixed bottom-6 left-1/2 -translate-x-1/2`) styled with glassmorphism (`backdrop-filter: blur(20px)`):
- **Semantic `<nav>` Wrapper**: Accessible landmark navigation with `aria-label="Primary Navigation"`.
- **Floating Tooltips**: Positioned strictly above the dock (`top: -36px`) with Framer Motion spring transitions.
- **Navigation Shortcuts**:
  - `[M]` **Match Explorer** (`/matches`): Top matches filterable by Live, Upcoming, Finished.
  - `[P]` **Player Intelligence** (`/players`): Scouting roster with position filters and DNA analysis.
  - `[I]` **Model Insights** (`/insights`): Machine learning validation metrics and player impact tables.
  - `[A]` **AI Tactical Center** (`/ai`): Multi-voice generative match commentary console.
  - `[S]` **System Settings** (Modal toggle): Appearance, voice switching, animations, notifications.
- **Keyboard Navigation**: Pressing `M`, `P`, `I`, `A`, or `S` triggers immediate navigation or modal activation.

---

## 3. Reusable Primitive Components (`Primitives.tsx`)

- **`ProbabilityBar`**: Tri-state horizontal bar (`Home #38BDF8`, `Draw #64748B`, `Away #F43F5E`) with smooth width transitions and hover tooltips.
- **`StatBar`**: Dual-sided comparative bar for possession and tactical volume metrics.
- **`SegmentedTabs`**: Touch-friendly tab switcher (minimum 36px touch targets) with active indicator and optional counter badges.
- **`FallbackBadge`**: Deterministic status badge indicating mock mode or cached API telemetry.
- **`StatusBadge`**: Unified match state badge (Upcoming neutral, Live pulsing red ring, Finished green check).

---

## 4. Page-by-Page UI Breakdown

### 1. Landing Command Center (`/`)
- **Interactive 3D Tactical Pitch Background**: Projected SVG football pitch tilted via `perspective: 1200px` with dynamic player nodes and an animated radar sweep.
- **Tactical Boot Telemetry Sequence**: Simulated command center diagnostics verifying API connectivity and ML model readiness.
- **Hero Operational Metrics**:
  - Model prediction accuracy gauge (`57.6%`).
  - Historical international and club matches indexed (`32,359+`).
  - Active teams and national sides indexed (`336`).
  - Top predictive factor (`44% Elo differential importance`).
- **Tactical Action Triggers**: High-contrast buttons for entering the War Room or exploring live matches.
- **Tactical Glass Cards**: Styled cards featuring Lucide icons (`Zap`, `Dna`, `Bot`) detailing the Momentum Engine, Player DNA, and AI Center.

---

### 2. Match Explorer (`/matches`)
- **Competition Header**: Filterable by top European competitions (Champions League, Europa League, Premier League, La Liga, Bundesliga, Serie A, Ligue 1).
- **Segmented Status Tabs**: Live, Upcoming, and Finished tabs with real-time match count badges.
- **Refreshed Match Card (`MatchCard.tsx`)**:
  - **3-Column Grid**: Strict `1fr auto 1fr` layout preventing club name collision with scorelines.
  - **Scorebug**: High-visibility score digits in dark obsidian container with colon divider.
  - **Kickoff Timestamps**: Legible date and kickoff time for upcoming fixtures.
  - **Team Identity Dots**: Home (`#38BDF8`) and Away (`#F43F5E`) color dots for instant orientation.
  - **Embedded Probability Bar**: Integrated W/D/L bar on card footer.

---

### 3. Match Tactical War Room (`/match/[id]`)
Fixed-height tactical war room with zero viewport clipping:
- **Header Telemetry Bar (`MatchHeader.tsx`)**:
  - Competition tag, live minute badge with red pulse, stadium venue.
  - Scorebug with 36px bold digits and team color accents.
  - Dual circular **Momentum Rings** flanking each club.
- **2D Tactical Pitch Visualizer (`PitchVisualization.tsx`)**:
  - Desaturated dark green turf (`#0a1710`).
  - **Collision-Proof Coordinate Separation**: Clamps Home players to lower half (Y: 54–92) and Away players to upper half (Y: 8–46) to eliminate midpoint node overlap.
  - Interactive overlay toggles: Formation (`FORM`), High Pressure (`PRESS`), and Passing Lanes (`PASS`).
- **Telemetry Statistics Panel (`StatsPanel.tsx`)**:
  - Expected Goals (**xG**) with team-colored values.
  - Live stat rows with readable 14px mono numbers.
  - Live AreaChart momentum flow comparing home and away pressure trajectories.
- **AI Commentary & Tactical Feed (`AIPanel.tsx`)**:
  - Multi-voice commentary stream powered by **Gemini 3 Flash Live / Gemini 3.8 Live** (Broadcast, Tactical, Coach, Fan).
  - Tactical event timeline (Goals, Yellow Cards, Red Cards, Subs) with hover tooltips.

---

### 4. Player Intelligence & DNA Engine (`/players` & `/player/[id]`)
- **Scouting Roster (`/players`)**:
  - Instant text search across player name, club, and nation.
  - Segmented position tabs: `All Positions`, `Forwards`, `Midfielders`, `Defenders`, `Goalkeepers`.
  - Sort selector (DNA Score, Goals, Name A-Z).
  - 4-column responsive grid with hover border lighting and 28px DNA score badges.
- **Player Deep-Dive Profile (`/player/[id]`)**:
  - **Hexagonal Radar DNA Chart**: Recharts radar enlarged to 320px with bold 11px vertex labels.
  - **Attacking Shot Map**: Half-pitch SVG plotting shot locations, xG circle radii, and outcome colors.
  - **Holographic DNA Card (`DNACard.tsx`)**: 3D flip card with holographic shimmer, attribute bars, and AI impact audit.
  - **Role Fit & Archetypes**: Role suitability percentage bars and benchmark comparison chips.

---

### 5. Model Insights & Telemetry (`/insights`)
- **4 Metric Hero Cards**:
  - Model Accuracy (`57.6%`).
  - Matches Trained (`32,359`).
  - Teams & Clubs Indexed (`336`).
  - Top Predictive Feature (`44% Elo differential importance`).
- **AI Discoveries Carousel**:
  - Categorized tactical discoveries generated by the ML engine.
- **Player Impact & Form Table**:
  - Sortable statistical table tracking Player Rank, Impact Score, xG, xA, Momentum, and Form Grade.
  - Defensive fallback rendering preventing runtime format errors.
- **Historical Prediction Log**:
  - Audit log of recent model predictions with confidence indicators and checkmark/cross outcomes.

---

### 6. System Settings Console (`SettingsPanel.tsx`)
- **Modal Architecture**:
  - Centered floating glassmorphism card (`min(640px, 94vw)`).
  - Sticky header with emerald live pulse indicator and `Esc` / `X` dismiss handlers.
  - Non-clipped scrollable container with customized obsidian scrollbar.
- **Customization Modules**:
  - **Appearance**: Toggle between *War Room Dark* and *High Contrast Dark*; 5 neon accent color swatches.
  - **Motion**: Minimal, Standard, and Full animation intensities; Reduced Motion toggle.
  - **Commentary Engine**: Speed slider (*Slow*, *Normal*, *Fast*) and default analyst voice selection.
  - **Live Notifications**: Granular toggles for match kickoffs, momentum spikes, goal alerts, and AI insights.
  - **Accessibility**: High contrast mode, large text, and keyboard shortcut cheatsheet.
  - **State Storage**: Instant client hydration via `localStorage` (`offside-settings`).

---

## 5. UI Component Library Matrix

| Component | Path | Function |
|---|---|---|
| `PageShell` | `components/shared/PageShell.tsx` | Standard layout wrapper with max-width, horizontal padding, and dock clearance |
| `PageHeader` | `components/shared/PageShell.tsx` | Standardized page header with eyebrow, title, subtitle, and action slots |
| `ProbabilityBar` | `components/shared/Primitives.tsx` | Tri-state Home/Draw/Away win probability bar |
| `StatBar` | `components/shared/Primitives.tsx` | Dual-sided comparative bar for match stats |
| `SegmentedTabs` | `components/shared/Primitives.tsx` | Touch-accessible segmented tab control with count badges |
| `CommandConsole` | `components/navigation/CommandConsole.tsx` | Bottom persistent HUD dock with live match score ticker & navigation |
| `MatchCard` | `components/match-explorer/MatchCard.tsx` | 3-column fixture card with team dots, scorebug, and probability bar |
| `MatchHeader` | `components/war-room/MatchHeader.tsx` | War Room top bar with scorebug, minute pulse, and venue info |
| `PitchVisualization` | `components/war-room/PitchVisualization.tsx` | Tactical 2D pitch with non-overlapping player coordinate halves |
| `MomentumRing` | `components/war-room/MomentumRing.tsx` | Circular SVG momentum indicator displaying live flow of pressure |
| `StatsPanel` | `components/war-room/StatsPanel.tsx` | Telemetry metrics: xG, possession, shot distributions, and momentum flow |
| `AIPanel` | `components/war-room/AIPanel.tsx` | Multi-personality live match commentary feed & interactive analyst Q&A |
| `DNACard` | `components/player/DNACard.tsx` | Holographic 3D flip card with attribute breakdown and AI analysis |
| `LiveBadge` | `components/shared/LiveBadge.tsx` | Pulsing red live badge and stylized status chips |
| `SettingsPanel` | `components/settings/SettingsPanel.tsx` | Tactical settings modal for themes, accents, analyst voices, and audio |

---

## 6. Responsive Design & Accessibility Guidelines

1. **Breakpoints**:
   - Desktop & Ultrawide (`>= 1280px`): Full multi-column tactical command room and 4-column roster grids.
   - Laptop / Tablet (`768px - 1279px`): 2-to-3 column grids with responsive spacing.
   - Mobile (`< 768px`): Floating bottom console adapts to compressed tab bar; full-width stacked layouts.
2. **Accessibility Features**:
   - Native keyboard navigation (`M`, `P`, `I`, `A`, `S`, and `Escape`).
   - High-contrast toggle increasing card border delineation and text luminosity.
   - Type size floor of 12px for all readable text.
   - Reduced motion compliance disabling continuous pitch particle drift and radar sweep animations.
