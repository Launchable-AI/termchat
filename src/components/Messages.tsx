import React, { useMemo } from 'react'
import { Box, Text } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

// Spinner frames for streaming animation
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// Custom border characters for left accent
const BORDER_CHARS = {
  vertical: '┃',
  top: '┃',
  bottom: '╹',
}

interface MessageBlockProps {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  model?: string
  isStreaming?: boolean
  width: number
  theme: ReturnType<typeof useStore>['theme']
  spinnerFrame: number
}

function MessageBlock({ role, content, reasoning, model, isStreaming, width, theme, spinnerFrame }: MessageBlockProps) {
  const isUser = role === 'user'
  const accentColor = isUser ? theme.accent : theme.info
  const bgColor = isUser ? theme.backgroundUser : theme.backgroundAssistant
  
  // Word wrap content to fit width
  const wrapText = (text: string, maxWidth: number): string[] => {
    const lines: string[] = []
    const paragraphs = text.split('\n')
    
    for (const paragraph of paragraphs) {
      if (paragraph.length === 0) {
        lines.push('')
        continue
      }
      
      const words = paragraph.split(' ')
      let currentLine = ''
      
      for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxWidth) {
          currentLine += (currentLine ? ' ' : '') + word
        } else {
          if (currentLine) lines.push(currentLine)
          // Handle very long words
          if (word.length > maxWidth) {
            let remaining = word
            while (remaining.length > maxWidth) {
              lines.push(remaining.slice(0, maxWidth))
              remaining = remaining.slice(maxWidth)
            }
            currentLine = remaining
          } else {
            currentLine = word
          }
        }
      }
      if (currentLine) lines.push(currentLine)
    }
    
    return lines
  }
  
  // Content width (accounting for border + padding)
  const contentWidth = width - 4
  const contentLines = wrapText(content || (isStreaming ? '' : ''), contentWidth)
  
  // Reasoning section (for models that support it)
  const reasoningLines = reasoning ? wrapText(reasoning, contentWidth - 2) : []
  
  // Model display name
  const modelName = model?.split('/').pop()?.replace(/:.*$/, '') || ''
  
  return (
    <Box flexDirection="column" width={width}>
      {/* Header with role and model */}
      <Box>
        <Text color={accentColor}>{BORDER_CHARS.vertical}</Text>
        <Text backgroundColor={bgColor} color={theme.text} bold>
          {' '}{isUser ? 'You' : 'Assistant'}
        </Text>
        {modelName && !isUser && (
          <Text backgroundColor={bgColor} color={theme.textMuted}>
            {' '}{modelName}
          </Text>
        )}
        {isStreaming && (
          <Text backgroundColor={bgColor} color={theme.success}>
            {' '}{SPINNER_FRAMES[spinnerFrame]}
          </Text>
        )}
        <Text backgroundColor={bgColor}>{' '.repeat(Math.max(0, contentWidth - (isUser ? 3 : 10 + modelName.length) - (isStreaming ? 2 : 0)))}</Text>
      </Box>
      
      {/* Reasoning (collapsible, dimmed) */}
      {reasoningLines.length > 0 && (
        <>
          <Box>
            <Text color={theme.border}>{BORDER_CHARS.vertical}</Text>
            <Text backgroundColor={bgColor} color={theme.textMuted} dimColor>
              {' '}thinking...
            </Text>
            <Text backgroundColor={bgColor}>{' '.repeat(Math.max(0, contentWidth - 11))}</Text>
          </Box>
          {reasoningLines.slice(0, 3).map((line, i) => (
            <Box key={`r-${i}`}>
              <Text color={theme.border}>{BORDER_CHARS.vertical}</Text>
              <Text backgroundColor={bgColor} color={theme.textMuted} dimColor>
                {'  '}{line}
              </Text>
              <Text backgroundColor={bgColor}>{' '.repeat(Math.max(0, contentWidth - line.length - 2))}</Text>
            </Box>
          ))}
          {reasoningLines.length > 3 && (
            <Box>
              <Text color={theme.border}>{BORDER_CHARS.vertical}</Text>
              <Text backgroundColor={bgColor} color={theme.textMuted} dimColor>
                {'  '}...{reasoningLines.length - 3} more lines
              </Text>
              <Text backgroundColor={bgColor}>{' '.repeat(Math.max(0, contentWidth - 15))}</Text>
            </Box>
          )}
        </>
      )}
      
      {/* Content */}
      {contentLines.map((line, i) => (
        <Box key={i}>
          <Text color={accentColor}>{BORDER_CHARS.vertical}</Text>
          <Text backgroundColor={bgColor} color={theme.text}>
            {' '}{line}
          </Text>
          <Text backgroundColor={bgColor}>{' '.repeat(Math.max(0, contentWidth - line.length))}</Text>
        </Box>
      ))}
      
      {/* Streaming placeholder */}
      {isStreaming && content === '' && (
        <Box>
          <Text color={accentColor}>{BORDER_CHARS.vertical}</Text>
          <Text backgroundColor={bgColor} color={theme.textMuted}>
            {' '}{SPINNER_FRAMES[spinnerFrame]} thinking...
          </Text>
          <Text backgroundColor={bgColor}>{' '.repeat(Math.max(0, contentWidth - 13))}</Text>
        </Box>
      )}
      
      {/* Bottom border accent */}
      <Box>
        <Text color={accentColor}>{BORDER_CHARS.bottom}</Text>
        <Text backgroundColor={bgColor}>{' '.repeat(contentWidth + 2)}</Text>
      </Box>
    </Box>
  )
}

export default function Messages() {
  const { theme, getCurrentSession, isStreaming, error, sidebarVisible, tabs } = useStore()
  const { width, height } = useTerminalSize()
  
  const session = getCurrentSession()
  
  // Spinner animation
  const [spinnerFrame, setSpinnerFrame] = React.useState(0)
  React.useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setSpinnerFrame((f) => (f + 1) % SPINNER_FRAMES.length)
      }, 80)
      return () => clearInterval(interval)
    }
  }, [isStreaming])
  
  // Calculate dimensions
  const sidebarWidth = sidebarVisible ? 28 : 0
  const contentWidth = width - sidebarWidth - (sidebarVisible ? 1 : 0)
  const headerHeight = 1
  const footerHeight = 1
  const tabBarHeight = tabs.length > 1 ? 1 : 0
  const inputHeight = 3
  const availableHeight = height - headerHeight - footerHeight - tabBarHeight - inputHeight
  
  // Build the message view
  const renderMessages = useMemo(() => {
    if (error) {
      return (
        <Box flexDirection="column" alignItems="center" justifyContent="center" height={availableHeight}>
          <Box flexDirection="column" paddingX={2} width={Math.min(60, contentWidth - 4)}>
            <Box marginBottom={1}>
              <Text color={theme.error} bold>Error</Text>
            </Box>
            <Box marginBottom={1}>
              <Text color={theme.text}>{error}</Text>
            </Box>
            <Box>
              <Text color={theme.textMuted}>Press </Text>
              <Text color={theme.accent}>c</Text>
              <Text color={theme.textMuted}> to clear</Text>
            </Box>
          </Box>
        </Box>
      )
    }
    
    if (!session || session.messages.length === 0) {
      return (
        <Box flexDirection="column" alignItems="center" justifyContent="center" height={availableHeight}>
          <Box flexDirection="column" alignItems="center">
            <Box marginBottom={1}>
              <Text color={theme.textMuted}>
                {session ? 'Start a conversation' : 'No session selected'}
              </Text>
            </Box>
            <Box>
              <Text color={theme.textMuted}>Press </Text>
              <Text color={theme.accent}>i</Text>
              <Text color={theme.textMuted}> to start typing, </Text>
              <Text color={theme.accent}>?</Text>
              <Text color={theme.textMuted}> for help</Text>
            </Box>
          </Box>
        </Box>
      )
    }
    
    // Render messages with proper spacing
    const elements: React.ReactNode[] = []
    
    session.messages.forEach((message, index) => {
      const isLast = index === session.messages.length - 1
      const isAssistantStreaming = isStreaming && message.role === 'assistant' && isLast
      
      // Add spacing between messages
      if (index > 0) {
        elements.push(
          <Box key={`spacer-${index}`} height={1}>
            <Text> </Text>
          </Box>
        )
      }
      
      elements.push(
        <MessageBlock
          key={message.id}
          role={message.role as 'user' | 'assistant'}
          content={message.content}
          reasoning={message.reasoning}
          model={message.model}
          isStreaming={isAssistantStreaming}
          width={contentWidth}
          theme={theme}
          spinnerFrame={spinnerFrame}
        />
      )
    })
    
    return elements
  }, [session, isStreaming, error, contentWidth, availableHeight, theme, spinnerFrame])
  
  // Fill background
  const bgFill = (
    <Box flexDirection="column" width={contentWidth}>
      {Array.from({ length: availableHeight }).map((_, i) => (
        <Box key={i}>
          <Text backgroundColor={theme.background}>{' '.repeat(contentWidth)}</Text>
        </Box>
      ))}
    </Box>
  )
  
  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      width={contentWidth}
      height={availableHeight}
      overflowY="hidden"
    >
      {/* Background fill layer */}
      <Box position="absolute" width={contentWidth} height={availableHeight}>
        {bgFill}
      </Box>
      
      {/* Content layer */}
      <Box flexDirection="column" paddingX={1} paddingY={1}>
        {renderMessages}
      </Box>
    </Box>
  )
}
