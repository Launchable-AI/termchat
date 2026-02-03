import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import { isFreeTierModel, isReasoningModel } from '../api/openrouter.js'

export default function Footer() {
  // Use selective subscriptions
  const theme = useStore(s => s.theme)
  const mode = useStore(s => s.mode)
  const currentModel = useStore(s => s.currentModel)
  const themeName = useStore(s => s.themeName)
  const codeBlocksLength = useStore(s => s.codeBlocks.length)
  const selectedCodeBlockIndex = useStore(s => s.selectedCodeBlockIndex)
  
  // Get session stats with stable reference (only primitive values)
  const sessionStats = useStore(
    s => {
      const session = s.sessions.find(sess => sess.id === s.currentSessionId)
      if (!session) return { messageCount: 0, totalChars: 0 }
      const totalChars = session.messages.reduce((acc, m) => acc + m.content.length, 0)
      return { messageCount: session.messages.length, totalChars }
    },
    (a, b) => a.messageCount === b.messageCount && a.totalChars === b.totalChars
  )
  
  const { width } = useTerminalSize()
  
  const isFree = isFreeTierModel(currentModel)
  const isReasoning = isReasoningModel(currentModel)
  
  // Calculate stats
  const messageCount = sessionStats.messageCount
  const estimatedTokens = Math.round(sessionStats.totalChars / 4)
  
  // Contextual keybindings based on mode
  const keybindings = mode === 'insert' ? [
    { key: 'esc', desc: 'normal' },
    { key: 'enter', desc: 'send' },
  ] : mode === 'scroll' ? [
    { key: 'j/k', desc: 'scroll' },
    { key: 'n/p', desc: 'code' },
    { key: 'y', desc: 'copy' },
    { key: 'q', desc: 'exit' },
  ] : [
    { key: 'i', desc: 'insert' },
    { key: 'v', desc: 'scroll' },
    { key: 'm', desc: 'models' },
    { key: '?', desc: 'help' },
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
        {mode === 'scroll' && codeBlocksLength > 0 && (
          <Text backgroundColor={theme.backgroundPanel} color={theme.textMuted}>
            {'  '}code: {selectedCodeBlockIndex >= 0 ? selectedCodeBlockIndex + 1 : '-'}/{codeBlocksLength}
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
          {' '}│
        </Text>
        {keybindings.map((kb) => (
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
