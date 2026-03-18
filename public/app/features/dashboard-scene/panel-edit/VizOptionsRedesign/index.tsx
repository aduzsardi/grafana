import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { VizPanel } from '@grafana/scenes';
import { ScrollContainer, useStyles2 } from '@grafana/ui';

import { GaugePanel, ReduceSection } from './GaugePanel';
import { PanelFrameSection } from './PanelFrameSection';
import { StandardOptionsPanel } from './StandardOptionsPanel';
import { ThresholdsSection } from './ThresholdsSection';
import { TimeSeriesPanel } from './TimeSeriesPanel';
import { ValueMappingsSection } from './ValueMappingsSection';

/**
 * PoC Phase 4: Redesigned options panel for TimeSeries and Gauge panels.
 * Renders purpose-built controls grouped into semantic sections covering
 * all options that were available in the original flat options pane.
 * Only active when vizOptionsSidebar feature flag is on.
 */
export function VizOptionsRedesign({ panel }: { panel: VizPanel }) {
  const { pluginId } = panel.useState();
  const styles = useStyles2(getStyles);

  return (
    <ScrollContainer>
      <div className={styles.container}>
        <PanelFrameSection panel={panel} />

        {pluginId === 'timeseries' && <TimeSeriesPanel panel={panel} />}
        {pluginId === 'gauge' && (
          <>
            <ReduceSection panel={panel} />
            <GaugePanel panel={panel} />
          </>
        )}

        <StandardOptionsPanel panel={panel} />
        <ThresholdsSection panel={panel} />
        <ValueMappingsSection panel={panel} />
      </div>
    </ScrollContainer>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    container: css({
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1.5),
      padding: theme.spacing(1.5),
    }),
  };
}
