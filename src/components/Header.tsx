import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

// ASCII logo - minimal and clean
const LOGO = 'termchat'

export default function Header() {
  const { theme, currentModel, isConnected, mode, isStreaming } = useStore()
  const { width } = useTerminalSize()
  
  // Format model name for display (short form)
  const modelDisplay = currentModel.split('/').pop()?.replace(/:.*$/, '') || currentModel
  
  // Connection indicator
  const connectionStatus = isConnected ? (
    <Text color={theme.success}>●</Text>
  ) : (
    <Text color={theme.error}>○</Text>
  )
  
  // Mode indicator with color coding
  const modeColor = mode === 'insert' ? theme.success : theme.textMuted
  const modeText = mode === 'insert' ? 'INSERT' : 'NORMAL'
  
  // Fill the header line with background
  const fillChar = ' '
  
  return (
    <Box
      height={1}
      width={width}
    >
      {/* Left side: Logo and model */}
      <Box>
        <Text backgroundColor={theme.backgroundPanel} color={theme.background}>
          {' '}
        </Text>
        <Text backgroundColor={theme.accent} color={theme.background} bold>
          {' '}{LOGO}{' '}
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {' '}
        </Text>
        {connectionStatus}
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {' '}
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.text}>
          {modelDisplay}
        </Text>
        {isStreaming && (
          <>
            <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
              {' '}
            </Text>
            <Text backgroundColor={theme.backgroundPanel} color={theme.warning}>
              streaming...
            </Text>
          </>
        )}
      </Box>
      
      {/* Spacer */}
      <Box flexGrow={1}>
        <Text backgroundColor={theme.backgroundPanel}>{fillChar}</Text>
      </Box>
      
      {/* Right side: Mode and hints */}
      <Box>
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {mode === 'normal' ? 'ctrl+p ' : ''}
        </Text>
        <Text backgroundColor={modeColor} color={theme.background} bold>
          {' '}{modeText}{' '}
        </Text>
      </Box>
    </Box>
  )
}
