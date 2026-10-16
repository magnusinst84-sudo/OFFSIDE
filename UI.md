# OFFSIDE — UI Architecture, Design System & User Interface Guide

## 1. Design Philosophy & Aesthetic Blueprint

**OFFSIDE** is styled as an **elite tactical command center / cyberpunk analytics war room**. Its interface delivers mission-critical football telemetry, live match momentum shifts, predictive modeling, and multi-voice generative commentary.

### Visual Design Principles
- **Base Environment**: Deep Void Obsidian (`#050508`). High contrast, low-glare, dark-room tactical command.
- **Card Surfaces**: Layered obsidian and dark graphite (`#0F1117` and `#1A1D27`) with translucent glass borders (`rgba(255,255,255,0.06)`).
- **Telemetry Neon Accents**:
  - **Momentum Green** (`#00FF87`): Positive momentum, live pulses, home team advantage, win probabilities.
  - **Pressure Red** (`#E8003D`): Live match indicators, defensive danger zones, negative momentum.
  - **Electric Cyan** (`#3B82F6`): Midfield transitions, model training metrics, player analysis.
  - **Royal Purple** (`#7C3AED`): AI engine status, upcoming fixtures, machine learning discoveries.
  - **Warning Amber** (`#F59E0B`): Caution states, yellow cards, upset warnings.
  - **Chalk White** (`#F0F4F8`): High-clarity primary typography and scorelines.
  - **Muted Steel** (`#6B7280` / `#94A3B8`): Telemetry labels, venue metadata, timestamps.

### Typography Hierarchy
- **Header & Title Display**: `Space Grotesk` (weights: 600, 700) — Bold, angular, modern geometric display.
- **Body & Content Text**: `Inter` (weights: 400, 500) — High readability for dense analytical reports.
- **Telemetry, Metrics & Badges**: `IBM Plex Mono` / `JetBrains Mono` (weights: 400, 500, 600) — Fixed-width scorebugs, timers, percentages, and status chips.

---

## 2. Core UI Layout & Global Elements

### Persistent Navigation: Floating Command Console (`CommandConsole.tsx`)
A docked bottom command bar (`fixed bottom-6 left-1/2 -translate-x-1/2`) styled with glassmorphism (`backdrop-filter: blur(24px)`):
- **Live Match Telemetry Strip**: Miniature ticker showing live European scorelines, match minutes, and animated red live badges.
- **Navigation Shortcuts**:
  - `[M]` **Match Explorer** (`/matches`): European fixtures filterable by Live, Upcoming, Finished.
  - `[P]` **Player Intelligence** (`/players`): Dynamic player roster with Radar DNA analysis.
  - `[I]` **Model Insights** (`/insights`): Machine learning validation metrics and player impact tables.
  - `[A]` **AI War Room / Assistant** (`/ai`): Tactical analysis and analyst Q&A console.
  - `[S]` **System Settings** (`/settings` or modal toggle): Custom appearance, analyst personalities, motion intensity, notifications.
- **Analyst Voice Quick Switcher**: Instant switching between `broadcast`, `tactical`, `coach`, and `fan`.
- **Keyboard Shortcut Support**: Single key triggers (`M`, `P`, `I`, `A`, `S`) for instant command room traversal.

### Global Notification Toast System
- Rendered in top-right corner with smooth Framer Motion spring physics.
- Statuses: Success (Green `#00FF87`), Warning (Amber `#F59E0B`), Danger / Error (Red `#E8003D`), Tactical (Purple `#7C3AED`).

---

## 3. Page-by-Page UI Breakdown

### 1. Landing Command Center (`/`)
- **Interactive 3D Tactical Pitch Background**: Projected SVG football pitch tilted via `perspective: 1200px` with dynamic player drift nodes and a sweep radar line.
- **Tactical Boot Telemetry Sequence**: Simulated command center diagnostics verifying API and ML health.
- **Hero Operational Metrics**:
  - Model prediction accuracy gauge (`57.6%`).
  - Historical international and club matches indexed (`32,359+`).
  - Real-time live momentum engine tracking.
- **Quick Deployment CTAs**: Immediate entry to Live Matches or Tactical War Room.

---

### 2. Match Explorer (`/matches`)
- **Competition Header Banner**: Highlights premier European competitions:
  - `UCL • UEL • PREMIER LEAGUE • LA LIGA • BUNDESLIGA • SERIE A • LIGUE 1`
- **Competition Status Tabs**:
  - `LIVE`: In-play fixtures with real-time scorelines, match minute, and live pulsing status rings.
  - `UPCOMING`: Next scheduled premier matches with kickoff countdown and stadium location.
  - `FINISHED`: Concluded fixtures with full-time scorelines and outcome breakdown.
- **Interactive Match Card (`MatchCard.tsx`)**:
  - **Fixed dimensions & zero visual overflow**: Strict flex-box truncation preventing long club names from colliding with scorelines.
  - **Scorebug**: Massive fixed-width digits (`36px` mono) with clean colon divider.
  - **Hover Reveal Probability Overlay**: Hovering unveils instant home win, draw, and away win percentages calculated by the XGBoost ML model.

---

### 3. Match Tactical War Room (`/match/[id]`)
The centerpiece match simulation and telemetry view:
- **Header Telemetry Bar (`MatchHeader.tsx`)**:
  - League trophy tag, live match minute, stadium venue.
  - Home and Away club badges with surrounding dual **Momentum Rings**.
- **Interactive Pitch Visualizer (`PitchVisualization.tsx`)**:
  - 2D tactical pitch showing dynamic formations (e.g. `4-3-3`, `4-2-3-1`, `4-3-1-2`).
  - Hoverable player nodes revealing player names, numbers, and tactical coordinates.
- **Live Stats Telemetry Grid (`StatsPanel.tsx`)**:
  - Real-time possession comparison bars.
  - Expected Goals (**xG**) differentials.
  - Total shots, shots on target, corners, fouls, and dangerous attacks.
- **AI Commentary & Tactical Feed (`AIPanel.tsx`)**:
  - Event stream tracking goals, cards, substitutions, and VAR interventions.
  - Multi-voice commentary stream powered by **Gemini 2.5 Flash** (switches dynamically between Broadcast, Tactical, Coach, and Fan personalities).
  - Interactive "Ask Tactical AI" prompt box for customized tactical queries during live play.

---

### 4. Player Intelligence & DNA Engine (`/players` & `/player/[id]`)
- **Roster Explorer (`/players`)**:
  - Filter by tactical position (`Forward`, `Midfielder`, `Defender`, `Goalkeeper`).
  - Real-time search query filtering by player name or club.
  - Player cards showing nationality, club, shirt number, and primary tactical DNA rating.
- **Player Deep-Dive War Room (`/player/[id]`)**:
  - **Hexagonal Radar DNA Chart**: Visualizes Pace, Shooting, Passing, Dribbling, Defending, and Physicality.
  - **Dynamic DNA Metrics**: Normalized stats computing per-90 metrics, goals, assists, minutes, and tactical role suitability.
  - **Historical Benchmark Comparison**: Compares the player's profile against legendary football archetypes.

---

### 5. Model Insights & AI Telemetry (`/insights`)
- **4 Metric Hero KPI Gauges**:
  - Model Accuracy (`57.6%`).
  - Matches Trained (`32,359`).
  - Teams & Clubs Indexed (`336`).
  - Leading Predictor (`ELO DIFF — 44% Feature Weight`).
- **AI Discoveries Carousel**:
  - Analytical findings generated by the ML engine (e.g. home advantage decay, draw recall asymmetry, high-press conversion rates).
- **Player Impact & Form Table**:
  - Sortable statistical table tracking Player Rank, Impact Score, xG, xA, Momentum, and Form Grade.
  - Defensive fallback rendering preventing runtime format errors.
- **Historical Prediction Log**:
  - Transparent audit log of recent model predictions, confidence percentages, and verification outcomes (`correct` / `incorrect`).

---

### 6. System Settings Console (`SettingsPanel.tsx`)
- **Modal Architecture**:
  - Centered floating glassmorphism card (`min(640px, 94vw)`).
  - Sticky header with emerald live pulse indicator and quick `Esc` / `X` dismiss.
  - Non-clipped scrollable settings container with customized obsidian scrollbar.
- **Customization Modules**:
  - **Appearance**: Toggle between *War Room Dark* and *High Contrast Dark*; 5 neon accent color swatches (`#00FF87`, `#3B82F6`, `#7C3AED`, `#F59E0B`, `#E8003D`).
  - **Motion**: Minimal, Standard, and Full animation intensities; Reduced Motion toggle.
  - **Commentary Engine**: Speed slider (*Slow*, *Normal*, *Fast*) and default analyst voice selection.
  - **Live Notifications**: Granular toggles for match kickoffs, momentum spikes, goal alerts, and AI insights.
  - **Accessibility**: High contrast mode, large text, and keyboard shortcut cheatsheet.
  - **State Storage**: Instant client hydration via `localStorage` (`offside-settings`).

---

## 4. UI Component Library Matrix

| Component | Path | Function |
|---|---|---|
| `CommandConsole` | `components/navigation/CommandConsole.tsx` | Bottom persistent HUD dock with live match score ticker & navigation |
| `MatchCard` | `components/match-explorer/MatchCard.tsx` | Telemetry fixture card with win-probability hover overlay & status badges |
| `MatchHeader` | `components/war-room/MatchHeader.tsx` | War Room top bar with scorebug, minute pulse, and venue info |
| `PitchVisualization` | `components/war-room/PitchVisualization.tsx` | Tactical 2D pitch with dynamic player formations & interactive nodes |
| `MomentumRing` | `components/war-room/MomentumRing.tsx` | Circular SVG momentum indicator displaying live flow of pressure |
| `StatsPanel` | `components/war-room/StatsPanel.tsx` | Telemetry metrics: xG, possession, shot distributions, and foul cards |
| `AIPanel` | `components/war-room/AIPanel.tsx` | Multi-personality live match commentary feed & interactive analyst Q&A |
| `PlayerRadar` | `components/player/PlayerRadar.tsx` | Hexagonal tactical DNA radar chart comparing 6 core attributes |
| `LiveBadge` | `components/shared/LiveBadge.tsx` | Pulsing red live badge and stylized status chips |
| `SettingsPanel` | `components/settings/SettingsPanel.tsx` | Tactical settings modal for themes, accents, analyst voices, and audio |

---

## 5. Responsive Design & Accessibility Guidelines

1. **Breakpoints**:
   - Desktop & Ultrawide (`>= 1280px`): Full multi-column tactical command room.
   - Laptop / Tablet (`768px - 1279px`): Stacked sidebar panels with collapsible match explorer.
   - Mobile (`< 768px`): Floating bottom console adapts to compressed tab bar; War Room collapses pitch and stats into tabbed panels.
2. **Accessibility Features**:
   - Native keyboard navigation (`M`, `P`, `I`, `A`, `S`, and `Escape`).
   - High-contrast toggle increasing card border delineation and text luminosity.
   - Reduced motion compliance disabling continuous pitch particle drift and radar sweep animations.
