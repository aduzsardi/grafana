# PoC Notes — Viz Configuration Redesign

## Phase 1 — Options Panel Vertical Sidebar

### What was added

| File | Change |
|------|--------|
| `packages/grafana-data/src/types/featureToggles.gen.ts` | Added `vizOptionsSidebar?: boolean` flag (manual addition — do not regenerate without re-applying) |
| `public/app/features/dashboard-scene/panel-edit/VizOptionsSidebar.tsx` | New component: vertical icon rail + section layout + AI/Styles placeholder sections |
| `public/app/features/dashboard-scene/panel-edit/PanelOptionsPane.tsx` | Modified to conditionally render sidebar layout when flag is on; default behavior unchanged |

### How to enable

In `conf/custom.ini` (create from `conf/sample.ini` if needed):

```ini
[feature_toggles]
vizOptionsSidebar = true
```

Then restart the Grafana server.

### What it does

When enabled, the panel editor's right-side options pane gains a narrow **40 px icon rail** on the right edge with four navigation sections:

| Icon | Section | Behaviour |
|------|---------|-----------|
| ✨ AI (`ai`) | AI | Stub placeholder — "Coming soon" |
| ⚡ Styles (`bolt`) | Styles | Stub placeholder — "Coming soon" |
| ⚙ Options (`cog`) | Options | Full existing panel options UI (default active) |
| ⊟ Overrides (`sliders-v-alt`) | Overrides | Existing field overrides only |

- Default active section is **Options**.
- Switching sections does not affect existing panel state.
- The viz type picker (Change button) continues to work normally in all sections.
- Search is available in Options and Overrides sections.

### How to test

1. Enable the flag (see above) and restart.
2. Open any dashboard → Edit any **Time Series** or **Gauge** panel.
3. The right-side options pane should show the icon rail on its right edge.
4. Click each icon and verify:
   - **AI / Styles**: placeholder message visible.
   - **Options**: existing panel options render correctly.
   - **Overrides**: only field override categories render.
5. Disable the flag and verify the default panel editor is completely unaffected.

### Disabling / reverting

Remove or set to `false` in `custom.ini`:

```ini
[feature_toggles]
vizOptionsSidebar = false
```

---

## Phases 2–5

Not yet implemented. See `poc_plan.md` for full details.
