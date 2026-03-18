import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import { VizPanel } from '@grafana/scenes';
import { Input, TextArea, useStyles2 } from '@grafana/ui';

import { ControlRow, SectionCard, ToggleRow } from './shared';

export function PanelFrameSection({ panel }: { panel: VizPanel }) {
  const { title, description, displayMode } = panel.useState();
  const styles = useStyles2(getStyles);
  const isTransparent = displayMode === 'transparent';

  return (
    <SectionCard title={t('viz-options.panel-frame', 'Panel')}>
      <ControlRow label={t('viz-options.title', 'Title')}>
        <Input
          value={title ?? ''}
          placeholder={t('viz-options.title-placeholder', 'Panel title')}
          onChange={(e) => panel.setState({ title: e.currentTarget.value })}
        />
      </ControlRow>

      <ControlRow label={t('viz-options.description', 'Description')}>
        <TextArea
          className={styles.textarea}
          value={description ?? ''}
          placeholder={t('viz-options.description-placeholder', 'Optional description')}
          rows={3}
          onChange={(e) => panel.setState({ description: e.currentTarget.value })}
        />
      </ControlRow>

      <ToggleRow
        label={t('viz-options.transparent', 'Transparent background')}
        value={isTransparent}
        onChange={(v) => panel.setState({ displayMode: v ? 'transparent' : 'default' })}
      />
    </SectionCard>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    textarea: css({
      resize: 'vertical',
      minHeight: 60,
    }),
  };
}
