export type Tone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'secondary'
  | 'neutral';

export type ToneAppearance = 'filled' | 'outlined' | 'plain' | 'soft';

export interface ToneStyle {
  color: string;
  backgroundColor: string;
  borderColor: string;
}

const SURFACE = 'var(--_components-paper-elevation-0, #FFF)';

const NEUTRAL_BORDER = 'var(--_components-chip-defaultEnabledBorder, #BDBDBD)';

interface ToneTokens {
  main: string;

  contrast: string;

  soft: string;

  filledBackground?: string;

  outlinedBorder?: string;
}

const TONES: Record<Tone, ToneTokens> = {
  primary: {
    main: 'var(--primary-main, #1976D2)',
    contrast: 'var(--primary-contrastText, #FFF)',
    soft: SURFACE,
  },
  success: {
    main: 'var(--success-main, #2E7D32)',
    contrast: 'var(--success-contrastText, #FFF)',
    soft: 'var(--_components-alert-success-background, #EDF7ED)',
  },
  warning: {
    main: 'var(--warning-main, #EF6C00)',
    contrast: 'var(--warning-contrastText, #FFF)',
    soft: 'var(--_components-alert-warning-background, #FFF4E5)',
  },
  error: {
    main: 'var(--error-main, #D32F2F)',
    contrast: 'var(--error-contrastText, #FFF)',
    soft: 'var(--_components-alert-error-background, #FDEDED)',
  },
  info: {
    main: 'var(--info-main, #0288D1)',
    contrast: 'var(--info-contrastText, #FFF)',
    soft: SURFACE,
  },
  secondary: {
    main: 'var(--secondary-main, #9C27B0)',

    contrast: 'var(--info-contrastText, #FFF)',
    soft: SURFACE,
  },
  neutral: {
    main: 'var(--text-primary, rgba(0, 0, 0, 0.87))',

    contrast: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
    soft: SURFACE,
    filledBackground: 'var(--action-selected, rgba(0, 0, 0, 0.08))',
    outlinedBorder: NEUTRAL_BORDER,
  },
};

export function resolveTone(
  tone: Tone,
  appearance: ToneAppearance = 'filled'
): ToneStyle {
  const tokens = TONES[tone];

  switch (appearance) {
    case 'filled': {
      const background = tokens.filledBackground ?? tokens.main;

      return {
        color: tokens.contrast,
        backgroundColor: background,
        borderColor: background,
      };
    }

    case 'outlined':
      return {
        color: tokens.main,
        backgroundColor: SURFACE,
        borderColor: tokens.outlinedBorder ?? tokens.main,
      };

    case 'plain':
      return {
        color: tokens.main,
        backgroundColor: 'transparent',
        borderColor: tokens.outlinedBorder ?? tokens.main,
      };

    case 'soft':
      return {
        color: tokens.main,
        backgroundColor: tokens.soft,
        borderColor: tokens.outlinedBorder ?? tokens.main,
      };
  }
}
