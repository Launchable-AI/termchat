// Theme type definitions - OpenCode compatible
export interface ThemeDefs {
  [key: string]: string
}

export interface ThemeColorValue {
  dark: string
  light: string
}

export type ThemeColor = string | ThemeColorValue

export interface ThemeConfig {
  $schema?: string
  name?: string
  defs?: ThemeDefs
  theme: {
    primary: ThemeColor
    secondary: ThemeColor
    accent: ThemeColor
    error: ThemeColor
    warning: ThemeColor
    success: ThemeColor
    info: ThemeColor
    text: ThemeColor
    textMuted: ThemeColor
    background: ThemeColor
    backgroundPanel: ThemeColor
    backgroundElement: ThemeColor
    backgroundInput?: ThemeColor
    backgroundUser?: ThemeColor
    backgroundAssistant?: ThemeColor
    border: ThemeColor
    borderActive: ThemeColor
    borderSubtle: ThemeColor
    // Optional extras
    selectedListItemText?: ThemeColor
    // Syntax highlighting
    syntaxComment?: ThemeColor
    syntaxKeyword?: ThemeColor
    syntaxFunction?: ThemeColor
    syntaxString?: ThemeColor
    syntaxNumber?: ThemeColor
    syntaxVariable?: ThemeColor
    syntaxOperator?: ThemeColor
    syntaxPunctuation?: ThemeColor
    syntaxType?: ThemeColor
  }
}

export interface ResolvedTheme {
  name: string
  primary: string
  secondary: string
  accent: string
  error: string
  warning: string
  success: string
  info: string
  text: string
  textMuted: string
  background: string
  backgroundPanel: string
  backgroundElement: string
  backgroundInput: string
  backgroundUser: string
  backgroundAssistant: string
  border: string
  borderActive: string
  borderSubtle: string
  selectedListItemText: string
  syntaxComment: string
  syntaxKeyword: string
  syntaxFunction: string
  syntaxString: string
  syntaxNumber: string
  syntaxVariable: string
  syntaxOperator: string
  syntaxPunctuation: string
  syntaxType: string
}
