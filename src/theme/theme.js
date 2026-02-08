// src/theme/theme.js
export const COLORS = {
  // Primary - Deep Ocean Blues with Gold Accents
  primary: '#0A0E27',
  primaryLight: '#1a2847',
  primaryDark: '#050813',
  
  // Accent - Luxurious Gold
  accent: '#F4B942',
  accentLight: '#FFD670',
  accentDark: '#D49B2F',
  
  // Secondary - Rich Teals
  secondary: '#14B8A6',
  secondaryLight: '#2DD4BF',
  secondaryDark: '#0F766E',
  
  // Success & Error
  success: '#10B981',
  successLight: '#34D399',
  error: '#EF4444',
  errorLight: '#F87171',
  warning: '#F59E0B',
  
  // Neutrals - Sophisticated Grays
  background: '#F8FAFC',
  backgroundDark: '#0F172A',
  surface: '#FFFFFF',
  surfaceDark: '#1E293B',
  
  text: '#0F172A',
  textLight: '#64748B',
  textDark: '#F8FAFC',
  textMuted: '#94A3B8',
  
  border: '#E2E8F0',
  borderDark: '#334155',
  
  // Gradients
  gradientStart: '#0A0E27',
  gradientEnd: '#1a2847',
  
  // Chart Colors
  chartPositive: '#10B981',
  chartNegative: '#EF4444',
  chartNeutral: '#6366F1',
  chartAccent: '#F4B942',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#F4B942',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const ANIMATIONS = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    default: 'ease-in-out',
    in: 'ease-in',
    out: 'ease-out',
  },
};
