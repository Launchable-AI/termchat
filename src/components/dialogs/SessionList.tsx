import React, { useState, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import fuzzysort from 'fuzzysort'
import { useStore } from '../../hooks/useStore.js'

interface Props {
  width: number
  height: number
}

export default function SessionList({ width, height }: Props) {
  const {
    theme,
    sessions,
    currentSessionId,
    selectSession,
    deleteSession,
    createSession,
    setDialog,
  } = useStore()
  
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  
  // Filter sessions
  const displaySessions = useMemo(() => {
    if (!query.trim()) {
      return sessions
    }
    
    const results = fuzzysort.go(query, sessions, {
      keys: ['title'],
      limit: 50,
    })
    
    return results.map((r) => r.obj)
  }, [query, sessions])
  
  const clampedIndex = Math.min(selectedIndex, displaySessions.length - 1)
  const maxVisible = height - 6
  const scrollOffset = Math.max(0, clampedIndex - maxVisible + 3)
  
  useInput((input, key) => {
    // Handle delete confirmation
    if (confirmDelete) {
      if (input === 'y' || input === 'Y') {
        deleteSession(confirmDelete)
        setConfirmDelete(null)
        setSelectedIndex(Math.max(0, clampedIndex - 1))
        return
      }
      if (input === 'n' || input === 'N' || key.escape) {
        setConfirmDelete(null)
        return
      }
      return
    }
    
    // Navigation
    if (key.downArrow || (key.ctrl && input === 'n') || input === 'j') {
      setSelectedIndex((i) => Math.min(i + 1, displaySessions.length - 1))
      return
    }
    if (key.upArrow || (key.ctrl && input === 'p') || input === 'k') {
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return
    }
    
    // Select session
    if (key.return) {
      const session = displaySessions[clampedIndex]
      if (session) {
        selectSession(session.id)
        setDialog('none')
      }
      return
    }
    
    // Delete session
    if (key.ctrl && input === 'd') {
      const session = displaySessions[clampedIndex]
      if (session) {
        setConfirmDelete(session.id)
      }
      return
    }
    
    // New session
    if (key.ctrl && input === 'n') {
      createSession()
      setDialog('none')
      return
    }
  })
  
  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }
  
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.primary} bold>
          Sessions
        </Text>
        <Text color={theme.textMuted}> · </Text>
        <Text color={theme.textMuted}>
          {sessions.length} total
        </Text>
      </Box>
      
      {/* Search */}
      <Box marginBottom={1}>
        <Text color={theme.textMuted}>› </Text>
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder="Search sessions..."
          focus={!confirmDelete}
        />
      </Box>
      
      {/* Confirmation dialog */}
      {confirmDelete && (
        <Box marginBottom={1} paddingX={1} borderStyle="single" borderColor={theme.warning}>
          <Text color={theme.warning}>Delete this session? </Text>
          <Text color={theme.text}>(y/n)</Text>
        </Box>
      )}
      
      {/* Session list */}
      <Box flexDirection="column" height={maxVisible}>
        {displaySessions.slice(scrollOffset, scrollOffset + maxVisible).map((session, i) => {
          const actualIndex = i + scrollOffset
          const isSelected = actualIndex === clampedIndex
          const isCurrent = session.id === currentSessionId
          
          const maxTitleLen = width - 25
          const displayTitle = session.title.length > maxTitleLen
            ? session.title.slice(0, maxTitleLen - 3) + '...'
            : session.title
          
          return (
            <Box key={session.id} justifyContent="space-between">
              <Box>
                <Text color={isSelected ? theme.accent : theme.text}>
                  {isSelected ? '› ' : '  '}
                </Text>
                <Text
                  color={isSelected ? theme.accent : isCurrent ? theme.success : theme.text}
                  bold={isSelected || isCurrent}
                >
                  {displayTitle}
                </Text>
                {isCurrent && (
                  <Text color={theme.success}> ●</Text>
                )}
              </Box>
              
              <Box>
                <Text color={theme.textMuted}>
                  {session.messages.length} msgs · {formatTime(session.updatedAt)}
                </Text>
              </Box>
            </Box>
          )
        })}
        
        {displaySessions.length === 0 && (
          <Text color={theme.textMuted}>
            {sessions.length === 0 ? 'No sessions yet' : 'No matching sessions'}
          </Text>
        )}
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} borderStyle="single" borderColor={theme.border} borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} paddingTop={0}>
        <Text color={theme.textMuted}>
          enter: select · ctrl+n: new · ctrl+d: delete · esc: close
        </Text>
      </Box>
    </Box>
  )
}
