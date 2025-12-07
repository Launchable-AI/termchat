import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import { isFreeTierModel, isReasoningModel } from '../api/openrouter.js'

export default function Footer() {
  const { theme, mode, currentModel, getCurrentSession, themeName } = useStore()
  const { width } = useTerminalSize()
  
  const session = getCurrentSession()
  const isFree = isFreeTierModel(currentModel)
  const isReasoning = isReasoningModel(currentModel)
  
  // Calculate stats
  const messageCount = session?.messages.length || 0
  const totalChars = session?.messages.reduce((acc, m) => acc + m.content.length, 0) || 0
  const estimatedTokens = Math.round(totalChars / 4)
  
  // Contextual keybindings based on mode
  const keybindings = mode === 'insert' ? [
    { key: 'esc', desc: 'normal' },
    { key: 'enter', desc: 'send' },
  ] : [
    { key: 'i', desc: 'insert' },
    { key: 'm', desc: 'models' },
    { key: 's', desc: 'sessions' },
    { key: '?', desc: 'help' },
    { key: 'q', desc: 'quit' },
  ]
  
  return (
    <Box height={1} width={width}>
      {/* Left side: Model badges and stats */}
      <Box>
        <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
          {' '}
        </Text>
        {isFree && (
          <>
            <Text backgroundColor={theme.success} color={theme.background} bold>
              {' FREE '}
            </Text>
            <Text backgroundColor={theme.backgroundPanel}> </Text>
          </>
        )}
        {isReasoning && (
          <>
            <Text backgroundColor={theme.info} color={theme.background} bold>
              {' COT '}
            </Text>
            <Text backgroundColor={theme.backgroundPanel}> </Text>
          </>
        )}
        {messageCount > 0 && (
          <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
            {messageCount} msgs  ~{estimatedTokens.toLocaleString()} tokens
          </Text>
        )}
      </Box>
      
      {/* Spacer */}
      <Box flexGrow={1}>
        <Text backgroundColor={theme.backgroundPanel}> </Text>
      </Box>
      
      {/* Right side: Theme and keybindings */}
      <Box>
        <Text backgroundColor={theme.backgroundPanel} color={theme.border}>
          {themeName}
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.border}>
          {' '}
        </Text>
        <Text backgroundColor={theme.backgroundPanel} color={theme.border}>
          │
        </Text>
        {keybindings.map((kb, i) => (
          <React.Fragment key={kb.key}>
            <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
              {' '}
            </Text>
            <Text backgroundColor={theme.backgroundPanel} color={theme.accent}>
              {kb.key}
            </Text>
            <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
              {' '}{kb.desc}
            </Text>
          </React.Fragment>
        ))}
        <Text backgroundColor={theme.backgroundPanel}> </Text>
      </Box>
    </Box>
  )
}
