import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../../hooks/useStore.js'

interface Props {
  width: number
  height: number
}

interface KeybindSection {
  title: string
  bindings: { key: string; description: string }[]
}

const KEYBINDS: KeybindSection[] = [
  {
    title: 'Mode',
    bindings: [
      { key: 'i, Enter', description: 'Enter insert mode (start typing)' },
      { key: 'Esc', description: 'Exit insert mode' },
    ],
  },
  {
    title: 'Navigation',
    bindings: [
      { key: 'j / ↓', description: 'Move down' },
      { key: 'k / ↑', description: 'Move up' },
      { key: 'Ctrl+d', description: 'Page down' },
      { key: 'Ctrl+u', description: 'Page up' },
    ],
  },
  {
    title: 'Sessions & Tabs',
    bindings: [
      { key: 'n', description: 'New session' },
      { key: 's', description: 'Session list' },
      { key: 'b', description: 'Toggle sidebar' },
      { key: '1-9', description: 'Switch to tab 1-9' },
      { key: '[ / ]', description: 'Prev/next tab' },
      { key: 'Ctrl+w', description: 'Close current tab' },
    ],
  },
  {
    title: 'Models & Themes',
    bindings: [
      { key: 'm', description: 'Model selector (fuzzy search)' },
      { key: 't', description: 'Cycle theme' },
      { key: 'T (shift)', description: 'Theme selector' },
    ],
  },
  {
    title: 'General',
    bindings: [
      { key: 'Ctrl+p / :', description: 'Command palette' },
      { key: '?', description: 'This help dialog' },
      { key: 'c', description: 'Clear error' },
      { key: 'q', description: 'Quit' },
      { key: 'Ctrl+c', description: 'Cancel streaming / Quit' },
    ],
  },
  {
    title: 'Slash Commands',
    bindings: [
      { key: '/help', description: 'Show help' },
      { key: '/models', description: 'Model selector' },
      { key: '/sessions', description: 'Session list' },
      { key: '/theme', description: 'Theme selector' },
      { key: '/new', description: 'New session' },
      { key: '/quit', description: 'Quit' },
    ],
  },
]

export default function HelpDialog({ width, height }: Props) {
  const { theme } = useStore()
  
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.primary} bold>
          TermChat Help
        </Text>
        <Text color={theme.textMuted}> · </Text>
        <Text color={theme.textMuted}>
          Vim-inspired keybindings
        </Text>
      </Box>
      
      {/* Content - two columns */}
      <Box flexDirection="row" height={height - 4}>
        <Box flexDirection="column" width={Math.floor(width / 2) - 2}>
          {KEYBINDS.slice(0, 3).map((section) => (
            <Box key={section.title} flexDirection="column" marginBottom={1}>
              <Text color={theme.accent} bold>
                {section.title}
              </Text>
              {section.bindings.map((bind) => (
                <Box key={bind.key}>
                  <Box width={14}>
                    <Text color={theme.success}>{bind.key}</Text>
                  </Box>
                  <Text color={theme.textMuted}>{bind.description}</Text>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
        
        <Box flexDirection="column" width={Math.floor(width / 2) - 2}>
          {KEYBINDS.slice(3).map((section) => (
            <Box key={section.title} flexDirection="column" marginBottom={1}>
              <Text color={theme.accent} bold>
                {section.title}
              </Text>
              {section.bindings.map((bind) => (
                <Box key={bind.key}>
                  <Box width={14}>
                    <Text color={theme.success}>{bind.key}</Text>
                  </Box>
                  <Text color={theme.textMuted}>{bind.description}</Text>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} borderStyle="single" borderColor={theme.border} borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} paddingTop={0}>
        <Text color={theme.textMuted}>
          Press Esc to close
        </Text>
      </Box>
    </Box>
  )
}
