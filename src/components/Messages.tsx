import React, { useMemo, useEffect, useRef, useCallback } from 'react'
import { Box, Text, useInput } from 'ink'
import { useStore, shallow } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

// Spinner frames for streaming animation
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// Language display names
const LANG_NAMES: Record<string, string> = {
  js: 'JavaScript', javascript: 'JavaScript',
  ts: 'TypeScript', typescript: 'TypeScript',
  tsx: 'TSX', jsx: 'JSX',
  py: 'Python', python: 'Python',
  rb: 'Ruby', ruby: 'Ruby',
  go: 'Go', golang: 'Go',
  rs: 'Rust', rust: 'Rust',
  java: 'Java',
  cpp: 'C++', 'c++': 'C++',
  c: 'C',
  cs: 'C#', csharp: 'C#',
  sh: 'Shell', bash: 'Bash', zsh: 'Zsh', shell: 'Shell',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML', yml: 'YAML',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS', scss: 'SCSS', sass: 'SASS',
  md: 'Markdown', markdown: 'Markdown',
  dockerfile: 'Dockerfile',
  makefile: 'Makefile',
  toml: 'TOML',
  ini: 'INI',
  diff: 'Diff',
}

interface CodeBlock {
  id: string
  messageId: string
  language: string
  code: string
}

interface ParsedSegment {
  type: 'text' | 'code'
  content: string
  language?: string
  blockIndex?: number
}

// Parse markdown content to extract code blocks
function parseContent(content: string, messageId: string): { segments: ParsedSegment[], codeBlocks: CodeBlock[] } {
  const segments: ParsedSegment[] = []
  const codeBlocks: CodeBlock[] = []
  
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match
  let blockIndex = 0
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index)
      if (text.trim()) {
        segments.push({ type: 'text', content: text })
      }
    }
    
    const language = match[1] || ''
    const code = match[2].replace(/\n$/, '')
    
    segments.push({
      type: 'code',
      content: code,
      language,
      blockIndex,
    })
    
    codeBlocks.push({
      id: `${messageId}-${blockIndex}`,
      messageId,
      language,
      code,
    })
    
    blockIndex++
    lastIndex = match.index + match[0].length
  }
  
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex)
    if (text.trim()) {
      segments.push({ type: 'text', content: text })
    }
  }
  
  if (segments.length === 0 && content.trim()) {
    segments.push({ type: 'text', content })
  }
  
  return { segments, codeBlocks }
}

// Word wrap text
function wrapText(text: string, maxWidth: number): string[] {
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

// Spinner component that updates independently
function Spinner({ color }: { color: string }) {
  const [frame, setFrame] = React.useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % SPINNER_FRAMES.length)
    }, 80)
    return () => clearInterval(interval)
  }, [])
  
  return <Text color={color}> {SPINNER_FRAMES[frame]}</Text>
}

export default function Messages() {
  const { width, height } = useTerminalSize()
  
  // Get stable primitive values from store - avoid object selectors
  const theme = useStore(s => s.theme)
  const currentSessionId = useStore(s => s.currentSessionId)
  const isStreaming = useStore(s => s.isStreaming)
  const error = useStore(s => s.error)
  const sidebarVisible = useStore(s => s.sidebarVisible)
  const tabsLength = useStore(s => s.tabs.length)
  const mode = useStore(s => s.mode)
  const scrollOffset = useStore(s => s.scrollOffset)
  const selectedCodeBlockIndex = useStore(s => s.selectedCodeBlockIndex)
  const notification = useStore(s => s.notification)
  
  // Get session messages with shallow comparison to prevent unnecessary re-renders
  // Only re-render when message content actually changes
  const sessionData = useStore(
    s => {
      if (!s.currentSessionId) return null
      const session = s.sessions.find(sess => sess.id === s.currentSessionId)
      if (!session) return null
      return {
        id: session.id,
        messages: session.messages,
      }
    },
    (a, b) => {
      if (a === b) return true
      if (!a || !b) return false
      if (a.id !== b.id) return false
      if (a.messages.length !== b.messages.length) return false
      // Compare last message content (most likely to change during streaming)
      const lastA = a.messages[a.messages.length - 1]
      const lastB = b.messages[b.messages.length - 1]
      if (!lastA && !lastB) return true
      if (!lastA || !lastB) return false
      return lastA.id === lastB.id && lastA.content === lastB.content
    }
  )
  
  // Calculate dimensions
  const sidebarWidth = sidebarVisible ? 28 : 0
  const contentWidth = width - sidebarWidth - (sidebarVisible ? 1 : 0)
  const headerHeight = 1
  const footerHeight = 1
  const tabBarHeight = tabsLength > 1 ? 1 : 0
  const inputHeight = 3
  const availableHeight = height - headerHeight - footerHeight - tabBarHeight - inputHeight
  
  // Build rendered lines - exclude spinner from dependencies
  const { allLines, allCodeBlocks, streamingMessageId } = useMemo(() => {
    const lines: { key: string; element: React.ReactNode }[] = []
    const blocks: CodeBlock[] = []
    let globalBlockIndex = 0
    let streamingMsgId: string | null = null
    
    // Error state
    if (error) {
      lines.push({ key: 'err-1', element: <Text color={theme.error} bold>  Error</Text> })
      lines.push({ key: 'err-2', element: <Text> </Text> })
      wrapText(error, contentWidth - 4).forEach((line, i) => {
        lines.push({ key: `err-${i + 3}`, element: <Text color={theme.text}>  {line}</Text> })
      })
      lines.push({ key: 'err-end-1', element: <Text> </Text> })
      lines.push({
        key: 'err-end-2',
        element: <Text color={theme.textMuted}>  Press <Text color={theme.accent}>c</Text> to clear</Text>
      })
      return { allLines: lines, allCodeBlocks: blocks, streamingMessageId: null }
    }
    
    // Empty state
    if (!sessionData || sessionData.messages.length === 0) {
      const msg1 = sessionData ? 'Start a conversation' : 'No session selected'
      for (let i = 0; i < Math.floor(availableHeight / 2) - 2; i++) {
        lines.push({ key: `empty-${i}`, element: <Text> </Text> })
      }
      lines.push({ key: 'empty-msg1', element: <Text color={theme.textMuted}>  {msg1}</Text> })
      lines.push({ key: 'empty-gap', element: <Text> </Text> })
      lines.push({
        key: 'empty-msg2',
        element: (
          <Text color={theme.textMuted}>
            {'  '}Press <Text color={theme.accent}>i</Text> to type, <Text color={theme.accent}>?</Text> for help
          </Text>
        )
      })
      return { allLines: lines, allCodeBlocks: blocks, streamingMessageId: null }
    }
    
    // Render messages
    sessionData.messages.forEach((message, msgIndex) => {
      const isUser = message.role === 'user'
      const isLast = msgIndex === sessionData.messages.length - 1
      const isAssistantStreaming = isStreaming && message.role === 'assistant' && isLast
      const accentColor = isUser ? theme.accent : theme.info
      const roleLabel = isUser ? 'You' : 'Assistant'
      const modelName = message.model?.split('/').pop()?.replace(/:.*$/, '') || ''
      
      if (isAssistantStreaming) {
        streamingMsgId = message.id
      }
      
      // Separator before AI responses
      if (msgIndex > 0) {
        lines.push({ key: `sep1-${msgIndex}`, element: <Text> </Text> })
        if (!isUser) {
          lines.push({
            key: `sep2-${msgIndex}`,
            element: <Text color={theme.border}>  {'─'.repeat(Math.min(50, contentWidth - 6))}</Text>
          })
          lines.push({ key: `sep3-${msgIndex}`, element: <Text> </Text> })
        }
      }
      
      // Message header - spinner rendered separately if streaming
      lines.push({
        key: `hdr-${message.id}`,
        element: (
          <Box>
            <Text color={accentColor} bold>┃ </Text>
            <Text color={theme.text} bold>{roleLabel}</Text>
            {modelName && !isUser && <Text color={theme.textMuted}> · {modelName}</Text>}
            {isAssistantStreaming && <Spinner color={theme.success} />}
          </Box>
        )
      })
      
      // Parse content
      const content = message.content || ''
      const { segments, codeBlocks: msgBlocks } = parseContent(content, message.id)
      
      // Add code blocks to global list
      msgBlocks.forEach(block => {
        blocks.push({ ...block, id: `block-${globalBlockIndex}` })
        globalBlockIndex++
      })
      
      // Empty streaming placeholder
      if (segments.length === 0 && isAssistantStreaming) {
        lines.push({
          key: `stream-${message.id}`,
          element: (
            <Box>
              <Text color={accentColor}>┃ </Text>
              <Text color={theme.textMuted}>thinking...</Text>
            </Box>
          )
        })
      }
      
      // Render segments
      segments.forEach((segment, segIndex) => {
        if (segment.type === 'text') {
          const textLines = wrapText(segment.content.trim(), contentWidth - 6)
          textLines.forEach((line, lineIndex) => {
            lines.push({
              key: `txt-${message.id}-${segIndex}-${lineIndex}`,
              element: (
                <Box>
                  <Text color={accentColor}>┃ </Text>
                  <Text color={theme.text}>{line}</Text>
                </Box>
              )
            })
          })
        } else if (segment.type === 'code') {
          const blockGlobalIndex = blocks.findIndex(
            b => b.messageId === message.id && b.code === segment.content
          )
          const isSelected = blockGlobalIndex === selectedCodeBlockIndex
          const lang = segment.language || 'code'
          const langDisplay = LANG_NAMES[lang.toLowerCase()] || lang || 'code'
          
          // Blank line before code
          lines.push({
            key: `code-pre-${message.id}-${segIndex}`,
            element: <Text color={accentColor}>┃</Text>
          })
          
          // Code block header
          const headerBg = isSelected ? theme.accent : theme.backgroundElement
          const headerFg = isSelected ? theme.background : theme.textMuted
          lines.push({
            key: `code-hdr-${message.id}-${segIndex}`,
            element: (
              <Box>
                <Text color={accentColor}>┃ </Text>
                <Text backgroundColor={headerBg} color={headerFg} bold>
                  {' '}{langDisplay}{' '}
                </Text>
                {isSelected && (
                  <Text color={theme.accent}> ← selected (y to copy)</Text>
                )}
              </Box>
            )
          })
          
          // Code lines
          const codeLines = segment.content.split('\n')
          const maxLineNum = codeLines.length.toString().length
          const codeBg = isSelected ? theme.backgroundElement : theme.backgroundPanel
          
          codeLines.forEach((codeLine, lineNum) => {
            const lineNumStr = (lineNum + 1).toString().padStart(maxLineNum, ' ')
            const maxCodeWidth = contentWidth - maxLineNum - 10
            const displayLine = codeLine.length > maxCodeWidth
              ? codeLine.slice(0, maxCodeWidth - 1) + '…'
              : codeLine
            const padding = Math.max(0, maxCodeWidth - displayLine.length)
            
            lines.push({
              key: `code-ln-${message.id}-${segIndex}-${lineNum}`,
              element: (
                <Box>
                  <Text color={accentColor}>┃ </Text>
                  <Text backgroundColor={codeBg} color={theme.textMuted}> {lineNumStr} </Text>
                  <Text backgroundColor={codeBg} color={theme.border}>│</Text>
                  <Text backgroundColor={codeBg} color={theme.text}> {displayLine}</Text>
                  <Text backgroundColor={codeBg}>{' '.repeat(padding + 1)}</Text>
                </Box>
              )
            })
          })
          
          // Blank line after code
          lines.push({
            key: `code-post-${message.id}-${segIndex}`,
            element: <Text color={accentColor}>┃</Text>
          })
        }
      })
      
      // Message footer
      lines.push({
        key: `ftr-${message.id}`,
        element: <Text color={accentColor}>╹</Text>
      })
    })
    
    return { allLines: lines, allCodeBlocks: blocks, streamingMessageId: streamingMsgId }
  }, [sessionData, isStreaming, error, contentWidth, availableHeight, theme, selectedCodeBlockIndex])
  
  // Update code blocks in store - use ref to avoid dependency issues
  const prevBlocksRef = useRef<string>('')
  useEffect(() => {
    const blocksJson = JSON.stringify(allCodeBlocks.map(b => b.id))
    if (blocksJson !== prevBlocksRef.current) {
      prevBlocksRef.current = blocksJson
      useStore.getState().setCodeBlocks(allCodeBlocks)
    }
  }, [allCodeBlocks])
  
  // Calculate scroll bounds
  const totalLines = allLines.length
  const maxScroll = Math.max(0, totalLines - availableHeight)
  const effectiveScroll = Math.min(scrollOffset, maxScroll)
  
  // Auto-scroll to bottom when streaming
  const prevStreamingRef = useRef(isStreaming)
  useEffect(() => {
    if (isStreaming && !prevStreamingRef.current) {
      useStore.getState().setScrollOffset(0)
    }
    prevStreamingRef.current = isStreaming
  }, [isStreaming])
  
  // Scroll mode keyboard handling
  useInput((input, key) => {
    if (mode !== 'scroll') return
    
    const store = useStore.getState()
    
    if (key.escape || input === 'q') {
      store.setMode('normal')
      return
    }
    
    if (key.upArrow || input === 'k') {
      store.scrollUp(1)
      return
    }
    if (key.downArrow || input === 'j') {
      store.scrollDown(1)
      return
    }
    if (key.pageUp || (key.ctrl && input === 'u')) {
      store.scrollUp(Math.floor(availableHeight / 2))
      return
    }
    if (key.pageDown || (key.ctrl && input === 'd')) {
      store.scrollDown(Math.floor(availableHeight / 2))
      return
    }
    if (input === 'g') {
      store.setScrollOffset(maxScroll)
      return
    }
    if (input === 'G') {
      store.setScrollOffset(0)
      return
    }
    
    if (key.tab || input === 'n') {
      store.selectNextCodeBlock()
      return
    }
    if (input === 'N' || input === 'p') {
      store.selectPrevCodeBlock()
      return
    }
    
    if (input === 'y' || input === 'c') {
      store.copySelectedCodeBlock()
      return
    }
  }, { isActive: mode === 'scroll' })
  
  // Visible lines
  const visibleLines = useMemo(() => {
    if (totalLines <= availableHeight) {
      return allLines
    }
    
    const endIndex = totalLines - effectiveScroll
    const startIndex = Math.max(0, endIndex - availableHeight)
    
    return allLines.slice(startIndex, endIndex)
  }, [allLines, totalLines, availableHeight, effectiveScroll])
  
  const canScrollUp = effectiveScroll < maxScroll
  const canScrollDown = effectiveScroll > 0
  
  return (
    <Box flexDirection="column" width={contentWidth} height={availableHeight}>
      {/* Messages */}
      <Box flexDirection="column" paddingLeft={1}>
        {visibleLines.map((line) => (
          <Box key={line.key} height={1}>
            {line.element}
          </Box>
        ))}
        
        {/* Fill remaining space */}
        {visibleLines.length < availableHeight &&
          Array.from({ length: availableHeight - visibleLines.length }).map((_, i) => (
            <Box key={`fill-${i}`} height={1}>
              <Text> </Text>
            </Box>
          ))
        }
      </Box>
      
      {/* Scroll indicators */}
      {mode === 'scroll' && canScrollUp && (
        <Box position="absolute" marginLeft={contentWidth - 14}>
          <Text color={theme.textMuted}>↑ more ({maxScroll - effectiveScroll})</Text>
        </Box>
      )}
      {mode === 'scroll' && canScrollDown && (
        <Box position="absolute" marginTop={availableHeight - 1} marginLeft={contentWidth - 14}>
          <Text color={theme.textMuted}>↓ more ({effectiveScroll})</Text>
        </Box>
      )}
      
      {/* Notification toast */}
      {notification && (
        <Box
          position="absolute"
          marginTop={1}
          marginLeft={Math.max(2, Math.floor((contentWidth - notification.length - 4) / 2))}
        >
          <Text backgroundColor={theme.success} color={theme.background} bold>
            {' '}{notification}{' '}
          </Text>
        </Box>
      )}
      
      {/* Scroll mode bar */}
      {mode === 'scroll' && (
        <Box position="absolute" marginTop={availableHeight - 1} marginLeft={1}>
          <Text backgroundColor={theme.info} color={theme.background} bold>
            {' SCROLL '}
          </Text>
          <Text color={theme.textMuted}>
            {' '}j/k scroll  g/G top/bottom  n/p code  y copy  q exit
          </Text>
        </Box>
      )}
    </Box>
  )
}
