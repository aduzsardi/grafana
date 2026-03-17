import { css, cx } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import { Icon, Tooltip, useStyles2 } from '@grafana/ui';

export type VizSidebarSection = 'ai' | 'styles' | 'options' | 'overrides';

interface SidebarNavButtonProps {
  icon: 'ai' | 'bolt' | 'cog' | 'sliders-v-alt';
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function SidebarNavButton({ icon, label, isActive, onClick }: SidebarNavButtonProps) {
  const styles = useStyles2(getButtonStyles);
  return (
    <Tooltip content={label} placement="left">
      <button
        className={cx(styles.button, isActive && styles.active)}
        onClick={onClick}
        aria-label={label}
        aria-pressed={isActive}
      >
        <Icon name={icon} size="lg" />
      </button>
    </Tooltip>
  );
}

interface VizOptionsSidebarProps {
  children: React.ReactNode;
  activeSection: VizSidebarSection;
  onSectionChange: (section: VizSidebarSection) => void;
}

/**
 * PoC: Wraps the panel options pane with a vertical icon sidebar for section navigation.
 * Gated behind the `vizOptionsSidebar` feature flag.
 */
export function VizOptionsSidebar({ children, activeSection, onSectionChange }: VizOptionsSidebarProps) {
  const styles = useStyles2(getStyles);
  return (
    <div className={styles.container}>
      <div className={styles.content}>{children}</div>
      <div className={styles.iconRail}>
        {/* EditTools — primary navigation sections */}
        <div className={styles.editTools}>
          <SidebarNavButton
            icon="ai"
            label={t('viz-options-sidebar.section-ai', 'AI')}
            isActive={activeSection === 'ai'}
            onClick={() => onSectionChange('ai')}
          />
          <SidebarNavButton
            icon="bolt"
            label={t('viz-options-sidebar.section-styles', 'Styles')}
            isActive={activeSection === 'styles'}
            onClick={() => onSectionChange('styles')}
          />
          <SidebarNavButton
            icon="cog"
            label={t('viz-options-sidebar.section-options', 'Options')}
            isActive={activeSection === 'options'}
            onClick={() => onSectionChange('options')}
          />
        </div>
        {/* ViewTools — secondary sections */}
        <div className={styles.viewTools}>
          <SidebarNavButton
            icon="sliders-v-alt"
            label={t('viz-options-sidebar.section-overrides', 'Overrides')}
            isActive={activeSection === 'overrides'}
            onClick={() => onSectionChange('overrides')}
          />
        </div>
      </div>
    </div>
  );
}

/** Placeholder for the AI section — to be wired in Phase 3 */
export function AiSectionPlaceholder() {
  const styles = useStyles2(getPlaceholderStyles);
  return (
    <div className={styles.container}>
      <Icon name="ai" size="xxl" className={styles.icon} />
      <p className={styles.title}>{t('viz-options-sidebar.ai-placeholder-title', 'AI assistance')}</p>
      <p className={styles.body}>
        {t('viz-options-sidebar.ai-placeholder-body', 'Describe your visualization in plain English and AI will configure it for you. Coming soon.')}
      </p>
    </div>
  );
}

/** Placeholder for the Styles / quick-presets section — to be wired in Phase 2 */
export function StylesSectionPlaceholder() {
  const styles = useStyles2(getPlaceholderStyles);
  return (
    <div className={styles.container}>
      <Icon name="bolt" size="xxl" className={styles.icon} />
      <p className={styles.title}>{t('viz-options-sidebar.styles-placeholder-title', 'Style presets')}</p>
      <p className={styles.body}>
        {t('viz-options-sidebar.styles-placeholder-body', 'Quickly apply curated style presets and color palettes. Coming soon.')}
      </p>
    </div>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    container: css({
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      overflow: 'hidden',
    }),
    content: css({
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }),
    iconRail: css({
      width: 40,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: `1px solid ${theme.colors.border.weak}`,
    }),
    editTools: css({
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
      alignItems: 'center',
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(2),
      background: theme.colors.background.canvas,
      borderBottom: `1px solid ${theme.colors.border.weak}`,
    }),
    viewTools: css({
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
      alignItems: 'center',
      paddingTop: theme.spacing(1),
      background: theme.colors.background.primary,
    }),
  };
}

function getButtonStyles(theme: GrafanaTheme2) {
  return {
    button: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      padding: theme.spacing(0.5),
      borderRadius: theme.shape.radius.default,
      border: 'none',
      background: 'transparent',
      color: theme.colors.text.secondary,
      cursor: 'pointer',
      '&:hover': {
        background: theme.colors.action.hover,
        color: theme.colors.text.primary,
      },
    }),
    active: css({
      background: theme.colors.primary.main,
      color: theme.colors.primary.contrastText,
      '&:hover': {
        background: theme.colors.primary.shade,
        color: theme.colors.primary.contrastText,
      },
    }),
  };
}

function getPlaceholderStyles(theme: GrafanaTheme2) {
  return {
    container: css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: theme.spacing(4, 3),
      gap: theme.spacing(1),
      textAlign: 'center',
    }),
    icon: css({
      color: theme.colors.text.disabled,
      marginBottom: theme.spacing(1),
    }),
    title: css({
      ...theme.typography.h6,
      color: theme.colors.text.primary,
      margin: 0,
    }),
    body: css({
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
      margin: 0,
      maxWidth: 220,
    }),
  };
}
