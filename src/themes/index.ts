import type { ThemeConfig, ResolvedTheme, ThemeColor, ThemeDefs } from './types.js'

// Built-in themes
export const themes: Record<string, ThemeConfig> = {
  opencode: {
    name: 'Default',
    defs: {
      bg: '#0d0c0c',
      bgPanel: '#141212',
      bgElement: '#1c1a1a',
      bgInput: '#1a1818',
      bgUser: '#1a1815',
      bgAssistant: '#0d0c0c',
      fg: '#e8e6e6',
      fgMuted: '#6e6c6c',
      border: '#2a2828',
      borderActive: '#4e4c4c',
      accent: '#f5a623',
      primary: '#e8e6e6',
      secondary: '#a8a6a6',
      red: '#ff6b6b',
      green: '#69db7c',
      yellow: '#ffd43b',
      blue: '#74c0fc',
      purple: '#da77f2',
      cyan: '#66d9e8',
    },
    theme: {
      primary: 'primary',
      secondary: 'secondary',
      accent: 'accent',
      error: 'red',
      warning: 'yellow',
      success: 'green',
      info: 'blue',
      text: 'fg',
      textMuted: 'fgMuted',
      background: 'bg',
      backgroundPanel: 'bgPanel',
      backgroundElement: 'bgElement',
      backgroundInput: 'bgInput',
      backgroundUser: 'bgUser',
      backgroundAssistant: 'bgAssistant',
      border: 'border',
      borderActive: 'borderActive',
      borderSubtle: 'border',
      syntaxComment: 'fgMuted',
      syntaxKeyword: 'purple',
      syntaxFunction: 'blue',
      syntaxString: 'green',
      syntaxNumber: 'accent',
      syntaxVariable: 'cyan',
      syntaxOperator: 'secondary',
      syntaxPunctuation: 'fgMuted',
      syntaxType: 'yellow',
    },
  },
  tokyonight: {
    name: 'Tokyo Night',
    defs: {
      bg: '#1a1b26',
      bgPanel: '#16161e',
      bgElement: '#1f2335',
      fg: '#c0caf5',
      fgMuted: '#565f89',
      border: '#3b4261',
      borderActive: '#7aa2f7',
      accent: '#ff9e64',
      primary: '#7aa2f7',
      secondary: '#bb9af7',
      red: '#f7768e',
      green: '#9ece6a',
      yellow: '#e0af68',
      blue: '#7aa2f7',
      purple: '#bb9af7',
      cyan: '#7dcfff',
    },
    theme: {
      primary: 'primary',
      secondary: 'secondary',
      accent: 'accent',
      error: 'red',
      warning: 'yellow',
      success: 'green',
      info: 'cyan',
      text: 'fg',
      textMuted: 'fgMuted',
      background: 'bg',
      backgroundPanel: 'bgPanel',
      backgroundElement: 'bgElement',
      border: 'border',
      borderActive: 'borderActive',
      borderSubtle: 'border',
      syntaxComment: 'fgMuted',
      syntaxKeyword: 'purple',
      syntaxFunction: 'blue',
      syntaxString: 'green',
      syntaxNumber: 'accent',
      syntaxVariable: 'cyan',
      syntaxOperator: 'secondary',
      syntaxPunctuation: 'fgMuted',
      syntaxType: 'yellow',
    },
  },
  catppuccin: {
    name: 'Catppuccin Mocha',
    defs: {
      bg: '#1e1e2e',
      bgPanel: '#181825',
      bgElement: '#313244',
      fg: '#cdd6f4',
      fgMuted: '#6c7086',
      border: '#45475a',
      borderActive: '#89b4fa',
      accent: '#fab387',
      primary: '#89b4fa',
      secondary: '#cba6f7',
      red: '#f38ba8',
      green: '#a6e3a1',
      yellow: '#f9e2af',
      blue: '#89b4fa',
      purple: '#cba6f7',
      cyan: '#94e2d5',
    },
    theme: {
      primary: 'primary',
      secondary: 'secondary',
      accent: 'accent',
      error: 'red',
      warning: 'yellow',
      success: 'green',
      info: 'cyan',
      text: 'fg',
      textMuted: 'fgMuted',
      background: 'bg',
      backgroundPanel: 'bgPanel',
      backgroundElement: 'bgElement',
      border: 'border',
      borderActive: 'borderActive',
      borderSubtle: 'border',
      syntaxComment: 'fgMuted',
      syntaxKeyword: 'purple',
      syntaxFunction: 'blue',
      syntaxString: 'green',
      syntaxNumber: 'accent',
      syntaxVariable: 'cyan',
      syntaxOperator: 'secondary',
      syntaxPunctuation: 'fgMuted',
      syntaxType: 'yellow',
    },
  },
  gruvbox: {
    name: 'Gruvbox Dark',
    defs: {
      bg: '#282828',
      bgPanel: '#1d2021',
      bgElement: '#3c3836',
      fg: '#ebdbb2',
      fgMuted: '#928374',
      border: '#504945',
      borderActive: '#fabd2f',
      accent: '#fe8019',
      primary: '#fabd2f',
      secondary: '#d3869b',
      red: '#fb4934',
      green: '#b8bb26',
      yellow: '#fabd2f',
      blue: '#83a598',
      purple: '#d3869b',
      cyan: '#8ec07c',
    },
    theme: {
      primary: 'primary',
      secondary: 'secondary',
      accent: 'accent',
      error: 'red',
      warning: 'yellow',
      success: 'green',
      info: 'blue',
      text: 'fg',
      textMuted: 'fgMuted',
      background: 'bg',
      backgroundPanel: 'bgPanel',
      backgroundElement: 'bgElement',
      border: 'border',
      borderActive: 'borderActive',
      borderSubtle: 'border',
      syntaxComment: 'fgMuted',
      syntaxKeyword: 'purple',
      syntaxFunction: 'blue',
      syntaxString: 'green',
      syntaxNumber: 'accent',
      syntaxVariable: 'cyan',
      syntaxOperator: 'secondary',
      syntaxPunctuation: 'fgMuted',
      syntaxType: 'yellow',
    },
  },
  nord: {
    name: 'Nord',
    defs: {
      bg: '#2e3440',
      bgPanel: '#242933',
      bgElement: '#3b4252',
      fg: '#eceff4',
      fgMuted: '#4c566a',
      border: '#4c566a',
      borderActive: '#88c0d0',
      accent: '#d08770',
      primary: '#88c0d0',
      secondary: '#b48ead',
      red: '#bf616a',
      green: '#a3be8c',
      yellow: '#ebcb8b',
      blue: '#81a1c1',
      purple: '#b48ead',
      cyan: '#8fbcbb',
    },
    theme: {
      primary: 'primary',
      secondary: 'secondary',
      accent: 'accent',
      error: 'red',
      warning: 'yellow',
      success: 'green',
      info: 'blue',
      text: 'fg',
      textMuted: 'fgMuted',
      background: 'bg',
      backgroundPanel: 'bgPanel',
      backgroundElement: 'bgElement',
      border: 'border',
      borderActive: 'borderActive',
      borderSubtle: 'border',
      syntaxComment: 'fgMuted',
      syntaxKeyword: 'purple',
      syntaxFunction: 'blue',
      syntaxString: 'green',
      syntaxNumber: 'accent',
      syntaxVariable: 'cyan',
      syntaxOperator: 'secondary',
      syntaxPunctuation: 'fgMuted',
      syntaxType: 'yellow',
    },
  },
  dracula: {
    name: 'Dracula',
    defs: {
      bg: '#282a36',
      bgPanel: '#21222c',
      bgElement: '#44475a',
      fg: '#f8f8f2',
      fgMuted: '#6272a4',
      border: '#44475a',
      borderActive: '#bd93f9',
      accent: '#ffb86c',
      primary: '#bd93f9',
      secondary: '#ff79c6',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#8be9fd',
      purple: '#bd93f9',
      cyan: '#8be9fd',
    },
    theme: {
      primary: 'primary',
      secondary: 'secondary',
      accent: 'accent',
      error: 'red',
      warning: 'yellow',
      success: 'green',
      info: 'cyan',
      text: 'fg',
      textMuted: 'fgMuted',
      background: 'bg',
      backgroundPanel: 'bgPanel',
      backgroundElement: 'bgElement',
      border: 'border',
      borderActive: 'borderActive',
      borderSubtle: 'border',
      syntaxComment: 'fgMuted',
      syntaxKeyword: 'secondary',
      syntaxFunction: 'green',
      syntaxString: 'yellow',
      syntaxNumber: 'purple',
      syntaxVariable: 'fg',
      syntaxOperator: 'secondary',
      syntaxPunctuation: 'fg',
      syntaxType: 'cyan',
    },
  },
}

function resolveColor(
  color: ThemeColor,
  defs: ThemeDefs,
  themeObj: ThemeConfig['theme'],
  mode: 'dark' | 'light' = 'dark'
): string {
  // Handle object with dark/light
  if (typeof color === 'object') {
    color = color[mode]
  }

  // Check if it's a reference to defs
  if (defs[color]) {
    return defs[color]
  }

  // Check if it's a reference to another theme property
  const themeKey = color as keyof ThemeConfig['theme']
  if (themeObj[themeKey] && themeKey !== color) {
    return resolveColor(themeObj[themeKey]!, defs, themeObj, mode)
  }

  // Return as-is (should be a hex color)
  return color
}

export function resolveTheme(
  config: ThemeConfig,
  mode: 'dark' | 'light' = 'dark'
): ResolvedTheme {
  const defs = config.defs || {}
  const t = config.theme

  const resolve = (key: keyof ThemeConfig['theme'], fallback?: string): string => {
    const val = t[key]
    if (val === undefined) {
      return fallback || '#ffffff'
    }
    return resolveColor(val, defs, t, mode)
  }

  return {
    name: config.name || 'Custom',
    primary: resolve('primary'),
    secondary: resolve('secondary'),
    accent: resolve('accent'),
    error: resolve('error'),
    warning: resolve('warning'),
    success: resolve('success'),
    info: resolve('info'),
    text: resolve('text'),
    textMuted: resolve('textMuted'),
    background: resolve('background'),
    backgroundPanel: resolve('backgroundPanel'),
    backgroundElement: resolve('backgroundElement'),
    backgroundInput: resolve('backgroundInput', resolve('backgroundElement')),
    backgroundUser: resolve('backgroundUser', resolve('backgroundElement')),
    backgroundAssistant: resolve('backgroundAssistant', resolve('background')),
    border: resolve('border'),
    borderActive: resolve('borderActive'),
    borderSubtle: resolve('borderSubtle', resolve('border')),
    selectedListItemText: resolve('selectedListItemText', resolve('background')),
    syntaxComment: resolve('syntaxComment', resolve('textMuted')),
    syntaxKeyword: resolve('syntaxKeyword', resolve('secondary')),
    syntaxFunction: resolve('syntaxFunction', resolve('primary')),
    syntaxString: resolve('syntaxString', resolve('success')),
    syntaxNumber: resolve('syntaxNumber', resolve('accent')),
    syntaxVariable: resolve('syntaxVariable', resolve('info')),
    syntaxOperator: resolve('syntaxOperator', resolve('secondary')),
    syntaxPunctuation: resolve('syntaxPunctuation', resolve('textMuted')),
    syntaxType: resolve('syntaxType', resolve('warning')),
  }
}

export function getTheme(name: string): ResolvedTheme {
  const config = themes[name] || themes.opencode
  return resolveTheme(config)
}

export function getAvailableThemes(): string[] {
  return Object.keys(themes)
}

export type { ThemeConfig, ResolvedTheme }
