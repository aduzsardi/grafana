import { css } from '@emotion/css';
import { useCallback } from 'react';

import { FieldColorModeId, FieldConfigSource, GrafanaTheme2, fieldColorModeRegistry } from '@grafana/data';
import { t } from '@grafana/i18n';
import { VizPanel } from '@grafana/scenes';
import { Input, Select, useStyles2, useTheme2 } from '@grafana/ui';

import { ControlLabel, ControlRow, SectionCard, ToggleRow, TwoColumns } from './shared';

// Common unit options for the picker
const UNIT_OPTIONS = [
  { value: 'short', label: 'Misc / short' },
  { value: 'percent', label: 'Percent (0-100)' },
  { value: 'percentunit', label: 'Percent (0.0-1.0)' },
  { value: 'bytes', label: 'Bytes (IEC)' },
  { value: 'decbytes', label: 'Bytes (SI)' },
  { value: 'ms', label: 'Milliseconds' },
  { value: 's', label: 'Seconds' },
  { value: 'celsius', label: 'Celsius' },
  { value: 'fahrenheit', label: 'Fahrenheit' },
  { value: 'none', label: 'None' },
];

function useDefaults(panel: VizPanel) {
  const { fieldConfig } = panel.useState();
  const defaults = fieldConfig.defaults;

  const setDefaults = useCallback(
    (updates: Partial<typeof defaults>) => {
      const current = panel.state.fieldConfig;
      panel.onFieldConfigChange(
        { ...current, defaults: { ...current.defaults, ...updates } } as FieldConfigSource,
        true
      );
    },
    [panel]
  );

  return { defaults, setDefaults };
}

// ─── Color scheme swatch + picker ─────────────────────────────────────────────

interface ColorSchemeRowProps {
  currentMode: string;
  onChange: (mode: string) => void;
}

function ColorSchemeRow({ currentMode, onChange }: ColorSchemeRowProps) {
  const styles = useStyles2(getColorSchemeStyles);
  const theme = useTheme2();

  // Use all registered color modes so nothing is missing — includes built-ins and
  // the Phase 2 custom palettes registered at module load via palettes.ts
  const allModes = fieldColorModeRegistry.list();
  const modeOptions = allModes.map((m) => ({ value: m.id, label: m.name }));

  // Build gradient swatch from the selected mode's resolved colors (palette modes only)
  const selectedMode = fieldColorModeRegistry.getIfExists(currentMode);
  const swatchColors = selectedMode?.getColors ? selectedMode.getColors(theme) : null;
  const gradientCss = swatchColors?.length
    ? `linear-gradient(to right, ${swatchColors.slice(0, 10).join(', ')})`
    : null;

  return (
    <div>
      <ControlLabel label={t('viz-options.color-scheme', 'Color Scheme')} />
      <div className={styles.row}>
        {gradientCss && <div className={styles.swatch} style={{ background: gradientCss }} />}
        <Select
          className={gradientCss ? styles.select : styles.selectFull}
          options={modeOptions}
          value={currentMode}
          onChange={(v) => onChange(v.value ?? FieldColorModeId.PaletteClassic)}
          menuShouldPortal
        />
      </div>
    </div>
  );
}

function getColorSchemeStyles(theme: GrafanaTheme2) {
  return {
    row: css({
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    }),
    swatch: css({
      flex: 1,
      height: 28,
      borderRadius: theme.shape.radius.default,
      minWidth: 0,
    }),
    select: css({
      width: 130,
      flexShrink: 0,
    }),
    selectFull: css({
      width: '100%',
    }),
  };
}

// ─── Standard Options section ─────────────────────────────────────────────────

export function StandardOptionsPanel({ panel }: { panel: VizPanel }) {
  const { defaults, setDefaults } = useDefaults(panel);

  const unit = defaults.unit ?? 'short';
  const min = defaults.min != null ? String(defaults.min) : '';
  const max = defaults.max != null ? String(defaults.max) : '';
  const fieldMinMax = (defaults as Record<string, unknown>).fieldMinMax as boolean ?? false;
  const decimals = defaults.decimals != null ? String(defaults.decimals) : '';
  const noValue = defaults.noValue ?? '';
  const displayName = defaults.displayName ?? '';
  const colorMode = defaults.color?.mode ?? FieldColorModeId.PaletteClassic;

  return (
    <SectionCard
      title={t('viz-options.standard-options', 'Standard Options')}
      dotColor="#73BF69" // green dot as in reference
    >
      <ControlRow label={t('viz-options.unit', 'Unit')}>
        <Select
          options={UNIT_OPTIONS}
          value={unit}
          onChange={(v) => setDefaults({ unit: v.value })}
          allowCustomValue
          menuShouldPortal
        />
      </ControlRow>

      <TwoColumns
        left={
          <ControlRow label={t('viz-options.min', 'Min')}>
            <Input
              type="number"
              placeholder="auto"
              value={min}
              onChange={(e) => {
                const v = parseFloat(e.currentTarget.value);
                setDefaults({ min: isNaN(v) ? undefined : v });
              }}
            />
          </ControlRow>
        }
        right={
          <ControlRow label={t('viz-options.max', 'Max')}>
            <Input
              type="number"
              placeholder="auto"
              value={max}
              onChange={(e) => {
                const v = parseFloat(e.currentTarget.value);
                setDefaults({ max: isNaN(v) ? undefined : v });
              }}
            />
          </ControlRow>
        }
      />

      <ToggleRow
        label={t('viz-options.field-min-max', 'Field min/max')}
        value={fieldMinMax}
        onChange={(v) => setDefaults({ fieldMinMax: v } as Partial<typeof defaults>)}
      />

      <TwoColumns
        left={
          <ControlRow label={t('viz-options.decimals', 'Decimals')}>
            <Input
              type="number"
              placeholder="Auto"
              value={decimals}
              onChange={(e) => {
                const v = parseInt(e.currentTarget.value, 10);
                setDefaults({ decimals: isNaN(v) ? undefined : v });
              }}
            />
          </ControlRow>
        }
        right={
          <ControlRow label={t('viz-options.no-value', 'No Value')}>
            <Input
              placeholder="—"
              value={noValue}
              onChange={(e) => setDefaults({ noValue: e.currentTarget.value })}
            />
          </ControlRow>
        }
      />

      <ControlRow label={t('viz-options.display-name', 'Display Name')}>
        <Input
          placeholder={t('viz-options.display-name-placeholder', 'Auto')}
          value={displayName}
          onChange={(e) => setDefaults({ displayName: e.currentTarget.value })}
        />
      </ControlRow>

      <ColorSchemeRow
        currentMode={colorMode}
        onChange={(mode) => setDefaults({ color: { mode } })}
      />
    </SectionCard>
  );
}
