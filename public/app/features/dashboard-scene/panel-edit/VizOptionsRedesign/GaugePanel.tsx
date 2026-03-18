import { useCallback } from 'react';

import { SelectableValue, fieldReducers } from '@grafana/data';
import { t } from '@grafana/i18n';
import { VizPanel } from '@grafana/scenes';
import { VizOrientation } from '@grafana/schema';
import { Input, RadioButtonGroup, Select } from '@grafana/ui';

import {
  CardOption,
  CardOptionGroup,
  ControlRow,
  Icons,
  SectionCard,
  ToggleRow,
  TwoColumns,
  ValueSlider,
} from './shared';

// ─── Gauge Options section ────────────────────────────────────────────────────

export function ReduceSection({ panel }: { panel: VizPanel }) {
  const { options } = panel.useState();
  const opts = (options ?? {}) as Record<string, unknown>;
  const reduceOptions = (opts.reduceOptions as Record<string, unknown>) ?? {};

  const setReduceOptions = useCallback(
    (updates: Record<string, unknown>) => {
      panel.onOptionsChange(
        { ...(panel.state.options as object), reduceOptions: { ...reduceOptions, ...updates } },
        true
      );
    },
    [panel, reduceOptions]
  );

  // Build list from registered reducers
  const calcOptions: Array<SelectableValue<string>> = fieldReducers
    .list()
    .map((r) => ({ value: r.id, label: r.name }));

  const currentCalc = ((reduceOptions.calcs as string[]) ?? ['lastNotNull'])[0] ?? 'lastNotNull';
  const showValues = (reduceOptions.values as boolean) ?? false;

  return (
    <SectionCard title={t('viz-options.value-options', 'Value Options')}>
      <ControlRow label={t('viz-options.calculation', 'Calculation')}>
        <Select
          options={calcOptions}
          value={currentCalc}
          onChange={(v) => setReduceOptions({ calcs: [v.value ?? 'lastNotNull'], values: false })}
          menuShouldPortal
        />
      </ControlRow>
      <ToggleRow
        label={t('viz-options.show-all-values', 'Show all values')}
        value={showValues}
        onChange={(v) => setReduceOptions({ values: v, calcs: v ? [] : [currentCalc] })}
      />
    </SectionCard>
  );
}

export function GaugePanel({ panel }: { panel: VizPanel }) {
  const { options } = panel.useState();
  const opts = (options ?? {}) as Record<string, unknown>;

  const setOptions = useCallback(
    (updates: Record<string, unknown>) => {
      panel.onOptionsChange({ ...(panel.state.options as object), ...updates }, true);
    },
    [panel]
  );

  const setEffects = useCallback(
    (updates: Record<string, unknown>) => {
      const currentEffects = (opts.effects as Record<string, unknown>) ?? {};
      panel.onOptionsChange({ ...(panel.state.options as object), effects: { ...currentEffects, ...updates } }, true);
    },
    [panel, opts.effects]
  );

  // ── Style cards ('circle' | 'gauge')
  const shapeOptions: Array<CardOption<string>> = [
    { value: 'circle', label: t('viz-options.gauge-circle', 'Circle'), icon: Icons.GaugeCircle },
    { value: 'gauge', label: t('viz-options.gauge-arc', 'Arc'), icon: Icons.GaugeArc },
  ];

  // ── Orientation
  const orientationOptions: Array<SelectableValue<VizOrientation>> = [
    { value: VizOrientation.Auto, label: 'Auto' },
    { value: VizOrientation.Horizontal, label: 'H' },
    { value: VizOrientation.Vertical, label: 'V' },
  ];

  // ── Bar style
  const barStyleOptions: Array<SelectableValue<string>> = [
    { value: 'flat', label: 'Flat' },
    { value: 'rounded', label: 'Rounded' },
  ];

  // ── Text mode
  const textModeOptions: Array<SelectableValue<string>> = [
    { value: 'auto', label: 'Auto' },
    { value: 'value', label: 'Value' },
    { value: 'value_and_name', label: 'Value & Name' },
    { value: 'name', label: 'Name' },
    { value: 'none', label: 'None' },
  ];

  // ── Effects (mutually exclusive for demo)
  const effectsOptions: Array<SelectableValue<string>> = [
    { value: 'gradient', label: 'Gradient' },
    { value: 'barGlow', label: 'Bar Glow' },
    { value: 'none', label: 'None' },
  ];

  // Read current values
  const shape = (opts.shape as string) ?? 'circle';
  const orientation = (opts.orientation as VizOrientation) ?? VizOrientation.Auto;
  const barWidthFactor = (opts.barWidthFactor as number) ?? 0.8;
  const segmentCount = (opts.segmentCount as number) ?? 10;
  const barShape = (opts.barShape as string) ?? 'flat';
  const textMode = (opts.textMode as string) ?? 'auto';
  const neutral = String((opts.neutral as number) ?? 0);
  const sparkline = (opts.sparkline as boolean) ?? true;
  const showThresholdMarkers = (opts.showThresholdMarkers as boolean) ?? true;
  const showThresholdLabels = (opts.showThresholdLabels as boolean) ?? false;

  const effects = (opts.effects as Record<string, unknown>) ?? {};
  const activeEffect = effects.gradient ? 'gradient' : effects.barGlow ? 'barGlow' : 'none';

  return (
    <SectionCard title={t('viz-options.gauge-options', 'Gauge Options')}>
      <TwoColumns
        left={
          <ControlRow label={t('viz-options.gauge-style', 'Style')}>
            <CardOptionGroup options={shapeOptions} value={shape} onChange={(v) => setOptions({ shape: v })} />
          </ControlRow>
        }
        right={
          <ControlRow label={t('viz-options.orientation', 'Orientation')}>
            <RadioButtonGroup
              options={orientationOptions}
              value={orientation}
              onChange={(v) => setOptions({ orientation: v })}
              size="sm"
              fullWidth
            />
          </ControlRow>
        }
      />

      <TwoColumns
        left={
          <ValueSlider
            label={t('viz-options.bar-width', 'Bar Width')}
            inputId="barWidth-slider"
            min={0.1}
            max={1}
            step={0.05}
            value={barWidthFactor}
            onAfterChange={(v) => setOptions({ barWidthFactor: v })}
            formatValue={(v) => v.toFixed(2)}
          />
        }
        right={
          <ValueSlider
            label={t('viz-options.segments', 'Segments')}
            inputId="segments-slider"
            min={1}
            max={20}
            step={1}
            value={segmentCount}
            onAfterChange={(v) => setOptions({ segmentCount: v })}
          />
        }
      />

      <TwoColumns
        left={
          <ControlRow label={t('viz-options.bar-style', 'Bar Style')}>
            <RadioButtonGroup
              options={barStyleOptions}
              value={barShape}
              onChange={(v) => setOptions({ barShape: v })}
              size="sm"
              fullWidth
            />
          </ControlRow>
        }
        right={
          <ControlRow label={t('viz-options.text-mode', 'Text Mode')}>
            <Select
              options={textModeOptions}
              value={textMode}
              onChange={(v) => setOptions({ textMode: v.value })}
              menuShouldPortal
            />
          </ControlRow>
        }
      />

      <ControlRow label={t('viz-options.neutral-value', 'Neutral Value')}>
        <Input
          type="number"
          value={neutral}
          onChange={(e) => setOptions({ neutral: parseFloat(e.currentTarget.value) || 0 })}
        />
      </ControlRow>

      <ControlRow label={t('viz-options.display', 'Display')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ToggleRow
            label={t('viz-options.sparkline', 'Sparkline')}
            value={sparkline}
            onChange={(v) => setOptions({ sparkline: v })}
          />
          <ToggleRow
            label={t('viz-options.thresholds', 'Thresholds')}
            value={showThresholdMarkers}
            onChange={(v) => setOptions({ showThresholdMarkers: v })}
          />
          <ToggleRow
            label={t('viz-options.labels', 'Labels')}
            value={showThresholdLabels}
            onChange={(v) => setOptions({ showThresholdLabels: v })}
          />
        </div>
      </ControlRow>

      <ControlRow label={t('viz-options.effects', 'Effects')}>
        <RadioButtonGroup
          options={effectsOptions}
          value={activeEffect}
          onChange={(v) => setEffects({
            gradient: v === 'gradient',
            barGlow: v === 'barGlow',
            centerGlow: false,
          })}
          size="sm"
          fullWidth
        />
      </ControlRow>
    </SectionCard>
  );
}
