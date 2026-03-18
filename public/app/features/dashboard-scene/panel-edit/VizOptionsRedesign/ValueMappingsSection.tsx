import { useCallback } from 'react';

import { FieldConfigSource, ValueMapping } from '@grafana/data';
import { t } from '@grafana/i18n';
import { VizPanel } from '@grafana/scenes';
import { ValueMappingsEditor } from 'app/features/dimensions/editors/ValueMappingsEditor/ValueMappingsEditor';

import { SectionCard } from './shared';

// Minimal stub satisfying the item prop — context is unused by the editor
const MAPPINGS_ITEM = { id: 'mappings', name: 'Value Mappings', settings: {} };

export function ValueMappingsSection({ panel }: { panel: VizPanel }) {
  const { fieldConfig } = panel.useState();
  const mappings = (fieldConfig.defaults.mappings ?? []) as ValueMapping[];

  const handleChange = useCallback(
    (updated?: ValueMapping[]) => {
      const current = panel.state.fieldConfig;
      panel.onFieldConfigChange(
        {
          ...current,
          defaults: { ...current.defaults, mappings: updated ?? [] },
        } as FieldConfigSource,
        true
      );
    },
    [panel]
  );

  return (
    <SectionCard title={t('viz-options.value-mappings', 'Value Mappings')}>
      <ValueMappingsEditor
        value={mappings}
        onChange={handleChange}
        item={MAPPINGS_ITEM as any}
        context={{} as any}
      />
    </SectionCard>
  );
}
