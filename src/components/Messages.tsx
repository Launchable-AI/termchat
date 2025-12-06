import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

export default function Messages() {
  const { theme, getCurrentSession, isStreaming, error, sidebarVisible } = useStore()
  const { width, height } = useTerminalSize()
  
  const session = getCurrentSession()
  
  // Calculate content width (account for sidebar if visible)
  const sidebarWidth = sidebarVisible ? 31 : 0 // 30 + 1 for separator
  const contentWidth = width - sidebarWidth
  const contentHeight = height - 2 // header + footer
  
  // Helper to create a filled line
  const fillLine = (content: string, bg: string, fg: string, bold = false) => {
    const padded = content.padEnd(contentWidth, ' ')
    return <Text backgroundColor={bg} color={fg} bold={bold}>{padded}</Text>
  }
  
  if (error) {
    const lines: React.ReactNode[] = []
    lines.push(<Box key="err1">{fillLine('', theme.background, theme.text)}</Box>)
    lines.push(<Box key="err2">{fillLine('  Error', theme.background, theme.error, true)}</Box>)
    lines.push(<Box key="err3">{fillLine('', theme.background, theme.text)}</Box>)
    lines.push(<Box key="err4">{fillLine('  ' + error, theme.background, theme.text)}</Box>)
    lines.push(<Box key="err5">{fillLine('', theme.background, theme.text)}</Box>)
    lines.push(<Box key="err6">{fillLine("  Press 'c' to clear", theme.background, theme.textMuted)}</Box>)
    
    // Fill remaining
    for (let i = lines.length; i < contentHeight; i++) {
      lines.push(<Box key={`fill-${i}`}>{fillLine('', theme.background, theme.text)}</Box>)
    }
    
    return <Box flexDirection="column" flexGrow={1}>{lines}</Box>
  }
  
  if (!session || session.messages.length === 0) {
    const lines: React.ReactNode[] = []
    const midPoint = Math.floor(contentHeight / 2) - 1
    
    // Fill top half
    for (let i = 0; i < midPoint; i++) {
      lines.push(<Box key={`top-${i}`}>{fillLine('', theme.background, theme.text)}</Box>)
    }
    
    // Center message
    const msg1 = session ? 'Start a conversation' : 'No session selected'
    const msg2 = 'Press i to start typing, or ? for help'
    const pad1 = Math.max(0, Math.floor((contentWidth - msg1.length) / 2))
    const pad2 = Math.max(0, Math.floor((contentWidth - msg2.length) / 2))
    
    lines.push(<Box key="msg1">{fillLine(' '.repeat(pad1) + msg1, theme.background, theme.text)}</Box>)
    lines.push(<Box key="gap">{fillLine('', theme.background, theme.text)}</Box>)
    lines.push(<Box key="msg2">{fillLine(' '.repeat(pad2) + msg2, theme.background, theme.textMuted)}</Box>)
    
    // Fill bottom
    for (let i = lines.length; i < contentHeight; i++) {
      lines.push(<Box key={`bot-${i}`}>{fillLine('', theme.background, theme.text)}</Box>)
    }
    
    return <Box flexDirection="column" flexGrow={1}>{lines}</Box>
  }
  
  // Render messages with filled backgrounds
  const lines: React.ReactNode[] = []
  
  session.messages.forEach((message, index) => {
    const isUser = message.role === 'user'
    const isLast = index === session.messages.length - 1
    const isAssistantStreaming = isStreaming && !isUser && isLast
    const bg = isUser ? theme.backgroundPanel : theme.background
    const borderColor = isUser ? theme.accent : theme.primary
    
    // Empty line before message (except first)
    if (index > 0) {
      lines.push(<Box key={`gap-${index}`}>{fillLine('', bg, theme.text)}</Box>)
    }
    
    // Header line with colored border
    const roleName = isUser ? 'You' : 'Assistant'
    const modelInfo = message.model && !isUser 
      ? `  ${message.model.split('/').pop()?.replace(/:.*$/, '')}` 
      : ''
    const streamingIndicator = isAssistantStreaming ? '  ●' : ''
    
    // Build header with colored left border
    const headerContent = `  ${roleName}${modelInfo}${streamingIndicator}`
    lines.push(
      <Box key={`header-${message.id}`}>
        <Text backgroundColor={bg} color={borderColor}>{'█'}</Text>
        <Text backgroundColor={bg} color={theme.text} bold>{` ${roleName}`}</Text>
        <Text backgroundColor={bg} color={theme.textMuted}>{modelInfo}</Text>
        {isAssistantStreaming && <Text backgroundColor={bg} color={theme.success}>{streamingIndicator}</Text>}
        <Text backgroundColor={bg}>{' '.repeat(Math.max(0, contentWidth - headerContent.length - 1))}</Text>
      </Box>
    )
    
    // Content lines
    const content = message.content || (isAssistantStreaming ? '...' : '')
    const contentLines = content.split('\n')
    
    contentLines.forEach((line, lineIdx) => {
      // Word wrap long lines
      const maxLineWidth = contentWidth - 4 // account for left padding
      if (line.length <= maxLineWidth) {
        lines.push(
          <Box key={`content-${message.id}-${lineIdx}`}>
            {fillLine('    ' + line, bg, theme.text)}
          </Box>
        )
      } else {
        // Simple word wrap
        let remaining = line
        let subIdx = 0
        while (remaining.length > 0) {
          const chunk = remaining.slice(0, maxLineWidth)
          remaining = remaining.slice(maxLineWidth)
          lines.push(
            <Box key={`content-${message.id}-${lineIdx}-${subIdx}`}>
              {fillLine('    ' + chunk, bg, theme.text)}
            </Box>
          )
          subIdx++
        }
      }
    })
  })
  
  // Fill remaining space with background
  for (let i = lines.length; i < contentHeight; i++) {
    lines.push(<Box key={`fill-${i}`}>{fillLine('', theme.background, theme.text)}</Box>)
  }
  
  return (
    <Box flexDirection="column" flexGrow={1} overflowY="hidden">
      {lines.slice(0, contentHeight)}
    </Box>
  )
}
