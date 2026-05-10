"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { useLayoutEffect } from "react";
import { allThemes } from "@/themes";

const ThemeContext = React.createContext(null);

export function ThemeProvider({ children, ...props }) {
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [currentTheme, setCurrentTheme] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme-preference");
    if (saved) setCurrentTheme(saved);
  }, []);

  const effectiveTheme =
    currentTheme || (resolvedTheme === "dark" ? "dark" : "light");

  useLayoutEffect(() => {
    if (!mounted || !effectiveTheme) return;
    const themeDef = allThemes.find((t) => t.id === effectiveTheme);
    if (!themeDef) return;
    const root = document.documentElement;
    Object.entries(themeDef.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    setNextTheme(themeDef.isDark ? "dark" : "light");
    localStorage.setItem("theme-preference", effectiveTheme);
  }, [effectiveTheme, mounted, setNextTheme]);

  const setTheme = (themeId) => {
    setCurrentTheme(themeId);
  };

  const value = {
    themes: allThemes,
    currentTheme: effectiveTheme,
    setTheme,
    isLoaded: mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export const useThemes = useTheme;
