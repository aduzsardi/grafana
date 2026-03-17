import { Field, FieldColorMode, GrafanaTheme2, fieldColorModeRegistry } from '@grafana/data';

// ---------------------------------------------------------------------------
// Palette definitions — hex colors used for both rendering and registration
// ---------------------------------------------------------------------------

export interface PaletteDefinition {
  id: string;
  name: string;
  colors: string[];
}

export const CLASSIC_PALETTE_ID = 'palette-classic';

/** Paul Tol — Bright (7 colors). Colourblind-safe, print-friendly. */
const PAUL_TOL_BRIGHT: PaletteDefinition = {
  id: 'palette-paul-tol-bright',
  name: 'Paul Tol — Bright',
  colors: ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377', '#BBBBBB'],
};

/** Paul Tol — Muted (10 colors). Colourblind-safe, suited for many series. */
const PAUL_TOL_MUTED: PaletteDefinition = {
  id: 'palette-paul-tol-muted',
  name: 'Paul Tol — Muted',
  colors: ['#332288', '#117733', '#44AA99', '#88CCEE', '#DDCC77', '#CC6677', '#AA4499', '#882255', '#999933', '#661100'],
};

/** Tableau 10 — widely used default in BI tools. */
const TABLEAU_10: PaletteDefinition = {
  id: 'palette-tableau-10',
  name: 'Tableau 10',
  colors: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'],
};

/** All custom palettes, in display order (Classic is added by the UI from theme). */
export const CUSTOM_PALETTES: PaletteDefinition[] = [PAUL_TOL_BRIGHT, PAUL_TOL_MUTED, TABLEAU_10];

// ---------------------------------------------------------------------------
// Registration into fieldColorModeRegistry
// ---------------------------------------------------------------------------

function makePaletteMode(palette: PaletteDefinition): FieldColorMode {
  const { id, name, colors } = palette;
  return {
    id,
    name,
    isByValue: false,
    isContinuous: false,
    getColors: (_theme: GrafanaTheme2) => colors,
    getCalculator: (field: Field, _theme: GrafanaTheme2) => {
      return () => {
        const seriesIndex = field.state?.seriesIndex ?? 0;
        return colors[seriesIndex % colors.length];
      };
    },
  };
}

/**
 * Register the custom palettes into Grafana's fieldColorModeRegistry.
 * Called at module load time so palettes are available as soon as this
 * file is imported — before any component renders.
 */
export function registerCustomPalettes() {
  for (const palette of CUSTOM_PALETTES) {
    if (!fieldColorModeRegistry.getIfExists(palette.id)) {
      fieldColorModeRegistry.register(makePaletteMode(palette));
    }
  }
}

// Register immediately on module load
registerCustomPalettes();
