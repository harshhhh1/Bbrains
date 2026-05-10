"use client";

import * as React from "react";
import { useTheme } from "@/context/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Check } from "lucide-react";

export function ThemeSwitcher() {
  const { themes, currentTheme, setTheme, isLoaded } = useTheme();
  if (!isLoaded) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-4 w-4 animate-pulse" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const activeThemeDef = themes.find((t) => t.id === currentTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {activeThemeDef?.isDark ? (
            <Moon className="h-4 w-4 transition-all" />
          ) : (
            <Sun className="h-4 w-4 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          System Themes
        </div>
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {theme.id === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span>{theme.name}</span>
            </div>
            {currentTheme === theme.id && (
              <Check className="h-4 w-4 text-brand-purple" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
