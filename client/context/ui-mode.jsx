"use client";

import * as React from "react";

const UI_MODE_STORAGE_KEY = "bb-ui-mode";

const UiModeContext = React.createContext(null);

function persistUiMode(mode) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(UI_MODE_STORAGE_KEY, mode);
  document.documentElement.dataset.uiMode = mode;
  document.cookie = `ui-mode=${mode}; path=/; max-age=31536000; samesite=lax`;
}

export function UiModeProvider({ children, initialMode = "classic" }) {
  const [uiMode, setUiModeState] = React.useState(initialMode);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    persistUiMode(uiMode);
  }, [uiMode]);

  const setUiMode = React.useCallback((mode) => {
    setUiModeState(mode);
    persistUiMode(mode);
  }, []);

  const toggleUiMode = React.useCallback(() => {
    setUiMode(uiMode === "new" ? "classic" : "new");
  }, [setUiMode, uiMode]);

  const value = React.useMemo(
    () => ({
      uiMode,
      setUiMode,
      toggleUiMode,
    }),
    [setUiMode, toggleUiMode, uiMode],
  );

  return (
    <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>
  );
}

export function useUiMode() {
  const context = React.useContext(UiModeContext);

  if (!context) {
    throw new Error("useUiMode must be used within a UiModeProvider");
  }

  return context;
}
