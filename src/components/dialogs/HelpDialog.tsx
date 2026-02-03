import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../../hooks/useStore.js'

interface Props {
  width: number
  height: number
}

interface KeybindSection {
  title: string
  bindings: { key: string; desc: string }[]
}

const KEYBINDS: KeybindSection[] = [
  {
    title: 'Mode',
    bindings: [
      { key: 'i / Enter', desc: 'Insert mode' },
      { key: 'v / j / k', desc: 'Scroll mode' },
      { key: 'Esc / q', desc: 'Exit mode' },
    ],
  },
  {
    title: 'Scroll Mode',
    bindings: [
      { key: 'j / k', desc: 'Scroll up/down' },
      { key: 'g / G', desc: 'Top / bottom' },
      { key: 'n / p', desc: 'Next/prev code' },
      { key: 'y / c', desc: 'Copy code block' },
      { key: 'Mouse', desc: 'Scroll wheel' },
    ],
  },
  {
    title: 'Sessions',
    bindings: [
      { key: 'n', desc: 'New session' },
      { key: 's', desc: 'Session list' },
      { key: 'b', desc: 'Toggle sidebar' },
    ],
  },
  {
    title: 'Tabs',
    bindings: [
      { key: '1-9', desc: 'Switch tab' },
      { key: '[ / ]', desc: 'Prev/next tab' },
      { key: 'Ctrl+w', desc: 'Close tab' },
    ],
  },
  {
    title: 'Models',
    bindings: [
      { key: 'm', desc: 'Model selector' },
      { key: 'Tab', desc: '★ Toggle favorite' },
    ],
  },
  {
    title: 'Theme',
    bindings: [
      { key: 't', desc: 'Cycle theme' },
      { key: 'T', desc: 'Theme selector' },
    ],
  },
  {
    title: 'General',
    bindings: [
      { key: 'Ctrl+p / :', desc: 'Command palette' },
      { key: '?', desc: 'This help' },
      { key: 'c', desc: 'Clear error' },
      { key: 'q / Ctrl+c', desc: 'Quit' },
    ],
  },
  {
    title: 'Slash Commands',
    bindings: [
      { key: '/help', desc: 'Show help' },
      { key: '/models', desc: 'Model selector' },
      { key: '/sessions', desc: 'Session list' },
      { key: '/new', desc: 'New session' },
    ],
  },
]

export default function HelpDialog({ width, height }: Props) {
  const { theme } = useStore()
  
  // Split into two columns
  const leftSections = KEYBINDS.slice(0, 4)
  const rightSections = KEYBINDS.slice(4)
  const columnWidth = Math.floor((width - 4) / 2)
  
  const renderSection = (section: KeybindSection) => (
    <Box key={section.title} flexDirection="column" marginBottom={1}>
      <Text color={theme.accent} bold>{section.title}</Text>
      {section.bindings.map((bind) => (
        <Box key={bind.key}>
          <Box width={14}>
            <Text color={theme.success}>{bind.key}</Text>
          </Box>
          <Text color={theme.textMuted}>{bind.desc}</Text>
        </Box>
      ))}
    </Box>
  )
  
  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.accent} bold>Keybindings</Text>
        <Text color={theme.border}> │ </Text>
        <Text color={theme.textMuted}>Vim-style + mouse scroll</Text>
      </Box>
      
      {/* Two-column layout */}
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" width={columnWidth}>
          {leftSections.map(renderSection)}
        </Box>
        <Box width={2} />
        <Box flexDirection="column" width={columnWidth}>
          {rightSections.map(renderSection)}
        </Box>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1}>
        <Text color={theme.border}>─</Text>
        <Text color={theme.textMuted}> </Text>
        <Text color={theme.accent}>esc</Text>
        <Text color={theme.textMuted}> close</Text>
      </Box>
    </Box>
  )
}
