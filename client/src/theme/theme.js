import { createTheme, alpha } from '@mui/material/styles';

// Distinctive, cohesive enterprise palette: deep teal (growth/trust) with a
// warm amber accent on calm neutrals. Sora for display, Manrope for text.
const brand = {
  teal: '#0F766E',
  tealLight: '#14B8A6',
  tealDark: '#0B5853',
  amber: '#F59E0B',
};

export function getTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: brand.teal, light: brand.tealLight, dark: brand.tealDark, contrastText: '#fff' },
      secondary: { main: brand.amber, contrastText: '#1f2937' },
      success: { main: '#16a34a' },
      warning: { main: '#d97706' },
      error: { main: '#dc2626' },
      info: { main: '#0ea5e9' },
      background: isDark
        ? { default: '#0B1220', paper: '#111B2E' }
        : { default: '#F5F7F6', paper: '#FFFFFF' },
      text: isDark
        ? { primary: '#E6EAF2', secondary: '#9AA7BD' }
        : { primary: '#0F1B2D', secondary: '#5B6B82' },
      divider: isDark ? alpha('#9AA7BD', 0.16) : alpha('#0F1B2D', 0.08),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Manrope", system-ui, sans-serif',
      h1: { fontFamily: '"Sora", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontFamily: '"Sora", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontFamily: '"Sora", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontFamily: '"Sora", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
      h6: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
      button: { fontWeight: 600, textTransform: 'none' },
      subtitle2: { fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: isDark ? '#0B1220' : '#F5F7F6' },
          '::-webkit-scrollbar': { width: 10, height: 10 },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: alpha('#7C8AA0', 0.4),
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: isDark ? alpha('#9AA7BD', 0.16) : alpha('#0F1B2D', 0.08) },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0, variant: 'outlined' },
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'box-shadow .2s ease, transform .2s ease',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16, paddingBlock: 8 },
          containedPrimary: {
            background: `linear-gradient(135deg, ${brand.tealLight}, ${brand.teal})`,
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: isDark ? '#9AA7BD' : '#5B6B82',
            backgroundColor: isDark ? alpha('#9AA7BD', 0.04) : alpha('#0F1B2D', 0.02),
          },
        },
      },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontSize: 12 } } },
    },
  });
}
