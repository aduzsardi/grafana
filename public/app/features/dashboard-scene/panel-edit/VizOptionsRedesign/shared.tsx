import { css, cx } from '@emotion/css';
import { ReactNode } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Slider, Switch, useStyles2 } from '@grafana/ui';

// ─── Section card ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  dotColor?: string; // hex — defaults to theme primary
  children: ReactNode;
}

export function SectionCard({ title, dotColor, children }: SectionCardProps) {
  const styles = useStyles2(getSectionCardStyles);
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span
          className={styles.dot}
          style={dotColor ? { background: dotColor } : undefined}
        />
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

function getSectionCardStyles(theme: GrafanaTheme2) {
  return {
    card: css({
      background: theme.colors.background.primary,
      borderRadius: theme.shape.radius.default,
      border: `1px solid ${theme.colors.border.weak}`,
      overflow: 'hidden',
    }),
    header: css({
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      padding: theme.spacing(1.5, 2),
      borderBottom: `1px solid ${theme.colors.border.weak}`,
    }),
    dot: css({
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: theme.colors.primary.main,
      flexShrink: 0,
    }),
    title: css({
      ...theme.typography.h6,
      color: theme.colors.text.primary,
      margin: 0,
    }),
    body: css({
      padding: theme.spacing(2),
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    }),
  };
}

// ─── Label ────────────────────────────────────────────────────────────────────

interface ControlLabelProps {
  label: string;
}

export function ControlLabel({ label }: ControlLabelProps) {
  const styles = useStyles2(getControlLabelStyles);
  return <span className={styles.label}>{label}</span>;
}

function getControlLabelStyles(theme: GrafanaTheme2) {
  return {
    label: css({
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
      display: 'block',
      marginBottom: theme.spacing(0.75),
    }),
  };
}

// ─── Control row (label + full-width control) ─────────────────────────────────

interface ControlRowProps {
  label: string;
  children: ReactNode;
}

export function ControlRow({ label, children }: ControlRowProps) {
  return (
    <div>
      <ControlLabel label={label} />
      {children}
    </div>
  );
}

// ─── Two columns ──────────────────────────────────────────────────────────────

interface TwoColumnsProps {
  left: ReactNode;
  right: ReactNode;
}

export function TwoColumns({ left, right }: TwoColumnsProps) {
  const styles = useStyles2(getTwoColumnsStyles);
  return (
    <div className={styles.row}>
      <div className={styles.col}>{left}</div>
      <div className={styles.col}>{right}</div>
    </div>
  );
}

function getTwoColumnsStyles(theme: GrafanaTheme2) {
  return {
    row: css({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: theme.spacing(2),
    }),
    col: css({ minWidth: 0 }),
  };
}

// ─── Labeled slider ───────────────────────────────────────────────────────────

interface ValueSliderProps {
  label: string;
  inputId: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onAfterChange: (v: number) => void;
  formatValue?: (v: number) => string;
}

export function ValueSlider({ label, inputId, min, max, step, value, onAfterChange, formatValue }: ValueSliderProps) {
  const styles = useStyles2(getValueSliderStyles);
  const display = formatValue ? formatValue(value) : String(value);
  return (
    <div>
      <div className={styles.labelRow}>
        <ControlLabel label={label} />
        <span className={styles.value}>{display}</span>
      </div>
      <Slider
        inputId={inputId}
        min={min}
        max={max}
        step={step}
        value={value}
        onAfterChange={(v) => onAfterChange(v ?? value)}
      />
    </div>
  );
}

function getValueSliderStyles(theme: GrafanaTheme2) {
  return {
    labelRow: css({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    }),
    value: css({
      ...theme.typography.bodySmall,
      color: theme.colors.primary.text,
      fontWeight: theme.typography.fontWeightMedium,
    }),
  };
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  const styles = useStyles2(getToggleRowStyles);
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <Switch value={value} onChange={(e) => onChange(e.currentTarget.checked)} />
    </div>
  );
}

function getToggleRowStyles(theme: GrafanaTheme2) {
  return {
    row: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(0.75, 1.25),
      background: theme.colors.background.canvas,
      borderRadius: theme.shape.radius.default,
    }),
    label: css({
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
    }),
  };
}

// ─── Card option group ────────────────────────────────────────────────────────

export interface CardOption<T> {
  value: T;
  label: string;
  icon: ReactNode; // SVG element
}

interface CardOptionGroupProps<T> {
  options: Array<CardOption<T>>;
  value: T;
  onChange: (v: T) => void;
}

export function CardOptionGroup<T>({ options, value, onChange }: CardOptionGroupProps<T>) {
  const styles = useStyles2(getCardOptionGroupStyles);
  return (
    <div className={styles.grid}>
      {options.map((opt, i) => (
        <button
          key={i}
          className={cx(styles.card, opt.value === value && styles.cardSelected)}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          <span className={cx(styles.icon, opt.value === value && styles.iconSelected)}>
            {opt.icon}
          </span>
          <span className={styles.label}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function getCardOptionGroupStyles(theme: GrafanaTheme2) {
  return {
    grid: css({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
      gap: theme.spacing(1),
    }),
    card: css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(0.75),
      padding: theme.spacing(1, 0.5),
      background: theme.colors.background.canvas,
      border: `1.5px solid ${theme.colors.border.weak}`,
      borderRadius: theme.shape.radius.default,
      cursor: 'pointer',
      transition: 'border-color 0.15s, background 0.15s',
      '&:hover': {
        borderColor: theme.colors.border.strong,
      },
    }),
    cardSelected: css({
      borderColor: theme.colors.primary.main,
      background: `${theme.colors.primary.main}18`,
    }),
    icon: css({
      color: theme.colors.text.secondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 28,
    }),
    iconSelected: css({
      color: theme.colors.primary.text,
    }),
    label: css({
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
      fontSize: 11,
      lineHeight: 1,
      letterSpacing: 0.1,
    }),
  };
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

export const Icons = {
  Lines: (
    <svg viewBox="0 0 36 28" width={36} height={28} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,22 9,12 16,17 23,7 34,11" />
    </svg>
  ),
  Bars: (
    <svg viewBox="0 0 36 28" width={36} height={28} fill="currentColor">
      <rect x="2" y="16" width="6" height="10" rx="1" />
      <rect x="12" y="10" width="6" height="16" rx="1" />
      <rect x="22" y="5" width="6" height="21" rx="1" />
    </svg>
  ),
  Points: (
    <svg viewBox="0 0 36 28" width={36} height={28} fill="currentColor">
      <circle cx="4" cy="22" r="3" />
      <circle cx="13" cy="12" r="3" />
      <circle cx="22" cy="17" r="3" />
      <circle cx="32" cy="7" r="3" />
    </svg>
  ),
  Linear: (
    <svg viewBox="0 0 36 28" width={36} height={28} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="3" y1="22" x2="33" y2="6" />
    </svg>
  ),
  Smooth: (
    <svg viewBox="0 0 36 28" width={36} height={28} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M3,22 C10,22 10,6 18,6 C26,6 26,16 33,12" />
    </svg>
  ),
  Step: (
    <svg viewBox="0 0 36 28" width={36} height={28} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,22 14,22 14,10 24,10 24,16 33,16" />
    </svg>
  ),
  GaugeCircle: (
    <svg viewBox="0 0 36 36" width={36} height={36} fill="none" stroke="currentColor" strokeWidth={3}>
      <circle cx="18" cy="18" r="11" />
    </svg>
  ),
  GaugeArc: (
    <svg viewBox="0 0 36 36" width={36} height={36} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
      <path d="M5,28 A13,13 0 1,1 31,28" />
      <line x1="18" y1="15" x2="18" y2="22" strokeWidth={2.5} />
    </svg>
  ),
};
