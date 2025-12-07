import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

const SIDEBAR_WIDTH = 27

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Sidebar() {
  const { theme, sessions, currentSessionId, tabs } = useStore()
  const { height } = useTerminalSize()
  
  // Calculate available height
  const headerHeight = 1
  const footerHeight = 1
  const tabBarHeight = tabs.length > 1 ? 1 : 0
  const sidebarHeaderHeight = 2
  const sidebarFooterHeight = 1
  const availableHeight = height - headerHeight - footerHeight - tabBarHeight
  const listHeight = availableHeight - sidebarHeaderHeight - sidebarFooterHeight
  
  // Helper to create a filled line
  const fillLine = (content: React.ReactNode, remaining: number) => (
    <>
      {content}
      <Text backgroundColor={theme.backgroundPanel}>{' '.repeat(Math.max(0, remaining))}</Text>
    </>
  )
  
  return (
    <Box flexDirection="column" width={SIDEBAR_WIDTH}>
      {/* Header */}
      <Box height={1}>
        <Text backgroundColor={theme.backgroundPanel} color={theme.text} bold>
          {' Sessions'}
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {' '}({sessions.length})
        </Text>
        <Text backgroundColor={theme.backgroundPanel}>
          {' '.repeat(Math.max(0, SIDEBAR_WIDTH - 12 - sessions.length.toString().length))}
        </Text>
      </Box>
      
      {/* Separator */}
      <Box height={1}>
        <Text backgroundColor={theme.backgroundPanel} color={theme.border}>
          {'─'.repeat(SIDEBAR_WIDTH)}
        </Text>
      </Box>
      
      {/* Session list */}
      <Box flexDirection="column" height={listHeight}>
        {sessions.length === 0 ? (
          <Box>
            <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
              {' No sessions yet'}
            </Text>
            <Text backgroundColor={theme.backgroundPanel}>
              {' '.repeat(SIDEBAR_WIDTH - 16)}
            </Text>
          </Box>
        ) : (
          sessions.slice(0, listHeight).map((session) => {
            const isSelected = session.id === currentSessionId
            const maxTitleLen = SIDEBAR_WIDTH - 8 // prefix + time
            const truncatedTitle = session.title.length > maxTitleLen
              ? session.title.slice(0, maxTitleLen - 1) + '…'
              : session.title
            const timeStr = formatRelativeTime(session.updatedAt)
            
            const bg = isSelected ? theme.backgroundElement : theme.backgroundPanel
            const titleColor = isSelected ? theme.accent : theme.text
            const prefix = isSelected ? '▸ ' : '  '
            
            const usedWidth = prefix.length + truncatedTitle.length + 1 + timeStr.length
            const padding = Math.max(1, SIDEBAR_WIDTH - usedWidth)
            
            return (
              <Box key={session.id} height={1}>
                <Text backgroundColor={bg} color={isSelected ? theme.accent : theme.textMuted}>
                  {prefix}
                </Text>
                <Text backgroundColor={bg} color={titleColor} bold={isSelected}>
                  {truncatedTitle}
                </Text>
                <Text backgroundColor={bg}>{' '.repeat(padding)}</Text>
                <Text backgroundColor={bg} color={theme.textMuted} dimColor>
                  {timeStr}
                </Text>
              </Box>
            )
          })
        )}
        
        {/* Fill remaining space */}
        {Array.from({ length: Math.max(0, listHeight - Math.min(sessions.length, listHeight)) }).map((_, i) => (
          <Box key={`fill-${i}`} height={1}>
            <Text backgroundColor={theme.backgroundPanel}>{' '.repeat(SIDEBAR_WIDTH)}</Text>
          </Box>
        ))}
        
        {/* Show more indicator */}
        {sessions.length > listHeight && (
          <Box height={1}>
            <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
              {' '}+{sessions.length - listHeight} more
            </Text>
            <Text backgroundColor={theme.backgroundPanel}>
              {' '.repeat(Math.max(0, SIDEBAR_WIDTH - 8 - (sessions.length - listHeight).toString().length))}
            </Text>
          </Box>
        )}
      </Box>
      
      {/* Footer hint */}
      <Box height={1}>
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {' '}
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.accent}>
          n
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {' new  '}
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.accent}>
          s
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {' list'}
        </Text>
        <Text backgroundColor={theme.backgroundPanel}>
          {' '.repeat(Math.max(0, SIDEBAR_WIDTH - 15))}
        </Text>
      </Box>
    </Box>
  )
}

export { SIDEBAR_WIDTH }
