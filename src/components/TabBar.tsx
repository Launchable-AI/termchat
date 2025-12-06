import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'

export default function TabBar() {
  const { theme, tabs, activeTabIndex } = useStore()
  
  if (tabs.length === 0) {
    return null
  }
  
  return (
    <Box
      paddingX={2}
      gap={2}
    >
      {tabs.map((tab, index) => {
        const isActive = index === activeTabIndex
        return (
          <Box key={tab.sessionId}>
            <Text
              color={isActive ? theme.accent : theme.textMuted}
              backgroundColor={isActive ? theme.backgroundElement : undefined}
              bold={isActive}
            >
              {' '}{index + 1} {tab.title.slice(0, 14)}{tab.title.length > 14 ? '…' : ''}{' '}
            </Text>
          </Box>
        )
      })}
      
      <Box flexGrow={1} />
      
      <Text color={theme.textMuted}>
        1-9 switch  [/] nav  ctrl+w close
      </Text>
    </Box>
  )
}
