import { useCallback } from 'react';

import { FieldConfigSource, SelectableValue } from '@grafana/data';

import { t } from '@grafana/i18n';
import { VizPanel } from '@grafana/scenes';
import {
  AxisColorMode,
  AxisPlacement,
  GraphDrawStyle,
  GraphGradientMode,
  GraphThresholdsStyleMode,
  LegendDisplayMode,
  LineInterpolation,
  ScaleDistribution,
  StackingMode,
  TooltipDisplayMode,
  VisibilityMode,
} from '@grafana/schema';
import { Input, RadioButtonGroup } from '@grafana/ui';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCustom(panel: VizPanel) {
  const { fieldConfig, options } = panel.useState();
  const custom = (fieldConfig.defaults.custom ?? {}) as Record<string, unknown>;

  const setCustom = useCallback(
    (updates: Record<string, unknown>) => {
      const current = panel.state.fieldConfig;
      panel.onFieldConfigChange(
        {
          ...current,
          defaults: { ...current.defaults, custom: { ...current.defaults.custom, ...updates } },
        } as FieldConfigSource,
        true
      );
    },
    [panel]
  );

  const setOptions = useCallback(
    (updates: Record<string, unknown>) => {
      panel.onOptionsChange({ ...(panel.state.options as object), ...updates }, true);
    },
    [panel]
  );

  return { custom, options: options as Record<string, unknown>, setCustom, setOptions };
}

// ─── Graph Styles section ─────────────────────────────────────────────────────

export function TimeSeriesPanel({ panel }: { panel: VizPanel }) {
  const { custom, options, setCustom, setOptions } = useCustom(panel);

  // ── Viz type cards
  const drawStyleOptions: Array<CardOption<GraphDrawStyle>> = [
    { value: GraphDrawStyle.Line, label: t('viz-options.draw-style-line', 'Lines'), icon: Icons.Lines },
    { value: GraphDrawStyle.Bars, label: t('viz-options.draw-style-bars', 'Bars'), icon: Icons.Bars },
    { value: GraphDrawStyle.Points, label: t('viz-options.draw-style-points', 'Points'), icon: Icons.Points },
  ];

  // ── Line interpolation cards
  const interpOptions: Array<CardOption<LineInterpolation>> = [
    { value: LineInterpolation.Linear, label: t('viz-options.interp-linear', 'Linear'), icon: Icons.Linear },
    { value: LineInterpolation.Smooth, label: t('viz-options.interp-smooth', 'Smooth'), icon: Icons.Smooth },
    { value: LineInterpolation.StepAfter, label: t('viz-options.interp-step', 'Step'), icon: Icons.Step },
  ];

  // ── Gradient mode
  const gradientOptions: Array<SelectableValue<GraphGradientMode>> = [
    { value: GraphGradientMode.None, label: 'None' },
    { value: GraphGradientMode.Opacity, label: 'Opacity' },
    { value: GraphGradientMode.Hue, label: 'Hue' },
    { value: GraphGradientMode.Scheme, label: 'Scheme' },
  ];

  // ── Line style
  const lineStyleOptions: Array<SelectableValue<string>> = [
    { value: 'solid', label: 'Solid' },
    { value: 'dash', label: 'Dash' },
    { value: 'dot', label: 'Dots' },
  ];

  // ── Connect nulls
  const spanNullsOptions: Array<SelectableValue<boolean>> = [
    { value: false, label: 'Never' },
    { value: true, label: 'Always' },
  ];

  // ── Show points
  const showPointsOptions: Array<SelectableValue<VisibilityMode>> = [
    { value: VisibilityMode.Auto, label: 'Auto' },
    { value: VisibilityMode.Always, label: 'On' },
    { value: VisibilityMode.Never, label: 'Off' },
  ];

  // ── Stacking
  const stackOptions: Array<SelectableValue<StackingMode>> = [
    { value: StackingMode.None, label: 'Off' },
    { value: StackingMode.Normal, label: 'Normal' },
    { value: StackingMode.Percent, label: '100%' },
  ];

  // ── Legend display
  const legendOptions: Array<SelectableValue<string>> = [
    { value: 'bottom', label: 'Bottom' },
    { value: 'right', label: 'Right' },
    { value: 'hidden', label: 'Hidden' },
  ];

  // ── Tooltip mode
  const tooltipOptions: Array<SelectableValue<TooltipDisplayMode>> = [
    { value: TooltipDisplayMode.Single, label: 'Single' },
    { value: TooltipDisplayMode.Multi, label: 'All' },
    { value: TooltipDisplayMode.None, label: 'Hidden' },
  ];

  // Read current values (with sensible defaults)
  const drawStyle = (custom.drawStyle as GraphDrawStyle) ?? GraphDrawStyle.Line;
  const lineInterp = (custom.lineInterpolation as LineInterpolation) ?? LineInterpolation.Linear;
  const lineWidth = (custom.lineWidth as number) ?? 1;
  const fillOpacity = (custom.fillOpacity as number) ?? 0;
  const gradientMode = (custom.gradientMode as GraphGradientMode) ?? GraphGradientMode.None;
  const lineFill = ((custom.lineStyle as Record<string, unknown>)?.fill as string) ?? 'solid';
  const spanNulls = (custom.spanNulls as boolean) ?? false;
  const showPoints = (custom.showPoints as VisibilityMode) ?? VisibilityMode.Auto;
  const pointSize = (custom.pointSize as number) ?? 4;
  const stackMode = ((custom.stacking as Record<string, unknown>)?.mode as StackingMode) ?? StackingMode.None;
  const showValues = (custom.showValues as boolean) ?? false;

  const legend = (options.legend as Record<string, unknown>) ?? {};
  const legendPlacement = (legend.placement as string) ?? 'bottom';
  const showLegend = (legend.showLegend as boolean) ?? true;
  const tooltipMode = ((options.tooltip as Record<string, unknown>)?.mode as TooltipDisplayMode) ?? TooltipDisplayMode.Single;

  return (
    <>
      {/* ── Graph Styles ── */}
      <SectionCard title={t('viz-options.graph-styles', 'Graph Styles')}>
        <ControlRow label={t('viz-options.viz-style', 'Visualization Style')}>
          <CardOptionGroup
            options={drawStyleOptions}
            value={drawStyle}
            onChange={(v) => setCustom({ drawStyle: v })}
          />
        </ControlRow>

        {drawStyle === GraphDrawStyle.Line && (
          <ControlRow label={t('viz-options.line-interp', 'Line Interpolation')}>
            <CardOptionGroup
              options={interpOptions}
              value={lineInterp}
              onChange={(v) => setCustom({ lineInterpolation: v })}
            />
          </ControlRow>
        )}

        <TwoColumns
          left={
            <ValueSlider
              label={t('viz-options.line-width', 'Line Width')}
              inputId="lineWidth-slider"
              min={0}
              max={10}
              step={1}
              value={lineWidth}
              onAfterChange={(v) => setCustom({ lineWidth: v })}
            />
          }
          right={
            <ValueSlider
              label={t('viz-options.fill-opacity', 'Fill Opacity')}
              inputId="fillOpacity-slider"
              min={0}
              max={100}
              step={1}
              value={fillOpacity}
              onAfterChange={(v) => setCustom({ fillOpacity: v })}
              formatValue={(v) => `${v}%`}
            />
          }
        />

        <ControlRow label={t('viz-options.gradient-mode', 'Gradient Mode')}>
          <RadioButtonGroup
            options={gradientOptions}
            value={gradientMode}
            onChange={(v) => setCustom({ gradientMode: v })}
            size="sm"
            fullWidth
          />
        </ControlRow>

        {drawStyle === GraphDrawStyle.Line && (
          <ControlRow label={t('viz-options.line-style', 'Line Style')}>
            <RadioButtonGroup
              options={lineStyleOptions}
              value={lineFill}
              onChange={(v) => setCustom({ lineStyle: { fill: v } })}
              size="sm"
              fullWidth
            />
          </ControlRow>
        )}

        <TwoColumns
          left={
            <ControlRow label={t('viz-options.connect-nulls', 'Connect Nulls')}>
              <RadioButtonGroup
                options={spanNullsOptions}
                value={spanNulls}
                onChange={(v) => setCustom({ spanNulls: v })}
                size="sm"
                fullWidth
              />
            </ControlRow>
          }
          right={
            <ControlRow label={t('viz-options.show-points', 'Show Points')}>
              <RadioButtonGroup
                options={showPointsOptions}
                value={showPoints}
                onChange={(v) => setCustom({ showPoints: v })}
                size="sm"
                fullWidth
              />
            </ControlRow>
          }
        />

        <TwoColumns
          left={
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 20 }}>
              <ToggleRow
                label={t('viz-options.show-values', 'Show Values')}
                value={showValues}
                onChange={(v) => setCustom({ showValues: v })}
              />
            </div>
          }
          right={
            <ValueSlider
              label={t('viz-options.point-size', 'Point Size')}
              inputId="pointSize-slider"
              min={1}
              max={40}
              step={1}
              value={pointSize}
              onAfterChange={(v) => setCustom({ pointSize: v })}
            />
          }
        />

        <ControlRow label={t('viz-options.stack-series', 'Stack Series')}>
          <RadioButtonGroup
            options={stackOptions}
            value={stackMode}
            onChange={(v) => setCustom({ stacking: { mode: v, group: 'A' } })}
            size="sm"
            fullWidth
          />
        </ControlRow>
      </SectionCard>

      {/* ── Legend ── */}
      <SectionCard title={t('viz-options.legend', 'Legend')}>
        <ControlRow label={t('viz-options.legend-placement', 'Placement')}>
          <RadioButtonGroup
            options={legendOptions}
            value={showLegend ? legendPlacement : 'hidden'}
            onChange={(v) => {
              if (v === 'hidden') {
                setOptions({ legend: { ...legend, showLegend: false } });
              } else {
                setOptions({ legend: { ...legend, showLegend: true, displayMode: LegendDisplayMode.List, placement: v } });
              }
            }}
            size="sm"
            fullWidth
          />
        </ControlRow>
      </SectionCard>

      {/* ── Tooltip ── */}
      <SectionCard title={t('viz-options.tooltip', 'Tooltip')}>
        <ControlRow label={t('viz-options.tooltip-mode', 'Mode')}>
          <RadioButtonGroup
            options={tooltipOptions}
            value={tooltipMode}
            onChange={(v) => setOptions({ tooltip: { mode: v } })}
            size="sm"
            fullWidth
          />
        </ControlRow>
      </SectionCard>

      {/* ── Axis ── */}
      <AxisSection custom={custom} setCustom={setCustom} />

      {/* ── Threshold display style (how thresholds appear on the chart) ── */}
      <ThresholdStyleSection custom={custom} setCustom={setCustom} />
    </>
  );
}

// ─── Axis section ─────────────────────────────────────────────────────────────

interface AxisProps {
  custom: Record<string, unknown>;
  setCustom: (updates: Record<string, unknown>) => void;
}

function AxisSection({ custom, setCustom }: AxisProps) {
  const axisPlacementOptions: Array<SelectableValue<AxisPlacement>> = [
    { value: AxisPlacement.Auto, label: 'Auto' },
    { value: AxisPlacement.Left, label: 'Left' },
    { value: AxisPlacement.Right, label: 'Right' },
    { value: AxisPlacement.Hidden, label: 'Hidden' },
  ];

  const scaleOptions: Array<SelectableValue<ScaleDistribution>> = [
    { value: ScaleDistribution.Linear, label: 'Linear' },
    { value: ScaleDistribution.Log, label: 'Log' },
    { value: ScaleDistribution.Symlog, label: 'Symlog' },
  ];

  const axisColorOptions: Array<SelectableValue<AxisColorMode>> = [
    { value: AxisColorMode.Text, label: 'Text' },
    { value: AxisColorMode.Series, label: 'Series' },
  ];

  const axisPlacement = (custom.axisPlacement as AxisPlacement) ?? AxisPlacement.Auto;
  const axisLabel = (custom.axisLabel as string) ?? '';
  const scaleType = ((custom.scaleDistribution as Record<string, unknown>)?.type as ScaleDistribution) ?? ScaleDistribution.Linear;
  const axisColorMode = (custom.axisColorMode as AxisColorMode) ?? AxisColorMode.Text;
  const axisCenteredZero = (custom.axisCenteredZero as boolean) ?? false;
  const axisBorderShow = (custom.axisBorderShow as boolean) ?? false;

  return (
    <SectionCard title={t('viz-options.axis', 'Axis')}>
      <ControlRow label={t('viz-options.axis-placement', 'Placement')}>
        <RadioButtonGroup
          options={axisPlacementOptions}
          value={axisPlacement}
          onChange={(v) => setCustom({ axisPlacement: v })}
          size="sm"
          fullWidth
        />
      </ControlRow>

      <ControlRow label={t('viz-options.axis-label', 'Label')}>
        <Input
          value={axisLabel}
          placeholder={t('viz-options.axis-label-placeholder', 'Optional label')}
          onChange={(e) => setCustom({ axisLabel: e.currentTarget.value })}
        />
      </ControlRow>

      <TwoColumns
        left={
          <ControlRow label={t('viz-options.scale', 'Scale')}>
            <RadioButtonGroup
              options={scaleOptions}
              value={scaleType}
              onChange={(v) => setCustom({ scaleDistribution: { type: v } })}
              size="sm"
              fullWidth
            />
          </ControlRow>
        }
        right={
          <ControlRow label={t('viz-options.axis-color', 'Color')}>
            <RadioButtonGroup
              options={axisColorOptions}
              value={axisColorMode}
              onChange={(v) => setCustom({ axisColorMode: v })}
              size="sm"
              fullWidth
            />
          </ControlRow>
        }
      />

      <TwoColumns
        left={<ToggleRow label={t('viz-options.centered-zero', 'Centered zero')} value={axisCenteredZero} onChange={(v) => setCustom({ axisCenteredZero: v })} />}
        right={<ToggleRow label={t('viz-options.border', 'Border')} value={axisBorderShow} onChange={(v) => setCustom({ axisBorderShow: v })} />}
      />
    </SectionCard>
  );
}

// ─── Threshold display style ──────────────────────────────────────────────────

function ThresholdStyleSection({ custom, setCustom }: AxisProps) {
  const thresholdStyleOptions: Array<SelectableValue<GraphThresholdsStyleMode>> = [
    { value: GraphThresholdsStyleMode.Off, label: 'Off' },
    { value: GraphThresholdsStyleMode.Line, label: 'Line' },
    { value: GraphThresholdsStyleMode.Area, label: 'Area' },
    { value: GraphThresholdsStyleMode.LineAndArea, label: 'Line + Area' },
    { value: GraphThresholdsStyleMode.Series, label: 'Series' },
  ];

  const mode = ((custom.thresholdsStyle as Record<string, unknown>)?.mode as GraphThresholdsStyleMode) ?? GraphThresholdsStyleMode.Off;

  return (
    <SectionCard title={t('viz-options.threshold-style', 'Threshold Style')}>
      <ControlRow label={t('viz-options.threshold-style-mode', 'Show thresholds')}>
        <RadioButtonGroup
          options={thresholdStyleOptions}
          value={mode}
          onChange={(v) => setCustom({ thresholdsStyle: { mode: v } })}
          size="sm"
          fullWidth
        />
      </ControlRow>
    </SectionCard>
  );
}
