import { css, cx } from '@emotion/css';
import { merge } from 'lodash';
import { useCallback, useMemo } from 'react';

import { FieldColorModeId, GrafanaTheme2, LoadingState, PanelData, PanelPluginVisualizationSuggestion } from '@grafana/data';
import { t } from '@grafana/i18n';
import { VizPanel } from '@grafana/scenes';
import { ScrollContainer, Text, Tooltip, useStyles2, useTheme2 } from '@grafana/ui';
import { VisualizationCardGrid } from 'app/features/panel/components/VizTypePicker/VisualizationCardGrid';
import { getPluginPresets } from 'app/features/panel/presets/getPresets';
import { MIN_MULTI_COLUMN_SIZE } from 'app/features/panel/suggestions/constants';

import { CLASSIC_PALETTE_ID, CUSTOM_PALETTES, PaletteDefinition } from './palettes';

const EMPTY_DATA: PanelData = { series: [], state: LoadingState.Done, timeRange: null as any };

interface Props {
  panel: VizPanel;
  data?: PanelData;
}

/**
 * PoC: Styles section for the VizOptionsSidebar.
 * Provides a categorical color palette picker and style preset cards.
 */
export function StylesSection({ panel, data }: Props) {
  const { pluginId, fieldConfig } = panel.useState();
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  const currentPaletteId = fieldConfig.defaults.color?.mode ?? FieldColorModeId.PaletteClassic;

  // Build the classic palette swatches from the theme
  const classicPalette: PaletteDefinition = useMemo(
    () => ({
      id: CLASSIC_PALETTE_ID,
      name: 'Classic',
      colors: theme.visualization.palette.slice(0, 10).map((c) => theme.visualization.getColorByName(c)),
    }),
    [theme]
  );

  const allPalettes: PaletteDefinition[] = useMemo(
    () => [classicPalette, ...CUSTOM_PALETTES],
    [classicPalette]
  );

  const handlePaletteClick = useCallback(
    (paletteId: string) => {
      const current = panel.state.fieldConfig;
      panel.onFieldConfigChange(
        {
          ...current,
          defaults: {
            ...current.defaults,
            color: {
              ...current.defaults.color,
              mode: paletteId,
            },
          },
        },
        true
      );
    },
    [panel]
  );

  const presets = useMemo<PanelPluginVisualizationSuggestion[]>(() => {
    const plugin = panel.getPlugin();
    if (!plugin) {
      return [];
    }
    return getPluginPresets(plugin, data?.series);
  }, [panel, pluginId, data]);

  const handlePresetClick = useCallback(
    (suggestion: PanelPluginVisualizationSuggestion) => {
      if (suggestion.fieldConfig?.defaults?.custom) {
        const current = panel.state.fieldConfig;
        panel.onFieldConfigChange(
          {
            defaults: {
              ...current.defaults,
              custom: merge({}, current.defaults.custom, suggestion.fieldConfig.defaults.custom),
            },
            overrides: current.overrides,
          },
          true
        );
      }
      if (suggestion.options && Object.keys(suggestion.options).length > 0) {
        panel.onOptionsChange(merge({}, panel.state.options, suggestion.options), true);
      }
    },
    [panel]
  );

  const previewData = data ?? EMPTY_DATA;

  return (
    <ScrollContainer>
      <div className={styles.container}>
        {/* ── Palette picker ── */}
        <Text variant="bodySmall" weight="medium" color="secondary">
          {t('viz-styles-section.palette-label', 'Color palette')}
        </Text>
        <div className={styles.paletteList}>
          {allPalettes.map((palette) => (
            <PaletteRow
              key={palette.id}
              palette={palette}
              isActive={currentPaletteId === palette.id}
              onClick={handlePaletteClick}
            />
          ))}
        </div>

        {/* ── Style presets ── */}
        {presets.length > 0 && (
          <>
            <Text variant="bodySmall" weight="medium" color="secondary">
              {t('viz-styles-section.presets-label', 'Style presets')}
            </Text>
            <VisualizationCardGrid
              items={presets}
              data={previewData}
              onItemClick={handlePresetClick}
              getItemKey={(item) => item.hash}
              minColumnWidth={120}
              maxCardWidth={MIN_MULTI_COLUMN_SIZE}
            />
          </>
        )}
      </div>
    </ScrollContainer>
  );
}

// ---------------------------------------------------------------------------
// PaletteRow
// ---------------------------------------------------------------------------

interface PaletteRowProps {
  palette: PaletteDefinition;
  isActive: boolean;
  onClick: (id: string) => void;
}

function PaletteRow({ palette, isActive, onClick }: PaletteRowProps) {
  const styles = useStyles2(getStyles);
  return (
    <Tooltip content={palette.name} placement="left">
      <button
        className={cx(styles.paletteRow, isActive && styles.paletteRowActive)}
        onClick={() => onClick(palette.id)}
        aria-pressed={isActive}
        aria-label={palette.name}
      >
        <span className={styles.paletteName}>{palette.name}</span>
        <span className={styles.swatches}>
          {palette.colors.slice(0, 10).map((color, i) => (
            <span
              key={i}
              className={styles.swatch}
              style={{ background: color }}
            />
          ))}
        </span>
      </button>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function getStyles(theme: GrafanaTheme2) {
  return {
    container: css({
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
      padding: theme.spacing(2),
    }),
    paletteList: css({
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
    }),
    paletteRow: css({
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      padding: theme.spacing(0.75, 1),
      borderRadius: theme.shape.radius.default,
      border: `1px solid transparent`,
      background: 'transparent',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      '&:hover': {
        background: theme.colors.action.hover,
      },
    }),
    paletteRowActive: css({
      border: `1px solid ${theme.colors.primary.border}`,
      background: theme.colors.action.selected,
    }),
    paletteName: css({
      ...theme.typography.bodySmall,
      color: theme.colors.text.primary,
      flexShrink: 0,
      width: 120,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    swatches: css({
      display: 'flex',
      gap: 2,
      flexWrap: 'nowrap',
    }),
    swatch: css({
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: 2,
      flexShrink: 0,
    }),
  };
}
