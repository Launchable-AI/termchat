import React, { useState, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import fuzzysort from 'fuzzysort'
import { useStore } from '../../hooks/useStore.js'

interface Props {
  width: number
  height: number
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
    if (!query.trim()) return sessions
    
    const results = fuzzysort.go(query, sessions, {
      keys: ['title'],
      limit: 50,
    })
    return results.map((r) => r.obj)
  }, [query, sessions])
  
  const clampedIndex = Math.min(selectedIndex, Math.max(0, displaySessions.length - 1))
  const maxVisible = height - 5
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
    
    if (key.downArrow || (key.ctrl && input === 'n') || input === 'j') {
      setSelectedIndex((i) => Math.min(i + 1, displaySessions.length - 1))
      return
    }
    if (key.upArrow || (key.ctrl && input === 'p') || input === 'k') {
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (key.return) {
      const session = displaySessions[clampedIndex]
      if (session) {
        selectSession(session.id)
        setDialog('none')
      }
      return
    }
    if (key.ctrl && input === 'd') {
      const session = displaySessions[clampedIndex]
      if (session) setConfirmDelete(session.id)
      return
    }
    if (key.ctrl && input === 'n') {
      createSession()
      setDialog('none')
      return
    }
  })
  
  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.accent} bold>Sessions</Text>
        <Text color={theme.border}> │ </Text>
        <Text color={theme.textMuted}>{sessions.length} total</Text>
      </Box>
      
      {/* Search */}
      <Box marginBottom={1}>
        <Text color={theme.accent}>❯</Text>
        <Text> </Text>
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder="Search sessions..."
          focus={!confirmDelete}
        />
      </Box>
      
      {/* Delete confirmation */}
      {confirmDelete && (
        <Box marginBottom={1}>
          <Text color={theme.warning}>Delete session?</Text>
          <Text color={theme.textMuted}> (</Text>
          <Text color={theme.accent}>y</Text>
          <Text color={theme.textMuted}>/</Text>
          <Text color={theme.accent}>n</Text>
          <Text color={theme.textMuted}>)</Text>
        </Box>
      )}
      
      {/* Session list */}
      <Box flexDirection="column" height={maxVisible}>
        {displaySessions.slice(scrollOffset, scrollOffset + maxVisible).map((session, i) => {
          const actualIndex = i + scrollOffset
          const isSelected = actualIndex === clampedIndex
          const isCurrent = session.id === currentSessionId
          
          const timeStr = formatRelativeTime(session.updatedAt)
          const msgCount = session.messages.length
          const maxTitleLen = width - timeStr.length - 15
          const displayTitle = session.title.length > maxTitleLen
            ? session.title.slice(0, maxTitleLen - 1) + '…'
            : session.title
          
          return (
            <Box key={session.id}>
              <Text color={isSelected ? theme.accent : theme.textMuted}>
                {isSelected ? '▸' : ' '}
              </Text>
              <Text> </Text>
              <Text
                color={isSelected ? theme.text : isCurrent ? theme.success : theme.textMuted}
                bold={isSelected}
              >
                {displayTitle}
              </Text>
              {isCurrent && <Text color={theme.success}> ●</Text>}
              <Box flexGrow={1} />
              <Text color={theme.border}>{msgCount} msgs</Text>
              <Text color={theme.textMuted}> {timeStr}</Text>
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
      <Box marginTop={1}>
        <Text color={theme.border}>─</Text>
        <Text color={theme.textMuted}> </Text>
        <Text color={theme.accent}>enter</Text>
        <Text color={theme.textMuted}> select </Text>
        <Text color={theme.accent}>^n</Text>
        <Text color={theme.textMuted}> new </Text>
        <Text color={theme.accent}>^d</Text>
        <Text color={theme.textMuted}> delete </Text>
        <Text color={theme.accent}>esc</Text>
        <Text color={theme.textMuted}> close</Text>
      </Box>
    </Box>
  )
}
