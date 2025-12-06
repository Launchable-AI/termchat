import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'

export default function Header() {
  const { theme, themeName, currentModel, isConnected, mode } = useStore()
  
  // Format model name for display
  const modelDisplay = currentModel.split('/').pop()?.replace(/:.*$/, '') || currentModel
  
  return (
    <Box
      paddingX={2}
      paddingY={0}
      justifyContent="space-between"
    >
      <Box>
        <Text color={theme.accent} bold>
          TermChat
        </Text>
        <Text color={theme.textMuted}>  </Text>
        <Text color={theme.primary}>{modelDisplay}</Text>
        {!isConnected && (
          <>
            <Text color={theme.textMuted}>  </Text>
            <Text color={theme.warning}>disconnected</Text>
          </>
        )}
      </Box>
      
      <Box>
        <Text color={mode === 'insert' ? theme.success : theme.textMuted} bold>
          {mode.toUpperCase()}
        </Text>
        <Text color={theme.textMuted}>  </Text>
        <Text color={theme.textMuted}>{themeName}</Text>
        <Text color={theme.textMuted}>  </Text>
        <Text color={theme.accent}>:</Text>
        <Text color={theme.textMuted}> commands</Text>
      </Box>
    </Box>
  )
}
