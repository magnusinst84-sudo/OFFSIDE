# OFFSIDE: UI Specification (Refinement Pass)

Audience: coding agent. Scope: frontend only. This replaces the previous UI doc. Read sections 0 to 3 fully before touching any code.

## 0. Ground rules

- **Frontend only.** Do not modify `backend/`, API routes, response shapes, SWR keys or polling intervals. If a fix needs data the API does not return, do not fake it: hide the element or label it, and list it in your final report under "Needs backend".
- **Stack fixed:** Next.js 16, React 19, TypeScript, Tailwind v4, Framer Motion, Recharts, Lucide, SWR. No new component library. Small additions are fine (`clsx`, `tailwind-merge`, a flag icon set).
- **Keep:** routes, `PageShell`, `PageHeader`, existing primitives, the bottom dock, the near-black background, neon-green accent, Space Grotesk headings, the landing pitch-line background.
- **Change:** how things are grouped (less boxes), how text is styled (less terminal), padding, color meaning, native controls, copy, imagery.
- **Work order, commit after each:** (1) tokens + global CSS, (2) primitives, (3) Match Explorer, (4) Players, (5) Insights, (6) AI page, (7) landing + auth modal + loading splash, (8) War Room / Player detail / Settings (verify against the build; no fresh screenshots were supplied for these).
- **Docs must match the build.** Do not write a feature into any doc unless you have seen it rendered. The previous UI doc claimed a probability bar on match cards (not rendered), named Gemini "3 Flash Live / 3.8 Live" (the project uses Gemini 2.5 Flash), and omitted the sign-in flow entirely.
- **Mobile-first, always.** Design and verify every screen at **390px first**, then scale up to 768, 1024, 1440 and 1920. A change is not done until it works at 390px (no horizontal scroll, 44px touch targets, nothing hover-only, nothing hidden behind the bottom tab bar or keyboard). Section 8 is mandatory, not optional, and its checks apply to every stage.
- **Fix runtime errors first.** The Next.js dev overlay shows "1 Issue" on `/match/[id]`. Open it, find the cause (likely a hydration mismatch or a console error, possibly from settings read from `localStorage`), and fix or report it before any UI work. Do not hide the overlay.
- **Data honesty.** Never render fallback, placeholder or default values as real data. Examples seen in the build: an upcoming match showing possession 52/48, shots 8/6 and xG 1.10/0.80 (identical to a different match); "Elo 1500 vs 1500" (default ratings) driving a win probability; placeholder labels "Player 1" to "Player 11". Label such data ("Estimated", "Limited data") or hide it.
- **Mockups live in the `/mockups` folder at the repo root** (see the Mockup index below). They define look, feel and layout composition. **Where a mockup and this document disagree, this document wins**, and you must list the disagreement under "Deviation notes" in your report. Where neither specifies a visual detail, choose the calmer, more restrained option (fewer borders, less color, more spacing). Do not add elements, effects or copy that neither describes.
- **UI kit page for review.** In stage 2, add a temporary route `/dev/ui-kit` that renders every primitive and pattern from section 4 in all its states (default, hover, selected, disabled, loading, empty) on one page, usable at 390px and 1440px. The owner reviews it before page work continues. Remove the route (or guard it behind `NODE_ENV !== "production"`) before merging.

### Mockup index (`/mockups` folder, repo root)

Files are named by their ID (for example `D3.png`, `M4b.png`); a descriptive suffix after the ID is also fine. Match files by the ID prefix. Open the matching files before building each page. D = desktop, M = mobile.

| ID | Screen | UI.md section |
|---|---|---|
| D1 / M1 | Landing | 5.1 |
| D2 / M2 | Sign-in | 5.2 |
| D3 / M3 | Matches | 5.4 |
| D4 / M4 | War Room, live match | 5.9 |
| D4b / M4b | War Room, upcoming preview (if present) | 5.9 |
| D5 / M5 | Players | 5.5 |
| D6 / M6 | Player detail | 5.11 |
| D7 / M7 | AI Analyst | 5.6 |
| D8 / M8 | Insights | 5.7 |

Settings (5.10) has no mockup; build it from this document.

Rules for using mockups:
- **Composition and style only.** Text inside the images may be garbled or invented. Use the copy in this document and the real data from the API. Names, crests, numbers and percentages in mockups are sample data; never hardcode them.
- If a mockup file for a screen is missing, build that screen from this document alone and say so in the report.
- Do not modify, rename or commit `/mockups`. If it is untracked and not in `.gitignore`, add it to `.gitignore`.
- At each STOP checkpoint, show your screenshots next to the matching mockup and list the differences.

## 1. Diagnosis: why it looks boxy and unprofessional

Observed in the current build:

1. **Everything is a bordered rectangle.** Cards, stat tiles, persona buttons, chips, tabs, table wrappers and inputs all share a 1px border, ~4px radius and the same fill. With no whitespace hierarchy, borders do all the grouping, which reads as graph paper.
2. **Terminal styling on everything.** Monospace, 10-12px, uppercase, wide tracking for labels, tags, tabs, chips and even buttons. It reads as a hacker-terminal template, not an analytics product.
3. **Containers are under-padded.** Labels sit flush against card corners (Insights stat tiles); match cards and the sign-in modal have ~8-12px internal padding.
4. **Repetition without hierarchy.** 100 identical player boxes each with a 28px neon number and a "View DNA" link; 20+ identical match cards with empty lower halves.
5. **Color without meaning.** The four Insights stats use green, cyan, purple and amber. Cyan is the home-team color, purple is AI, amber is warning. Using them as decoration breaks the system the doc claims.
6. **Native controls leaking through.** A bright white horizontal scrollbar under AI Discoveries, white/light-blue autofilled inputs in the sign-in modal, a native-looking sort select.
7. **No imagery.** No team crests, flags, player photos or logo anywhere in the app.
8. **Cyberpunk copy.** "Tactical Access Portal", "OFFSIDE SECURITY LAYER", "operator clearance", "Authenticate", fake boot messages. It makes a serious product feel like a game.

**Design target: broadcast-grade sports analytics.** Dark, calm, typographic. Hierarchy comes from size, weight and whitespace, not boxes. Think Sofascore/FotMob match lists, Opta-style tables, Linear's restraint. The "cyberpunk war room" philosophy in the old doc is the root cause of problems 1, 2 and 8; drop it. The war-room idea survives in the War Room page and the landing background only.

## 2. Rules the agent must follow

### Borders and grouping
- **One level only.** Never put a bordered container inside a bordered container.
- Group with spacing and surface tint first, border last. Cards use `surface-1` with **no border by default** (hairline border only on hover/focus or for modals/popovers).
- List rows and table rows are separated by a single hairline (`border-b`, 5-6% white), not individually boxed.
- Page sections are separated by 48px of space, not rules.

### Radius, spacing, elevation
- Radius: **8px** controls (inputs, buttons), **12px** cards, **16px** modals and hero panels, **full pill** for tabs, chips, badges, tags.
- Spacing scale (4pt): 4, 8, 12, 16, 20, 24, 32, 48, 64.
- Card padding: 20px compact, 24px default. Gap between cards 16-24px. Section gap 48px. Header to content 32px. List row height 56px (44px compact).
- Elevation: surface tint steps (`surface-1` to `surface-2`). Soft shadow only on modals and popovers.

### Typography
- **Space Grotesk** (600/700): page titles, section titles, big numbers.
- **Inter** (400/500/600): everything else, including labels, tabs, buttons, chips, table text and card copy.
- **IBM Plex Mono** (tabular-nums): numbers only: scores, minutes, percentages, xG, Elo, table numerics.
- Uppercase tracked micro-labels are limited to **one eyebrow per page** (11px, 0.06em, muted, sentence content like "Model performance"). Everywhere else use sentence case at 12-14px.
- Floor 12px for readable text. Body 14px. Page title 32px. Section title 18px. Hero number 36-48px.
- Buttons: Inter 14px/600, sentence case ("Enter War Room"), never mono caps.

### Color
- **Accent green `#00FF87`:** primary button fill, active nav/tab marker, focus ring, one hero number per page, live dot. Never as a large-area fill or as the color for 100 repeated numbers. **Selected tabs and chips use an `accent-soft` background with accent text, not a solid green fill. At most one solid-green element (the primary button) per viewport.**
- **Home `#38BDF8` / Away `#F43F5E`:** team identity only (score digits, probability and stat bars, pitch markers, chart series for the two sides).
- **Purple `#7C3AED`:** only for items explicitly labeled AI.
- **Amber `#F59E0B`:** only warnings, cards, upset alerts.
- **Red `#EF4444`:** only the live indicator.
- Stat numbers and table numbers are **white**. Emphasis comes from size and weight.
- Value tiers (e.g. DNA score): 90+ = accent text on `accent-soft` pill; 80-89 = white on neutral pill; below 80 = muted.

### Imagery
- Use team crest/logo and player photo URLs **if they already exist in the API payloads** (API-Football fixtures and players include them). Load with `next/image` (add the media host to `remotePatterns`). Fallback: circle with initials tinted by team color. Nations use flags.
- Use the provided OFFSIDE logo (white wireframe ball + wordmark, as SVG, no navy box) in the header/dock start, landing hero, splash and favicon.

### Native controls
- Global styled scrollbars (snippet below). No visible native horizontal scrollbar anywhere: carousels use arrow buttons and edge fade.
- Autofill override (snippet below).
- Replace native `<select>` with a styled popover select. Keyboard accessible.

### Copy
Plain, professional, sentence case. Banned: "operator clearance", "security layer", "tactical access portal", "authenticate", "CMD_/SYS_" labels, fake "Connected..." status lines. Replacements are listed per page.

## 3. Tokens and global CSS

```css
@theme {
  --color-bg:          #050508;
  --color-surface-1:   #0F1117;
  --color-surface-2:   #1A1D27;
  --color-border:      rgba(255,255,255,0.06);
  --color-border-strong: rgba(255,255,255,0.12);

  --color-text:        #F0F4F8;
  --color-text-muted:  #94A3B8;
  --color-text-faint:  #6B7280;   /* never for essential info */

  --color-accent:      #00FF87;
  --color-accent-soft: rgba(0,255,135,0.12);
  --color-home:        #38BDF8;
  --color-away:        #F43F5E;
  --color-draw:        #64748B;
  --color-live:        #EF4444;
  --color-ai:          #7C3AED;
  --color-warn:        #F59E0B;
  --color-success:     #22C55E;
  --color-danger:      #EF4444;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

```css
/* scrollbars */
* { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.16) transparent; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.14); border-radius: 999px;
  border: 3px solid transparent; background-clip: content-box;
}
::-webkit-scrollbar-track { background: transparent; }

/* autofill */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--color-text);
  caret-color: var(--color-text);
  box-shadow: 0 0 0 1000px var(--color-surface-1) inset;
  transition: background-color 9999s ease-out 0s;
}
```

## 4. Component patterns (replace, do not restyle in place)

| Component | Spec |
|---|---|
| `Card` | `surface-1`, radius 12, padding 24, no border. Hover (if interactive): `surface-2` + hairline border. |
| `SectionHeader` | Title 18px Space Grotesk, muted 14px description, actions right-aligned. No mono eyebrow. |
| `SegmentedTabs` | Pill container on `surface-1`, 4px inner padding, 36px items, active item `accent-soft` background + accent text (never solid green). Optional count in muted mono. Items have 12px horizontal padding, no run-together text. |
| `Chip` (filter) | Full pill, 32px, `surface-1`, 13px Inter. Selected: `accent-soft` bg + accent text. Horizontal scroll with edge fade, no scrollbar. |
| `Badge` / `StatusBadge` | Full pill, 12px Inter 500. Upcoming neutral, Live red dot + red text, Finished muted with check. |
| `Button` | Primary: accent fill, black text, 44px, radius 10, padding 0 20px. Secondary: `surface-2` fill, white text. Ghost: text only. 14px Inter 600. |
| `Input` | 44px, radius 10, `surface-1`, hairline border, 12px left padding (40px when an icon is present, icon absolutely positioned, 16px), accent 2px focus ring. Label above, 12px Inter muted, 8px gap. |
| `Select` | Custom popover, same size as `Input`. |
| `Row` (lists) | 56px, hover `surface-2`, bottom hairline, whole row clickable, chevron appears on hover. |
| `Table` | Sticky header (12px, muted, sentence case), numerics right-aligned mono, 56px rows, hairline row dividers, no outer border. Column widths fixed so columns do not spread across 1350px. |
| `AppHeader` | 56px, transparent over the background; logo + wordmark left; avatar menu right (Settings, Account, Sign out; logged-out: "Sign in" ghost button). Hairline bottom border appears only after scroll. Global search only if wired to real data. |
| `Modal` | Radius 16, padding 32, max-width 420, backdrop blur, focus trap, Esc closes. Stack fields with 16px gaps. |
| `EmptyState` | Centered in the content region, min-height 320, icon + 18px title + 14px muted description + optional action. Never a thin strip above a black void. |
| `Avatar` / `Crest` | 24-40px circle, image or tinted initials fallback. |
| `Skeleton` | Same dimensions as the real element, no layout shift. |

## 5. Page specs

### 5.1 Landing `/`

**Observed:** CTA buttons are tiny mono tags jammed between the subtitle and the stats strip; a pitch node sits on the subtitle text; at some scroll positions the dock covers the feature card titles; feature card text sits tight to the card edge; the primary CTA is now "Authenticate & Enter".

**Do:**
- Single centered column. Eyebrow: "Global football intelligence" (sentence case, 12px, muted, small accent dot). Headline unchanged (Space Grotesk, "Beyond The Scoreline." in accent).
- Subtitle max-width 640px, 18px, muted. Keep background pitch nodes and radar behind a soft radial scrim; **no animated node may cross the text block**.
- CTA group 32px below the subtitle: **Primary "Enter War Room"** (44-48px) and secondary "Explore matches". Remove `CMD_EXECUTE_WAR_ROOM` and `SYS_EXPLORE_MATCHES` captions.
- **Do not put a login wall in front of the demo.** The primary CTA goes straight into the app (guest mode). "Sign in" is a ghost button in a top-right header, not a co-primary CTA. Hackathon reviewers should reach the product in one click.
- Stat strip 64px below the CTAs: four stats in one container, vertical hairline dividers, numbers 32px Space Grotesk white (only 57.6% in accent), labels 12px muted sentence case. No per-stat boxes.
- Feature cards: three `Card`s, gap 24, padding 24, icon in a 40px `accent-soft` circle (Lucide, accent), title 18px, description 14px/1.6 muted. Section has `pb-32` so the dock never overlaps.

### 5.2 Sign-in modal

**Observed:** icon overlaps the modal's top edge; "Anti-spam protected" text touches the Google button; inputs render white/light-blue (browser autofill) and clash with the theme; no spacing between elements; cyberpunk copy.

**Do:** use the `Modal` pattern. Title "Sign in to OFFSIDE". Description "Save your settings and favorite matches." Full-width "Continue with Google" (44px, Google mark + label), a "or" divider with 16px margins, email and password `Input`s with labels above, password show/hide toggle, primary "Sign in", footer "New here? Create an account". Add "Continue as guest" as a secondary button. Autofill override applies. Remove the shield icon, "security layer", "anti-spam" and "operator clearance" copy.

### 5.3 Loading splash

**Observed:** six lines of green mono boot text, partly fake ("Connected...", "Ready...").
**Do:** logo + thin progress bar, 600-800ms, shown once per session (`sessionStorage`), never blocks real data. No status text that does not reflect real state.

### 5.4 Match Explorer `/matches` (approved layout)

**Observed in the old build:** a 3-per-row grid of bordered cards, date repeated per card, empty lower half (no probability bar), a non-functional competition ticker, women's leagues and lower-league cups in a feed described as "top European competitions", thin empty strips for Live and Finished, and Finished returning nothing.

**Target (the approved layout, described fully here):**
- **AppHeader** at the top (section 5.8). Below it: title "Matches" (32px Space Grotesk) and a one-line 14-16px muted description. No green mono competition ticker. No background photos or imagery behind the list.
- **Filters:** `SegmentedTabs` Live / Upcoming / Finished with counts (selected tab uses `accent-soft`, not solid green), then a `Chip` row: All, UCL, UEL, Premier League, La Liga, Bundesliga, Serie A, Ligue 1 (functional, from the existing league data; selected chip uses `accent-soft`). Sticky under the header.
- **Day header:** "Today, Sat 17 Oct" (16px/600), 32px above the first group, with a small **legend on the right** (blue dot Home, slate dot Draw, rose dot Away; 12px muted). Date appears once per day group, never per row.
- **Group header:** a **plain text row**, not a tinted band and not a bordered container: 24px crest + competition name (14px/600) + muted match count. 24px above, 8px below.
- **Rows** inside a container with `max-width: 1120px` (left-aligned under the title; do not stretch rows across 1900px). Grid columns:
  `64px time | 1fr home name (right-aligned) | 28px crest | 32px "vs" | 28px crest | 1fr away name | 240px probability bar | 24px chevron`.
  Row height 56px, hairline divider between rows, hover `surface-2`. Time 14px mono muted; team names 15px Inter 500; "vs" muted 12px.
- **Probability bar:** 240px wide, 6px tall, fully rounded; segments blue / slate / rose; percentages under the segments in 12px mono muted (labels never overlap: if a segment is narrower than 28px, align its label to the segment edge). `aria-label="Home 29%, draw 27%, away 44%"`. **Request predictions lazily for visible rows** (IntersectionObserver); show a skeleton while loading; **hide the bar entirely when no prediction exists**. Never show empty or stuck gray pills.
- **Live rows:** red dot + minute replace the time; the score replaces "vs" (mono, bold, home digit blue, away digit rose). **Finished rows:** final score replaces "vs".
- **Crests** come from the existing API payload (`team.logo`). Fallback: a circle with initials tinted by team color. If the payload has no logos, report it under "Needs backend".
- **Scope decision (pick one; UI and copy must agree):** either filter the feed to the seven listed competitions, or retitle the page "Football matches" and add chips for the other competitions (including Women's, FA Cup). Do not show unrelated fixtures under a "top European competitions" description.
- **Empty states** per tab use `EmptyState` (min-height 320). Finished: add a date-range control (last 7 days). If Finished is empty for every range, report it as "Needs backend".
- Long team names: `truncate` with title tooltip; names never collide with the score or the bar.
- **Mobile (390px) for this page:** `AppHeader` shows logo mark + wordmark left and avatar right; the tabs span the full width; chips scroll horizontally with edge fade; the legend moves under the day header; group headers are sticky. Each match is a **two-line row** (56-72px): line 1 = home crest + name with kickoff time or score right-aligned; line 2 = away crest + name; the probability bar sits full-width (minus 16px padding) under both teams with percentages below. Whole row is tappable; chevron always visible; 44px minimum touch height. Bottom tab bar has 5 labeled items and the list reserves space above it.

### 5.5 Players `/players`

**Observed:** 4-column grid of 100 near-identical boxes; each has a 28px neon-green DNA number, a mono "DNA" caption, a 10px stats line and a repeated "View DNA" link; the search icon overlaps the placeholder text; position tabs run together as plain text; the sort control is native-looking; no photos or flags.

**Do:**
- Replace the grid with a **table**: `# | Player (avatar + name + flag) | Pos | Nation | Goals | Assists | DNA`. Sticky header, sortable columns, 56px rows, whole row is the link (chevron on hover). Remove the per-row "View DNA" link.
- **DNA column:** a 48px pill, 14px mono 600, tiered color per section 2. No 28px neon numbers.
- Controls row: `Input` with search icon (40px left padding, no overlap), position `SegmentedTabs` with counts (All / FW / MF / DF / GK), custom `Select` for sort.
- Show 25 rows per page with "Load more", or virtualize.
- Mobile: rows collapse to avatar + name + position + DNA pill.
- **Mobile (360px) observed:** zero horizontal padding (rows touch both screen edges); "All Positions" wraps onto two lines and "Goalkeepers" is clipped at the right edge; each row is a bordered box with a second bordered strip inside (nested boxes); the search icon overlaps the placeholder; the dock covers the last row. Fix: 16px page padding, position tabs become a horizontally scrollable chip row (All, FW, MF, DF, GK), rows are borderless with hairline dividers, search icon in its own 40px gutter.
- Data check: goals/assists scope looks inconsistent (Mbappé 5 goals while Son Heung-min shows 45; Alphonso Davies 28 assists). Label the column scope in the header tooltip ("Season" or "Career"). If the source is unclear, hide those two columns and report it.

### 5.6 AI Tactical Center `/ai`

**Observed:** the content column is ~825px wide on a 1900px screen, narrower than every other page; the composer input and message counter sit under the dock on a 1117px-tall viewport; "No match selected: go to Matches and click a fixture" is a dead end; suggested chips ("Why is the home team losing momentum?") are meaningless without a match; persona buttons are four boxed rows; a "Messages / Mode" box adds nothing.

**Do:**
- Use `PageShell` (max 1440) so width matches other pages.
- Layout: left rail 320px, chat panel fills the rest. Height `calc(100dvh - header - 112px)` so the composer always sits **above the dock**; the message list scrolls, the composer is pinned.
- Rail: persona radio group as compact rows (no per-row borders; selected row uses `accent-soft` background and accent text). Below it, a **match selector** (searchable `Select` fed by existing live/upcoming matches) plus a "General football chat" option so the page works with no match selected.
- Match context card (when selected): teams, score or kickoff, possession and xG if live. Plain `Card`.
- Suggested prompts: Inter 13px pills. Show match prompts only when a match is selected; otherwise generic ones ("Explain Elo ratings", "How does the model predict draws?").
- Remove the "Messages / Mode" box. The header chip shows only the active persona.
- Suggested copy: keep persona names "Tactical Analyst", "Broadcast", "Former Coach"; consider "Die-hard Fan" instead of "Unhinged Fan" for a professional audience.

### 5.7 Insights `/insights`

**Observed:** four tile boxes with 10px mono labels flush against the card corner and four different number colors; AI Discoveries is a horizontal scroller with a bright white native scrollbar and a clipped last card; discovery cards show confidence percentages (89%, 76%, 94%, 81%, 72%, 68%) with no defined meaning; the Momentum Trends chart is four near-flat lines labeled M1-M8; the impact table is ranked #1 Mbappé 9.2, #2 Messi 9.4 (not sorted by its own metric) and spreads 7 columns across the full width; the prediction log lists "RandomForest v2.3" while the headline is the XGBoost classifier.

**Do:**
- Header: "Model performance" with description "How the XGBoost classifier performs, and what drives it."
- **Stat strip** (one container, hairline dividers, 24px padding): 57.6% (accent), 32,359, 336, 44%. All numbers white except 57.6%. Label above in 12px muted Inter ("Accuracy", "Matches trained", "Teams indexed", "Elo differential importance"); one-line caption below.
- **AI Discoveries:** a responsive 3-column grid of 6 `Card`s (no scroller). Each: small pill tag (purple for AI-labeled), 14px/1.6 text, optional team chips. **Remove the confidence percentages** unless they are real model outputs; if kept, label them "Confidence" with a tooltip defining them.
- **Replace Momentum Trends with real data.** Use per-outcome recall (home win / draw / away win, draw is ~2% as already stated on the page) and a feature-importance bar chart (Elo differential 44% on top). If the API does not return these, remove the chart rather than keep flat lines, and report "Needs backend".
- **Impact table:** sort by the displayed impact value (Messi 9.4 becomes #1); fixed column widths, max-width 960px; numerics right-aligned; form grades as pills; sticky header. If the data is static sample data, show a "Sample data" badge.
- **Prediction log:** use one model name everywhere (take it from the API, not hardcoded). Retitle "Backtest: 2022 FIFA World Cup (sample of 8 matches)". Add predicted vs actual result columns and a Correct / Incorrect pill. **Check for leakage:** if the training set includes these matches, this is in-sample, not validation, and must not sit under a "validated accuracy" headline. Show held-out matches only, or label it clearly.

### 5.8 AppHeader and dock

- **AppHeader** (every page, 56px): OFFSIDE logo + wordmark on the left; avatar button on the right that opens a menu (Settings, Account, Sign out). When logged out, show a "Sign in" ghost button instead of the avatar. Global search is optional: render it only if it is wired to real data, otherwise omit it.
- **Desktop dock:** floating pill, **5 items only**: Home, Matches, Players, AI, Insights. Icons only; **the active item expands to show its label**; the others show a tooltip above on hover or focus. **No Settings and no avatar in the dock** (they live in the AppHeader; the avatar must not appear twice on screen). `nav` landmark with `aria-label`, and an `aria-label` on every icon.
- Keyboard shortcuts stay on desktop: M, P, I, A navigate; S opens Settings.
- The dock never overlaps content: every page reserves `pb-32` or its own clearance. On mobile the dock becomes the bottom tab bar (section 8) with the same 5 items and always-visible labels.

### 5.9 War Room `/match/[id]` (from current-build screenshots: desktop ~1900px, mobile 360x800)

**Observed:**
1. **Header:** team names truncated ("FC Levante Bada…", "Granad. Tenerif…"), the score is `— : —`, the momentum rings are tiny and half-drawn, and competition and venue are ~10px mono. **On mobile the header shows only the competition and the home team name (truncated). The away team and the score are not visible at all.**
2. **Side panels use 8-10px mono text** (win probability, xG, live stats, momentum, AI commentary, the BRO/TAC/COA/FAN persona switcher). Left panel ~265px, right panel ~300px. Unreadable.
3. **The pitch fills ~70% of the width and the full height**, and the dock overlaps its bottom.
4. **Marker layout bug (logic, not styling):** the home (blue) team is mis-laid-out: the goalkeeper sits on the halfway line, defenders share a row with forwards, the bottom third of the pitch is empty, and markers 2, 5 and 7 are hidden under others. Away (rose) is laid out correctly.
5. **Placeholder labels:** "Player 1" to "Player 11" at 16px on desktop and ~6px on mobile; they collide with the markers. No real lineup names exist.
6. **Fallback data shown as live:** this is an upcoming match, yet it shows possession 52/48, shots 8/6, on target 3/2, corners 4/3, fouls 10/12 and xG 1.10/0.80, identical to a different match seen earlier. The Elo line says "1500 vs 1500" (default ratings), so win probability 48 / 32 / 21 (sums to 101) is not a real prediction. The AI commentary says "the tactical block is shifting rapidly" for a match that has not kicked off.
7. Momentum flow shows "Awaiting match data…" at 8px; the events timeline axis is empty.
8. Mobile: the dock overlays the pitch and crowds 7 icons.

**Target, desktop (1024px and up):**
- **Layout:** scoreboard full width on top; below it two columns: **pitch column** (about 7/12, centered, max 640px wide, aspect ratio kept, height `calc(100dvh - 56px header - scoreboard - 112px dock)`) and **panel column** (about 5/12, min 380px, scrolls independently). Panels are stacked sections separated by 32px of space and hairlines, not boxes.
- **Scoreboard:** home crest + **full team name** (wraps to two lines, never truncated) | score | away crest + name. Live/finished: score digits 56px mono (home blue, away rose). Upcoming: kickoff time + "Kick-off in 3h". Status pill: red `LIVE 67'`, neutral `Upcoming`, muted `Full time`. Competition and venue on one 13px muted line below. Remove the momentum rings from the header.
- **State-aware content:**
  - *Upcoming:* **match preview.** Show win probability (with a "Limited data" badge when either team has the default 1500 rating; hide it if there is no real model output), Elo differential, and lineups only if announced (otherwise an empty state "Lineups not announced yet" with faint formation outlines, never "Player N"). Hide live stats, momentum and events, with the line "Available when the match starts." The AI panel offers a pre-match preview.
  - *Live:* everything below.
  - *Finished:* final score, final stats, events, AI recap.
  - *Fallback data:* every section fed by fallback data shows a `FallbackBadge` ("Estimated data"). **Never show stats for an upcoming match.** If the API gives no fallback flag, report "Needs backend: fallback flag".
- **Win probability:** full-width `ProbabilityBar`; labels "Home 48% / Draw 32% / Away 21%" rounded with the largest-remainder method so they sum to exactly 100. Elo line only with real ratings; otherwise "Not enough rating history for these teams."
- **Pitch rules:**
  - Surface `#0a1710`, lines at 12% white. Markers 28-32px (24px on mobile): team color at 15% fill with a 2px team-color ring, jersey number 12px mono 600; goalkeepers get an extra outer ring.
  - **No names on the pitch by default.** Show a name tooltip on hover/focus (tap opens a bottom sheet on mobile), only when real lineup names exist. Never render "Player N".
  - **Layout algorithm:** away team in the top half (y 6-47%), home in the bottom half (y 53-94%). Rows follow the formation string (4-3-3 = GK, 4, 3, 3). **Goalkeeper nearest its own goal** (home y~92%, away y~8%), then defenders, midfielders, forwards progressing toward the halfway line with equal row spacing; players within a row are evenly spread with 10% side padding; minimum 36px between marker centers (24px on mobile), scaling the pitch if needed. Add a unit test: formations 4-3-3, 4-4-2, 3-5-2, 4-2-3-1 and 5-3-2 produce no overlapping markers at 360px and 1440px widths, for both teams.
  - Formation legend above the pitch ("4-3-3 vs 4-3-3" with team dots, 13px). Overlay toggles are chips "Formation / Pressure / Passing" (13px; horizontally scrollable on mobile). The ball dot only when live.
- **Momentum:** 96px ring with value and "Home pressure" / "Away pressure", plus a Recharts area sparkline over time (home blue above 50, away rose below). Empty state: "Momentum appears once the match starts."
- **Live stats:** `xG` pair at 24px mono; then `StatBar` rows (Possession, Shots, On target, Corners, Fouls, Yellow cards, Red cards, Attacks), 40px rows, labels 13px centered, values 14px mono.
- **Events:** vertical timeline, minute in mono on the spine, icon per event type, team side by position and color; empty state when none.
- **AI commentary:** full-width `SegmentedTabs` with full names (Tactical / Broadcast / Coach / Fan, at least 13px); messages 14px/1.6 with relative timestamps; "Ask the analyst" button that opens `/ai` with this match preselected.

**Target, mobile (390px; also verify 360px):**
1. `AppHeader` with a back chevron to Matches.
2. **Compact scoreboard that always shows both teams and the score/time:** `home crest + name | score | away crest + name`, names may wrap to two lines (15px), status pill under the score. Never truncate to one visible team.
3. Probability bar, full width.
4. Sticky `SegmentedTabs`: **Pitch / Stats / Events / AI**, each at least 44px high, default Pitch.
5. *Pitch tab:* pitch scaled to the width (16px side padding), sized so the tab bar does not cover it; 24px markers, numbers only; tap a marker for a bottom sheet.
6. *Stats tab:* momentum ring + sparkline, xG, StatBars.
7. *Events tab:* timeline.
8. *AI tab:* persona chips scroll horizontally, messages fill the height, composer pinned above the bottom tab bar.
9. No text under 12px anywhere on the page.

### 5.10 Settings (modal on desktop, bottom sheet on mobile)

**Observed:**
1. **Desktop:** the modal is **not centered**; it sits in the lower right of the viewport (about x 946-1546, y 617-1070 on a 1903x1160 window).
2. **Mobile (360px):** the modal is positioned off-screen to the right; its right half (toggles, close button, the High Contrast option, the last accent swatches) is cut off and unreachable. **Settings is unusable on mobile.**
3. All text is 8-10px mono uppercase with almost no padding.
4. **Controls do not match the app state:** Appearance shows "High Contrast Dark" selected and an orange accent selected, yet the app renders in green, and the "High Contrast" toggle under Accessibility is off. Either the settings are not applied or two controls overlap.
5. "Commentary speed" shows only "SLOW NORMAL FAST" labels with no visible control.
6. Four identical neon toggles dominate the panel. Some toggles (notifications, keyboard shortcuts) may not do anything.

**Target:**
- **Desktop:** centered modal, 560px wide, radius 16, padding 24, `max-height: 85dvh`, backdrop blur, focus trap, Esc closes. Sticky header: "Settings" (20px Space Grotesk) + close button. The body scrolls. **Mobile:** bottom sheet (drag handle, 90dvh max, safe-area padding, same content), always fully inside the viewport at 360px.
- **Structure:** section titles in sentence case (14px/600), each followed by its controls with 16px gaps; sections separated by 32px of space, no boxes.
  1. **Appearance:** *Theme* as `SegmentedTabs` "Standard dark / High contrast" (a single control; **remove the duplicate "High Contrast" toggle** under Accessibility). *Accent color:* five 32px swatches with a checkmark on the selected one and a name tooltip. **The accent must actually apply:** set `--color-accent`, `--color-accent-soft` and a per-swatch `--color-on-accent` on `:root` from state, and check contrast for each (black text on green/orange, white on blue/purple/red). Home, away, draw, live, warn and danger tokens never change with the accent.
  2. **Motion:** `SegmentedTabs` Minimal / Standard / Full; "Reduce motion" toggle (default follows the OS `prefers-reduced-motion`; when on, it forces Minimal and says so).
  3. **Commentary:** speed as `SegmentedTabs` Slow / Normal / Fast; default analyst as `SegmentedTabs` with full names.
  4. **Notifications:** toggles with a 13px muted description under each (Match start, Momentum spike, Goal alert, AI insight). **If there is no working notification delivery, show them disabled with "Coming soon" or remove them. Do not ship toggles that do nothing.**
  5. **Accessibility:** "Large text" toggle (root font-size 112.5%; verify layouts at 390px); "Keyboard shortcuts" becomes a read-only list on desktop (M Matches, P Players, I Insights, A AI, S Settings), hidden on touch.
  6. Footer: "Reset to defaults" ghost button.
- **Toggle style:** 40x24 pill; off = `surface-2` with muted knob; on = `accent-soft` track with accent knob. Not a solid neon fill.
- Keep the storage key `offside-settings`. Apply stored settings before first paint (inline script or equivalent) so there is no flash and no hydration mismatch.

### 5.11 Player detail `/player/[id]` (from current-build screenshots: desktop ~1900px, mobile 360x800)

**Observed:**
1. **Mobile has zero horizontal padding.** Cards and the stats table touch both screen edges. The "Back to roster" row, search field and eyebrow are 12px mono caps.
2. **The DNA score appears twice and the name appears twice:** once in the identity card (96, huge neon) and again in the "Player DNA" flip card (96, "Kylian Mbappé", "France") directly under the page title.
3. **The flip card shows only 4 of 6 attributes** with truncated labels ("DRIBBL", "PASSIN", "SHOOTI"), has about 40% empty space at the bottom, and hides its content behind "Click card to flip for AI audit". Content behind a flip is undiscoverable (judges will not click it) and is not visible on mobile screenshots.
4. **The avatar is a gray box with an initial ("K")**, not a photo or a styled initials circle.
5. **The radar is ~230px, not the 320px the agent's doc claims,** with 9px axis labels, abbreviated names ("PHYSIC", "DEFEND", "DRIBBLE") and no value labels.
6. **The shot map is a wide dark-green band with a small pitch drawn inside it** (desktop), and on mobile the legend is clipped at the right edge ("Off" is cut). **Shot colors collide with the team colors:** blue = "Saved" (the home color) and rose = "Off" (the away color).
7. **Shot locations look wrong:** all ~13 shots, including every goal, sit outside the penalty area and along the bottom edge of the half pitch. That is implausible for a clinical finisher and suggests an inverted or mis-scaled coordinate mapping.
8. **Role-fit bars are cyan** (previously purple); cyan is the home-team color, so it carries false meaning.
9. **Strengths and vulnerabilities share one bordered box with an inner divider** (nested boxes); vulnerabilities use a red X (red collides with away/danger meaning).
10. **Ragged layout (desktop):** three columns of different heights (left ends ~660px, center ~755px, right ~580px) with ~300px of empty black space below. Everything is a bordered box with 9-10px mono labels.
11. "Search another player" is a tiny 10px field in the top right; the "Tier 1" chip has no definition.
12. On mobile the dock overlaps the radar.

**Target, desktop (1024px and up):**
- **Header row:** back link "← Players" (14px sans) above; below it a **96px circular avatar** (player photo from the payload if present, otherwise an initials circle on `surface-2`), name (Space Grotesk 32px), a meta line in 14px muted ("France · Forward · #10 · 27 yrs · 178 cm"), and a `Badge` "Tier 1" (add a tooltip defining the tier only if the data defines it; otherwise remove the badge). On the right: the **DNA score as the one hero number**: "96" in accent, Space Grotesk 56px, with a 12px muted label "DNA score". Remove the second "96", the second name and the flip card. A 40px "Search player" `Input` (280px, icon in its own gutter) sits at the far right of the back-link row.
- **Layout:** two columns below the header, 48px section gaps: **main (7/12)** and **side (5/12)**. Columns end at similar heights; no large empty region.
- **Main column:**
  1. *Attribute profile* in a `Card`: radar at **360px** (Recharts `RadarChart`, fixed 0-100 scale), axis labels **full words at 13px Inter** (Pace, Dribbling, Passing, Shooting, Defending, Physicality), **value label at each vertex** (12px mono), fill accent at 15% with a 2px accent stroke, grid at 8% white. Beside or below it, a **list of all six attributes** (label, 6px bar, value in mono), consistent with the radar. This list replaces the flip card.
  2. *Shot map* in a `Card` with 20px padding: a **half-pitch SVG (reuse the War Room `Pitch` component), max 480px wide, centered, not full-bleed**; goal at the top. A summary line above it ("13 shots, 5 goals, 4.30 xG") that **matches the stats list**. Encoding that does not use team colors: **goal = filled accent circle, on target / saved = white ring (transparent fill), off target = muted gray ring**; circle size scales with xG (10-28px); overlapping circles at 70% opacity. Tooltip on hover/tap with only the fields the payload has (xG, minute, opponent, body part). Legend below the map, 12px, never clipped. **Verify the coordinate mapping** (scale and axis direction) against the data source; if you cannot confirm it, label the map "Approximate shot locations" and report it under "Needs backend / data".
- **Side column (no boxes, hairline dividers):**
  1. *Stats* (title shows scope, e.g. "Stats, 270 minutes"): rows Goals, Assists, xG, xA, Minutes; labels 14px muted, values 14px mono 600 white, 48px rows.
  2. *Strengths* (accent check icons) and *Vulnerabilities* (amber alert-triangle icons, not a red X) as two separate lists, 14px/1.6.
  3. *Role fit*: bars sorted descending, accent fill on a `surface-2` track, label left, value right in mono; the top role in white bold. No cyan or purple.
  4. *Similar players*: chips with a 24px avatar and name; each chip links to that player. No arrow glyphs.
  5. *AI audit*: if the old flip card's back face has text, show it here as a visible paragraph section labeled with a purple "AI" pill; if there is no such content, omit the section.

**Target, mobile (390px; also verify 360px):**
1. `AppHeader` with a back chevron to Players (44px tap target); remove the separate "Back to roster" row. Page padding **16px**.
2. Identity: 64px avatar, name (Space Grotesk 28px), meta line (wraps), Tier badge.
3. DNA score row: "96" (accent, 48px) + "DNA score" label.
4. Stats as a 3-column grid without boxes: number 20px mono over a 12px muted label (Goals, Assists, Minutes, then xG, xA).
5. Radar at `min(100%, 320px)`, centered, values at vertices; the six-attribute list under it.
6. Shot map full width inside the padding, legend wraps below, summary line above.
7. Strengths, Vulnerabilities, Role fit, Similar players (chips wrap), AI audit: stacked, 32px between sections, content clear of the bottom tab bar (`pb-32`).
8. No text under 12px; no horizontal scroll.

## 6. Component inventory: what changes

| Component | Change |
|---|---|
| `PageShell`, `PageHeader` | Keep. Header drops the mono eyebrow except one per page. |
| `SegmentedTabs` | Pill container, 4px padding, spacing between items (currently runs text together). |
| `ProbabilityBar`, `StatBar` | Keep. Add to match rows. Must not render when no data. |
| `MatchCard` | Replace with `MatchRow` grouped by competition. |
| Player card grid | Replace with `PlayersTable` + `DnaPill`. |
| `CommandConsole` (dock) | 5 items only, label on the active item, Settings and account move to `AppHeader`, clearance rules. |
| `AppHeader` | New: logo, avatar menu (Settings, Account, Sign out), optional search. |
| `AIPanel`, chat page | Full-height layout, match selector, general mode. |
| Insights stat tiles | Replace with one `StatStrip`. |
| AI Discoveries carousel | Replace with a grid. |
| Momentum Trends chart | Replace with real per-class recall and feature importance, or remove. |
| Auth modal | Rebuild with `Modal` + `Input` patterns; add guest mode. |
| Boot sequence | Replace with logo splash. |
| `PitchVisualization` | Fix formation layout (GK nearest own goal, rows by formation, no overlaps), numbers only, names on hover/tap, 24-32px markers. |
| `MatchHeader` | Full team names (wrap), real scoreboard, state-aware (upcoming / live / finished), rings removed from the header. |
| `StatsPanel`, `AIPanel` | Readable type, no nested boxes, preview / live / recap modes, fallback badges. |
| `SettingsPanel` | Centered modal and bottom sheet, working accent, one contrast control, no dead toggles. |
| `DNACard` (flip card) | Remove. DNA score moves to the header; the six attributes become a visible list beside the radar; AI audit text becomes a visible section. |
| Radar chart | 360px desktop / 320px mobile, full-word labels, vertex values. |
| Shot map | Reuse the `Pitch` SVG half-pitch, max 480px in a card, goal/on target/off target encoding without team colors, verified coordinates, legend never clipped. |

## 7. Definition of done

- [ ] No bordered container sits inside another bordered container.
- [ ] Mono font appears only on numbers (verify by searching `font-mono` usage).
- [ ] No readable text under 12px; uppercase tracked text appears at most once per page.
- [ ] Every container has at least 20px padding; no label touches a container corner.
- [ ] No native scrollbar, native select or white autofill visible; the AI Discoveries scroller is gone.
- [ ] Insights stats use white numbers with one accent; cyan/purple/amber appear only with their meaning.
- [ ] Crests/flags/avatars present wherever the API provides them; initials fallback elsewhere.
- [ ] Match Explorer is grouped rows with plain group headers; list max-width 1120px; date once per day group; legend present; W/D/L bar or nothing; copy matches the feed's scope.
- [ ] At most one solid-green element per viewport; selected tabs and chips use `accent-soft`.
- [ ] War Room: both teams and the score are visible at 360px; no markers overlap for 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2; no "Player N" labels; no stats shown for upcoming matches; fallback data is labeled.
- [ ] Settings is fully usable at 360px (bottom sheet); the accent swatch visibly changes the UI; no duplicate contrast controls; no toggles that do nothing.
- [ ] Player detail: DNA score and name appear once; no flip card; all six attributes with full labels; radar values visible; shot map in a card with a legend that is never clipped; no cyan/purple role bars; 16px padding at 360px.
- [ ] Every built page was compared against its mockup in `/mockups` (when present) and all differences are listed under "Deviation notes".
- [ ] The Next.js dev overlay shows no issues on any route.
- [ ] Dock has 5 items with the label on the active item only; Settings and Account live in the `AppHeader`; no duplicate avatar.
- [ ] Players is a table; DNA is a tiered pill, not 28px neon.
- [ ] AI composer is always above the dock at 1080px and 768px heights; works with no match selected.
- [ ] Landing: guest path in one click; CTAs have 32px+ clearance; no node over text.
- [ ] No cyberpunk copy remains (search for "operator", "authenticate", "security layer", "CMD_", "SYS_").
- [ ] Impact table is sorted by its displayed metric; one model name everywhere.
- [ ] Final report: before/after screenshot of each route, plus a list "Needs backend / data" for anything that could not be fixed in the frontend.

## 8. Responsive and mobile (required, not optional)

Every page must be designed mobile-first and verified at 375, 390, 768, 1024, 1440 and 1920px widths. The earlier spec treated mobile as an afterthought; the sections above describe the desktop layout, and this section overrides them below 768px.

### Global
- **Dock becomes a bottom tab bar** below 768px: full width, 64px tall, `safe-area-inset-bottom` padding, **5 items max** (Home, Matches, Players, AI, Insights). Move Settings and Account into a header avatar menu. Eight icons do not fit at 375px. Labels visible under each icon (11px), active item in accent.
- **AppHeader on mobile:** 56px, logo mark + wordmark left, avatar button right (menu: Settings, Account, Sign out). Optional search appears as an icon that opens a full-screen search sheet, only if wired to real data.
- Desktop floating pill dock stays at 768px and above. Keyboard shortcuts (M/P/I/A/S) are desktop-only; do not show hints on touch.
- **Touch targets at least 44x44px** (tabs, chips, rows, icon buttons, table sort headers).
- **Nothing may depend on hover.** Tooltips, row chevrons, pitch-marker details and the DNA card flip all need a tap/focus equivalent. Row chevrons are always visible on mobile.
- Page padding 16px on mobile. Use `100dvh` (not `100vh`) for full-height layouts; reserve space for the tab bar and safe areas. The AI composer must sit above the tab bar and above the on-screen keyboard.
- Modals become **bottom sheets** on mobile (radius 16 top corners, drag handle, max-height 90dvh, scrollable body, safe-area padding).
- Body text stays at least 14px, labels at least 12px. No horizontal page scroll. Wide content scrolls inside its own container.
- Disable heavy effects on mobile and under `prefers-reduced-motion`: the 3D tilted pitch (`perspective`), radar sweep and particle drift. Show a static pitch background instead.

### Per page
- **Landing:** hero headline 36-40px, CTAs stacked full-width (primary on top, 48px), stat strip becomes a 2x2 grid, feature cards single column with 16px gaps.
- **Matches:** tabs full width; competition chips horizontally scrollable with edge fade; rows become two lines: line 1 `home crest + name` and score/time right-aligned, line 2 `away crest + name` and the W/D/L bar. Group headers sticky. Date once per group.
- **Players:** table becomes a list: avatar + name + flag + position on the left, DNA pill on the right, goals/assists on a small second line. Search and position tabs stack; sort moves into a bottom-sheet select. Sticky filter bar.
- **Player detail:** see section 5.11 (mobile target): single column, 16px padding, identity then DNA score, 3-column stats grid, radar with a six-attribute list, shot map with a wrapping legend, then strengths, vulnerabilities, role fit and similar players.
- **War Room:** see section 5.9 (mobile target): scoreboard with both teams always visible, probability bar, sticky Pitch / Stats / Events / AI tabs, pitch scaled to the width with no overlapping markers, tap-to-open bottom sheet for players.
- **AI:** persona selector becomes a horizontally scrollable chip row at the top; match selector is a compact button that opens a bottom sheet; chat fills the remaining height; suggested prompts scroll horizontally above the composer; composer pinned above the tab bar.
- **Insights:** stat strip becomes 2x2; discovery cards single column; charts full width with at least 12px labels; tables become stacked rows (label/value pairs) or scroll inside a container with a sticky first column; no 7-column tables squeezed into 375px.
- **Sign-in:** bottom sheet, 44px inputs, Google button first, "Continue as guest" visible without scrolling.

### Mobile checks (add to Definition of done)
- [ ] No horizontal page scroll at 375px on any route.
- [ ] All interactive elements at least 44px; nothing hover-only.
- [ ] Bottom tab bar has at most 5 items; Settings and Account live in the header menu.
- [ ] War Room, AI and Players are fully usable one-handed at 390x844 without overlapping the tab bar or keyboard.
- [ ] Modals are bottom sheets on mobile.
- [ ] Before/after screenshots at 390px for every route in the final report.