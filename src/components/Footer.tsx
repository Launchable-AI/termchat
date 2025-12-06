import React from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { isFreeTierModel, isReasoningModel } from '../api/openrouter.js'

export default function Footer() {
  const { theme, mode, currentModel, isStreaming, getCurrentSession } = useStore()
  
  const session = getCurrentSession()
  const isFree = isFreeTierModel(currentModel)
  const isReasoning = isReasoningModel(currentModel)
  
  // Calculate rough token count (4 chars per token approximation)
  const messageCount = session?.messages.length || 0
  const totalChars = session?.messages.reduce((acc, m) => acc + m.content.length, 0) || 0
  const estimatedTokens = Math.round(totalChars / 4)
  
  // Contextual help based on mode
  const helpText = mode === 'insert'
    ? 'esc normal  enter send'
    : 'i insert  m models  s sessions  ? help  q quit'
  
  return (
    <Box
      paddingX={2}
      paddingY={0}
      justifyContent="space-between"
    >
      <Box>
        {isFree && (
          <>
            <Text color={theme.success}>free</Text>
            <Text color={theme.textMuted}>  </Text>
          </>
        )}
        {isReasoning && (
          <>
            <Text color={theme.info}>reasoning</Text>
            <Text color={theme.textMuted}>  </Text>
          </>
        )}
        {messageCount > 0 && (
          <Text color={theme.textMuted}>
            {messageCount} msgs  ~{estimatedTokens.toLocaleString()} tokens
          </Text>
        )}
        {isStreaming && (
          <>
            <Text color={theme.textMuted}>  </Text>
            <Text color={theme.warning}>streaming...</Text>
          </>
        )}
      </Box>
      
      <Box>
        <Text color={theme.textMuted}>
          {helpText}
        </Text>
      </Box>
    </Box>
  )
}
