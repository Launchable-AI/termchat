import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

export default function Sidebar() {
  const { theme, sessions, currentSessionId } = useStore()
  const { height } = useTerminalSize()
  
  const sidebarWidth = 30
  // Account for header (1) + footer (1)
  const contentHeight = height - 2
  const maxSessions = Math.max(3, contentHeight - 4) // header, gap, footer hint, padding
  
  // Helper to pad line to full width with background
  const line = (content: string, bg: string, fg: string, bold = false) => {
    const padded = content.padEnd(sidebarWidth, ' ')
    return <Text backgroundColor={bg} color={fg} bold={bold}>{padded}</Text>
  }
  
  // Build all lines for the sidebar
  const lines: React.ReactNode[] = []
  
  // Header
  lines.push(
    <Box key="header">{line(` Sessions (${sessions.length})`, theme.backgroundPanel, theme.text, true)}</Box>
  )
  lines.push(
    <Box key="gap1">{line('', theme.backgroundPanel, theme.text)}</Box>
  )
  
  // Session list
  if (sessions.length === 0) {
    lines.push(
      <Box key="empty">{line('  No sessions yet', theme.backgroundPanel, theme.textMuted)}</Box>
    )
  } else {
    sessions.slice(0, maxSessions).forEach((session) => {
      const isSelected = session.id === currentSessionId
      const prefix = isSelected ? ' ▸ ' : '   '
      const maxTitleLen = sidebarWidth - prefix.length - 1
      const truncatedTitle =
        session.title.length > maxTitleLen
          ? session.title.slice(0, maxTitleLen - 2) + '..'
          : session.title
      
      const bg = isSelected ? theme.backgroundElement : theme.backgroundPanel
      const fg = isSelected ? theme.accent : theme.textMuted
      
      lines.push(
        <Box key={session.id}>{line(prefix + truncatedTitle, bg, fg, isSelected)}</Box>
      )
    })
    
    if (sessions.length > maxSessions) {
      lines.push(
        <Box key="more">{line(`  +${sessions.length - maxSessions} more`, theme.backgroundPanel, theme.textMuted)}</Box>
      )
    }
  }
  
  // Calculate empty lines needed
  const usedLines = lines.length + 1 // +1 for footer
  const emptyLines = Math.max(0, contentHeight - usedLines)
  
  // Fill remaining space
  for (let i = 0; i < emptyLines; i++) {
    lines.push(
      <Box key={`fill-${i}`}>{line('', theme.backgroundPanel, theme.text)}</Box>
    )
  }
  
  // Footer hint
  lines.push(
    <Box key="footer">{line(' n new  s list', theme.backgroundPanel, theme.textMuted)}</Box>
  )
  
  return (
    <Box flexDirection="column" width={sidebarWidth}>
      {lines}
    </Box>
  )
}
