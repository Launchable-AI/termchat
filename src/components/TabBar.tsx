import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

export default function TabBar() {
  const { theme, tabs, activeTabIndex, sidebarVisible } = useStore()
  const { width } = useTerminalSize()
  
  if (tabs.length <= 1) {
    return null
  }
  
  // Calculate available width for tabs
  const sidebarWidth = sidebarVisible ? 28 : 0
  const availableWidth = width - sidebarWidth
  const hintsWidth = 25 // "1-9 switch  [/] nav  ^w close"
  const tabsWidth = availableWidth - hintsWidth - 2
  
  // Calculate max title length per tab
  const maxTitleLen = Math.max(8, Math.floor(tabsWidth / tabs.length) - 4)
  
  return (
    <Box height={1}>
      {/* Sidebar spacer if visible */}
      {sidebarVisible && (
        <Box width={sidebarWidth}>
          <Text backgroundColor={theme.backgroundPanel}>{' '.repeat(sidebarWidth)}</Text>
        </Box>
      )}
      
      {/* Separator */}
      {sidebarVisible && (
        <Box width={1}>
          <Text backgroundColor={theme.background} color={theme.border}>│</Text>
        </Box>
      )}
      
      {/* Tabs */}
      <Box>
        {tabs.map((tab, index) => {
          const isActive = index === activeTabIndex
          const title = tab.title.length > maxTitleLen
            ? tab.title.slice(0, maxTitleLen - 1) + '…'
            : tab.title
          
          return (
            <React.Fragment key={tab.sessionId}>
              {index > 0 && (
                <Text backgroundColor={theme.background} color={theme.border}> </Text>
              )}
              <Text
                backgroundColor={isActive ? theme.backgroundElement : theme.background}
                color={isActive ? theme.accent : theme.textMuted}
                bold={isActive}
              >
                {' '}{index + 1}
              </Text>
              <Text
                backgroundColor={isActive ? theme.backgroundElement : theme.background}
                color={isActive ? theme.text : theme.textMuted}
              >
                {' '}{title}{' '}
              </Text>
            </React.Fragment>
          )
        })}
      </Box>
      
      {/* Spacer */}
      <Box flexGrow={1}>
        <Text backgroundColor={theme.background}> </Text>
      </Box>
      
      {/* Navigation hints */}
      <Box>
        <Text backgroundColor={theme.background} color={theme.textMuted}>
          {'1-9 '}
        </Text>
        <Text backgroundColor={theme.background} color={theme.border}>
          switch
        </Text>
        <Text backgroundColor={theme.background} color={theme.textMuted}>
          {'  [/] '}
        </Text>
        <Text backgroundColor={theme.background} color={theme.border}>
          nav
        </Text>
        <Text backgroundColor={theme.background} color={theme.textMuted}>
          {'  ^w '}
        </Text>
        <Text backgroundColor={theme.background} color={theme.border}>
          close
        </Text>
        <Text backgroundColor={theme.background}> </Text>
      </Box>
    </Box>
  )
}
