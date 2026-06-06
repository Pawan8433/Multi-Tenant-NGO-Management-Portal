import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../theme/theme.js';

const ColorModeContext = createContext({ mode: 'light', toggle: () => {} });

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('ih_mode') || 'light');

  const value = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((m) => {
          const next = m === 'light' ? 'dark' : 'light';
          localStorage.setItem('ih_mode', next);
          return next;
        }),
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorMode = () => useContext(ColorModeContext);
