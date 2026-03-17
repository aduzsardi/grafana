import {
  FieldColorModeId,
  ThresholdsMode,
  VisualizationSuggestion,
} from '@grafana/data';
import {
  AxisColorMode,
  AxisPlacement,
  BarAlignment,
  GraphDrawStyle,
  GraphFieldConfig,
  GraphGradientMode,
  GraphThresholdsStyleMode,
  LineInterpolation,
  ScaleDistribution,
  StackingMode,
  VisibilityMode,
} from '@grafana/schema';
import { SUGGESTIONS_LEGEND_OPTIONS } from 'app/features/panel/suggestions/utils';

import { Options } from './panelcfg.gen';

const previewModifier = (s: VisualizationSuggestion<Options, GraphFieldConfig>) => {
  s.options = s.options ?? ({} as Options);
  s.options.disableKeyboardEvents = true;
  s.options.legend = SUGGESTIONS_LEGEND_OPTIONS;
  if (s.fieldConfig?.defaults.custom?.drawStyle !== GraphDrawStyle.Bars) {
    s.fieldConfig!.defaults.custom!.lineWidth = Math.max(
      s.fieldConfig!.defaults.custom!.lineWidth ?? 1,
      2
    );
  }
  s.fieldConfig!.defaults.custom!.axisPlacement = AxisPlacement.Hidden;
};

export function presetA(): VisualizationSuggestion<Options, GraphFieldConfig> {
  return {
    name: 'presetA',
    fieldConfig: {
      defaults: {
        custom: {
          drawStyle: GraphDrawStyle.Line,
          lineInterpolation: LineInterpolation.Linear,
          barAlignment: BarAlignment.Center,
          barWidthFactor: 0.6,
          lineWidth: 1,
          fillOpacity: 27,
          gradientMode: GraphGradientMode.Opacity,
          spanNulls: false,
          insertNulls: false,
          showPoints: VisibilityMode.Auto,
          showValues: false,
          pointSize: 4,
          stacking: {
            mode: StackingMode.None,
            group: 'A',
          },
          axisPlacement: AxisPlacement.Auto,
          axisLabel: '',
          axisColorMode: AxisColorMode.Text,
          axisBorderShow: false,
          scaleDistribution: {
            type: ScaleDistribution.Linear,
          },
          axisCenteredZero: false,
          hideFrom: {
            tooltip: false,
            viz: false,
            legend: false,
          },
          thresholdsStyle: {
            mode: GraphThresholdsStyleMode.Off,
          },
          lineStyle: {
            fill: 'solid',
          },
        },
        color: {
          mode: FieldColorModeId.PaletteClassic,
          fixedColor: 'blue',
          seriesBy: 'last',
        },
        thresholds: {
          mode: ThresholdsMode.Absolute,
          steps: [
            { color: 'green', value: -Infinity },
            { color: 'red', value: 80 },
          ],
        },
      },
      overrides: [],
    },
    cardOptions: { previewModifier },
  };
}
