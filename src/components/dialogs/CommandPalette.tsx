import React, { useState, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import fuzzysort from 'fuzzysort'
import { useStore } from '../../hooks/useStore.js'

interface Props {
  width: number
  height: number
}

interface Command {
  id: string
  title: string
  desc: string
  key?: string
  action: () => void
}

export default function CommandPalette({ width, height }: Props) {
  const {
    theme,
    setDialog,
    createSession,
    toggleSidebar,
    cycleTheme,
    cancelStreaming,
    isStreaming,
  } = useStore()
  
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // Define commands
  const commands: Command[] = useMemo(() => [
    {
      id: 'session.new',
      title: 'New Session',
      desc: 'Start a new chat',
      key: 'n',
      action: () => { createSession(); setDialog('none') },
    },
    {
      id: 'session.list',
      title: 'Session List',
      desc: 'Browse sessions',
      key: 's',
      action: () => setDialog('sessions'),
    },
    {
      id: 'session.sidebar',
      title: 'Toggle Sidebar',
      desc: 'Show/hide sidebar',
      key: 'b',
      action: () => { toggleSidebar(); setDialog('none') },
    },
    {
      id: 'model.select',
      title: 'Select Model',
      desc: 'Choose AI model',
      key: 'm',
      action: () => setDialog('models'),
    },
    {
      id: 'theme.select',
      title: 'Select Theme',
      desc: 'Change colors',
      key: 'T',
      action: () => setDialog('themes'),
    },
    {
      id: 'theme.cycle',
      title: 'Cycle Theme',
      desc: 'Next theme',
      key: 't',
      action: () => { cycleTheme(); setDialog('none') },
    },
    {
      id: 'help',
      title: 'Help',
      desc: 'Keybindings',
      key: '?',
      action: () => setDialog('help'),
    },
    {
      id: 'apikey',
      title: 'API Key',
      desc: 'Configure OpenRouter',
      action: () => setDialog('apikey'),
    },
    ...(isStreaming ? [{
      id: 'cancel',
      title: 'Cancel',
      desc: 'Stop streaming',
      key: '^c',
      action: () => { cancelStreaming(); setDialog('none') },
    }] : []),
    {
      id: 'quit',
      title: 'Quit',
      desc: 'Exit termchat',
      key: 'q',
      action: () => process.exit(0),
    },
  ], [isStreaming])
  
  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    
    const results = fuzzysort.go(query, commands, {
      keys: ['title', 'desc'],
      limit: 20,
    })
    return results.map((r) => r.obj)
  }, [query, commands])
  
  const clampedIndex = Math.min(selectedIndex, Math.max(0, filteredCommands.length - 1))
  const maxVisible = height - 4
  const scrollOffset = Math.max(0, clampedIndex - maxVisible + 2)
  
  useInput((input, key) => {
    if (key.downArrow || (key.ctrl && input === 'n')) {
      setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
      return
    }
    if (key.upArrow || (key.ctrl && input === 'p')) {
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (key.return) {
      const cmd = filteredCommands[clampedIndex]
      if (cmd) cmd.action()
      return
    }
  })
  
  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.accent} bold>Commands</Text>
      </Box>
      
      {/* Search */}
      <Box marginBottom={1}>
        <Text color={theme.accent}>❯</Text>
        <Text> </Text>
        <TextInput
          value={query}
          onChange={(v) => { setQuery(v); setSelectedIndex(0) }}
          placeholder="Type a command..."
          focus={true}
        />
      </Box>
      
      {/* Command list */}
      <Box flexDirection="column" height={maxVisible}>
        {filteredCommands.slice(scrollOffset, scrollOffset + maxVisible).map((cmd, i) => {
          const actualIndex = i + scrollOffset
          const isSelected = actualIndex === clampedIndex
          
          return (
            <Box key={cmd.id}>
              <Text color={isSelected ? theme.accent : theme.textMuted}>
                {isSelected ? '▸' : ' '}
              </Text>
              <Text> </Text>
              <Text color={isSelected ? theme.text : theme.textMuted} bold={isSelected}>
                {cmd.title}
              </Text>
              <Text color={theme.border}> - </Text>
              <Text color={theme.textMuted}>{cmd.desc}</Text>
              <Box flexGrow={1} />
              {cmd.key && <Text color={theme.border}>{cmd.key}</Text>}
            </Box>
          )
        })}
        {filteredCommands.length === 0 && (
          <Text color={theme.textMuted}>No commands found</Text>
        )}
      </Box>
      
      {/* Footer */}
      <Box marginTop={1}>
        <Text color={theme.border}>─</Text>
        <Text color={theme.textMuted}> </Text>
        <Text color={theme.accent}>enter</Text>
        <Text color={theme.textMuted}> run </Text>
        <Text color={theme.accent}>↑/↓</Text>
        <Text color={theme.textMuted}> navigate </Text>
        <Text color={theme.accent}>esc</Text>
        <Text color={theme.textMuted}> close</Text>
      </Box>
    </Box>
  )
}
