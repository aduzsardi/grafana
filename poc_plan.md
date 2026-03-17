# Grafana Visualization Panel PoC — Claude Code Plan

## Context & Goals

This is a proof-of-concept for the redesign of Grafana's visualization editor panel. The goal is to demonstrate a vision to executive stakeholders. It does **not** need to be production-ready — functional with acceptable rough edges is the target bar.

**Scope:** TimeSeries and Gauge panel types only.  
**Branch:** Already created off main — work exclusively on this branch.  
**Approach:** Build in 5 progressive phases. Complete and review each phase before starting the next.

---

## Phase 1 — Options Panel Redesign (Vertical Sidebar)

### Goal
Replace or wrap the existing flat options panel with a new layout featuring a **vertical icon sidebar** on the left that controls which section is active in the main options area.

### Sidebar Sections (icons + labels)
1. **AI** — natural language prompt input (stubbed for now, wired in Phase 3)
2. **Styles** — quick styles / presets (existing presets surface here)
3. **Options** — the existing panel options UI (moved here)
4. **Overrides** — field overrides (existing overrides, moved here)

### Implementation Notes
- Identify where the existing panel edit options are rendered in the codebase. This is likely in `public/app/features/panel/components/` or similar. Locate the `PanelEditor` or `OptionsPaneContent` component.
- Create a new wrapper component: `VizOptionsSidebar`. It should render:
  - A narrow left rail (~48px wide) with icon buttons for each section
  - A main content area to the right that renders the active section
  - Default active section: **Options**
- Do **not** delete or break the existing options rendering — wrap or conditionally render it inside the "Options" section of the new sidebar.
- Use Grafana's existing icon set and design tokens (from `@grafana/ui`) wherever possible to stay consistent.
- Add a feature flag (e.g. `vizOptionsSidebarEnabled`) so this can be toggled on/off without affecting the rest of Grafana. Gate all new rendering behind this flag.
- Stub out the AI and Styles sections with placeholder text for now.

### Acceptance Criteria
- [ ] Vertical sidebar renders in the panel editor for TimeSeries and Gauge panels
- [ ] Clicking each icon switches the active section
- [ ] Existing options and overrides still work when accessed through the new sidebar
- [ ] Feature flag can disable the new sidebar and restore default behavior
- [ ] No console errors or memory leaks

---

## Phase 2 — More Categorical Color Options

### Goal
Introduce additional accessible, "battle-tested" categorical color palettes alongside Grafana's existing default palette. Start with **Paul Tol's palettes** and at least one other popular option.

### Palettes to Implement
1. **Paul Tol — Bright** (7 colors) — `#4477AA #EE6677 #228833 #CCBB44 #66CCEE #AA3377 #BBBBBB`
2. **Paul Tol — Muted** (10 colors)
3. **Tableau 10** — widely recognized, accessible default in many BI tools
4. Keep Grafana's existing **Classic palette** as the default

### Implementation Notes
- Locate where categorical/series color palettes are defined. Likely in `public/app/core/utils/colors.ts` or `packages/grafana-ui/src/utils/colorsPalette.ts`.
- Add the new palettes as named entries in the palette registry.
- In the new **Styles** section of the Phase 1 sidebar, add a palette picker UI:
  - Show swatches for each palette
  - Allow the user to select one, which applies it as the active categorical color scheme for the panel
- Scope palette selection to the individual panel (panel-level option), not global.
- Ensure palette choices are accessible (check contrast ratios where applicable).

### Acceptance Criteria
- [ ] At least 3 palettes available (Classic, Paul Tol Bright, Tableau 10)
- [ ] Palette picker renders in the Styles section of the sidebar
- [ ] Selecting a palette updates the TimeSeries or Gauge panel in real time
- [ ] Selection persists when the panel is saved

---

## Phase 3 — Embedded AI Capabilities (Natural Language Panel Config)

### Goal
Allow users to describe a visualization in plain English and have the system apply the appropriate panel type, style, and options automatically.

### Example Prompts to Support
- *"Switch to gauge, arc style, with three thresholds: 0–30% red, 31–60% yellow, 61%+ green"*
- *"Make this a time series, use the Tableau 10 palette, show legend at the bottom"*
- *"Set the title to 'CPU Usage', add a unit of percent"*

### Implementation Notes

#### AI Provider (keep flexible)
- Create an abstraction layer: `VizAIProvider` interface with a single method: `complete(prompt: string, panelContext: PanelContext): Promise<VizAIResponse>`
- Implement a concrete class for **Anthropic Claude** (via `fetch` to `https://api.anthropic.com/v1/messages`) as the first provider
- Leave a clear stub for OpenAI and for Grafana's LLM plugin (`@grafana/llm`) so it's easy to swap in later
- API key for the PoC can be read from a Grafana config/env variable — document this clearly

#### AI Response Format
- Prompt the model to respond in structured JSON representing a partial panel options diff:
  ```json
  {
    "panelType": "gauge",
    "options": { "reduceOptions": { "calcs": ["lastNotNull"] } },
    "fieldConfig": {
      "defaults": {
        "thresholds": {
          "steps": [
            { "color": "red", "value": 0 },
            { "color": "yellow", "value": 31 },
            { "color": "green", "value": 61 }
          ]
        }
      }
    }
  }
  ```
- Deep-merge the response into the current panel model using Grafana's existing panel update mechanisms

#### UI
- Wire up the **AI section** in the Phase 1 sidebar
- Render a text area for the prompt + a "Apply" button
- Show a loading state while the API call is in flight
- Show a simple diff/preview of what changed after applying (optional but impressive for the demo)
- Add an "Undo" button that reverts to the pre-AI state

### Acceptance Criteria
- [ ] User can type a natural language prompt and click Apply
- [ ] Panel type, options, and field config update based on the AI response
- [ ] Loading and error states are handled gracefully
- [ ] Provider abstraction makes it easy to swap AI backends
- [ ] Undo reverts the panel to its prior state

---

## Phase 4 — Overhaul of Options Styling

### Goal
Replace the long flat list of inputs in the Options section with a more visually semantic and modern UI. Reference: Figma's right-side properties panel (visually self-referential controls, grouped sections, icons on inputs).

### Implementation Notes
- Focus on the **most-used options** for TimeSeries and Gauge only — do not attempt to restyle all panel types
- For **TimeSeries**, prioritize: Line style, Fill opacity, Point size, Legend mode, Tooltip mode
- For **Gauge**, prioritize: Gauge mode (basic/arc/retro LCD), Min/Max, Thresholds, Text size
- Replace plain text inputs with purpose-built controls where it adds clarity:
  - Line style → segmented button group (solid / dashed / dotted) with a small preview line
  - Legend placement → icon button group (bottom / right / hidden) with layout icons
  - Gauge mode → card-style selector with a small visual thumbnail of each mode
  - Fill opacity → a slider with a live preview swatch
- Group related options under collapsible sections with clear headings
- Use `@grafana/ui` components wherever possible; only create custom components where no equivalent exists

### Acceptance Criteria
- [ ] Restyled options render for TimeSeries and Gauge panels in the Options section
- [ ] All restyled controls are functional (not decorative)
- [ ] Existing options not yet restyled are still accessible (fall back to original rendering)
- [ ] No regressions in existing panel behavior

---

## Phase 5 — Overhaul of Option Overrides UI

### Goal
Make field overrides more discoverable and easier to use. Surface them in the dedicated Overrides section of the sidebar (already placed there in Phase 1) and improve the override creation/editing experience.

### Problems to Solve
1. **Discoverability** — overrides were hard to find; the sidebar already fixes this
2. **Long dropdowns** — users must scroll through many options with no visual reference
3. **No examples** — users don't know what an override will look like before applying it

### Implementation Notes
- In the **Overrides section** of the sidebar, render existing overrides as styled cards — one card per override rule
- Each card should show: the field matcher (e.g. "Fields with name: cpu_usage"), the override property, and the value
- Add an **"Add Override"** button that opens a guided flow:
  1. Step 1: Pick a field (show actual field names from the current data frame, not a generic dropdown)
  2. Step 2: Pick an override property — render these as a visual grid of option tiles, each with a small icon or preview (e.g. color swatch for "Series color", a line preview for "Line width")
  3. Step 3: Set the value with an appropriate input for the property type
- Where a visual preview of the override effect is feasible, show a small before/after sparkline or swatch

### Acceptance Criteria
- [ ] Existing overrides render as cards in the Overrides section
- [ ] Add Override flow is guided (3-step)
- [ ] Field picker shows real field names from the active data frame
- [ ] Property picker shows visual tiles, not a flat dropdown
- [ ] Override changes apply to the panel in real time
- [ ] No regressions in existing override functionality

---

## General Engineering Guidelines (apply to all phases)

- **Feature flag everything.** Each phase's new UI should be gated behind a flag so the branch never breaks the existing editor.
- **Touch only what's needed.** Avoid refactoring unrelated code. The goal is a PoC, not a cleanup.
- **TimeSeries and Gauge only.** Other panel types should be unaffected.
- **Use `@grafana/ui` and existing design tokens.** Don't introduce a new CSS framework or override global styles.
- **No memory leaks.** Run the panel editor open/close cycle a few times and verify no obvious leaks in the browser's performance tab.
- **Document your additions.** Add a `POC_NOTES.md` at the repo root summarizing: what was added, what flags to enable, and how to test each phase.

---

## How to Feed This to Claude Code

Start with Phase 1 only. Use this prompt pattern:

> "We are building a proof-of-concept on a dedicated branch of the Grafana codebase. Read `POC_PLAN.md` for full context. We are starting with **Phase 1**. Please explore the codebase to locate the panel editor options components, then implement the vertical sidebar as described. Add a feature flag and do not break existing behavior."

After Phase 1 is reviewed and working, move to Phase 2 with:

> "Phase 1 is complete. Now implement **Phase 2** from `POC_PLAN.md`."

And so on.
