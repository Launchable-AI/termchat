import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

// ASCII logo - minimal and clean
const LOGO = 'termchat'

export default function Header() {
  // Use selective subscriptions
  const theme = useStore(s => s.theme)
  const currentModel = useStore(s => s.currentModel)
  const isConnected = useStore(s => s.isConnected)
  const mode = useStore(s => s.mode)
  const isStreaming = useStore(s => s.isStreaming)
  
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
  const getModeDisplay = () => {
    switch (mode) {
      case 'insert':
        return { color: theme.success, text: 'INSERT' }
      case 'scroll':
        return { color: theme.info, text: 'SCROLL' }
      default:
        return { color: theme.textMuted, text: 'NORMAL' }
    }
  }
  const modeDisplay = getModeDisplay()
  
  return (
    <Box height={1} width={width}>
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
        <Text backgroundColor={theme.backgroundPanel}> </Text>
      </Box>
      
      {/* Right side: Mode and hints */}
      <Box>
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {mode === 'normal' ? 'ctrl+p ' : mode === 'scroll' ? 'q exit ' : ''}
        </Text>
        <Text backgroundColor={modeDisplay.color} color={theme.background} bold>
          {' '}{modeDisplay.text}{' '}
        </Text>
      </Box>
    </Box>
  )
}
