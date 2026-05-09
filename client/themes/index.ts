// Centralized theme configuration
export type ThemeType = 'light' | 'dark';

export interface ThemeDefinition {
  id: ThemeType;
  name: string;
  description: string;
  preview?: string;
  isBuiltIn: boolean;
  isDark: boolean;
  variables: Record<string, string>;
  price?: number;
}

// Built-in themes (available to all users)
export const builtInThemes: ThemeDefinition[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean light theme with soft colors',
    isBuiltIn: true,
    isDark: false,
    variables: {
      '--background': 'oklch(1 0 0)',
      '--foreground': 'oklch(0.141 0.005 285.823)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.141 0.005 285.823)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.141 0.005 285.823)',
      '--primary': 'oklch(0.488 0.243 264.376)',
      '--primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--secondary': 'oklch(0.967 0.001 286.375)',
      '--secondary-foreground': 'oklch(0.21 0.006 285.885)',
      '--muted': 'oklch(0.967 0.001 286.375)',
      '--muted-foreground': 'oklch(0.552 0.016 285.938)',
      '--accent': 'oklch(0.488 0.243 264.376)',
      '--accent-foreground': 'oklch(0.97 0.014 254.604)',
      '--destructive': 'oklch(0.577 0.245 27.325)',
      '--border': 'oklch(0.92 0.004 286.32)',
      '--input': 'oklch(0.92 0.004 286.32)',
      '--ring': 'oklch(0.705 0.015 286.067)',
      '--chart-1': 'oklch(0.488 0.243 264.376)',
      '--chart-2': 'oklch(0.646 0.222 41.116)',
      '--chart-3': 'oklch(0.603 0.118 184.704)',
      '--chart-4': 'oklch(0.828 0.189 84.429)',
      '--chart-5': 'oklch(0.769 0.188 70.08)',
      '--sidebar': 'oklch(0.967 0.001 286.375)',
      '--sidebar-foreground': 'oklch(0.141 0.005 285.823)',
      '--sidebar-primary': 'oklch(0.546 0.245 262.881)',
      '--sidebar-primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--sidebar-accent': 'oklch(0.488 0.243 264.376)',
      '--sidebar-accent-foreground': 'oklch(0.97 0.014 254.604)',
      '--sidebar-border': 'transparent',
      '--sidebar-ring': 'oklch(0.705 0.015 286.067)',
      '--dashboard-bg': 'oklch(0.967 0.001 286.375)',
      '--dashboard-surface': 'oklch(1 0 0)'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme for low-light environments',
    isBuiltIn: true,
    isDark: true,
    variables: {
      '--background': 'oklch(0.141 0.005 285.823)',
      '--foreground': 'oklch(0.985 0 0)',
      '--card': 'oklch(0.21 0.006 285.885)',
      '--card-foreground': 'oklch(0.985 0 0)',
      '--popover': 'oklch(0.21 0.006 285.885)',
      '--popover-foreground': 'oklch(0.985 0 0)',
      '--primary': 'oklch(0.42 0.18 266)',
      '--primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--secondary': 'oklch(0.274 0.006 286.033)',
      '--secondary-foreground': 'oklch(0.985 0 0)',
      '--muted': 'oklch(0.274 0.006 286.033)',
      '--muted-foreground': 'oklch(0.705 0.015 286.067)',
      '--accent': 'oklch(0.42 0.18 266)',
      '--accent-foreground': 'oklch(0.97 0.014 254.604)',
      '--destructive': 'oklch(0.704 0.191 22.216)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.552 0.016 285.938)',
      '--chart-1': 'oklch(0.42 0.18 266)',
      '--chart-2': 'oklch(0.536 0.186 38.337)',
      '--chart-3': 'oklch(0.482 0.15 178.653)',
      '--chart-4': 'oklch(0.74 0.16 85)',
      '--chart-5': 'oklch(0.68 0.12 65)',
      '--sidebar': 'oklch(0.141 0.005 285.823)',
      '--sidebar-foreground': 'oklch(0.985 0 0)',
      '--sidebar-primary': 'oklch(0.623 0.214 259.815)',
      '--sidebar-primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--sidebar-accent': 'oklch(0.42 0.18 266)',
      '--sidebar-accent-foreground': 'oklch(0.97 0.014 254.604)',
      '--sidebar-border': 'transparent',
      '--sidebar-ring': 'oklch(0.552 0.016 285.938)',
      '--dashboard-bg': 'oklch(0.141 0.005 285.823)',
      '--dashboard-surface': 'oklch(0.21 0.006 285.885)'
    }
  }
];

// All themes combined
export const allThemes: ThemeDefinition[] = [...builtInThemes];

// Get theme by ID
export const getThemeById = (id: ThemeType): ThemeDefinition | undefined => {
  return allThemes.find(theme => theme.id === id);
};

// Check if theme is built-in (free)
export const isBuiltInTheme = (id: ThemeType): boolean => {
  return builtInThemes.some(theme => theme.id === id);
};