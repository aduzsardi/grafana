import { useCallback } from 'react';

import { FieldConfigSource, ThresholdsConfig, ThresholdsMode } from '@grafana/data';
import { t } from '@grafana/i18n';
import { VizPanel } from '@grafana/scenes';
import { ThresholdsEditor } from 'app/features/dimensions/editors/ThresholdsEditor/ThresholdsEditor';

import { SectionCard } from './shared';

const DEFAULT_THRESHOLDS: ThresholdsConfig = {
  mode: ThresholdsMode.Absolute,
  steps: [
    { color: 'green', value: -Infinity },
    { color: 'red', value: 80 },
  ],
};

export function ThresholdsSection({ panel }: { panel: VizPanel }) {
  const { fieldConfig } = panel.useState();
  const thresholds = fieldConfig.defaults.thresholds ?? DEFAULT_THRESHOLDS;

  const handleChange = useCallback(
    (updated: ThresholdsConfig) => {
      const current = panel.state.fieldConfig;
      panel.onFieldConfigChange(
        {
          ...current,
          defaults: { ...current.defaults, thresholds: updated },
        } as FieldConfigSource,
        true
      );
    },
    [panel]
  );

  return (
    <SectionCard title={t('viz-options.thresholds', 'Thresholds')}>
      <ThresholdsEditor thresholds={thresholds} onChange={handleChange} />
    </SectionCard>
  );
}
