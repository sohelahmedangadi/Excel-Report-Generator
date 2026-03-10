import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('ds_theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    document.body.style.background = dark ? '#0F1117' : '#F8FAFC';
    document.body.style.color      = dark ? '#E2E8F0' : '#1E293B';
    try { localStorage.setItem('ds_theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  const toggle = () => setDark(d => !d);
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
