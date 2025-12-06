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
  description: string
  keybind?: string
  category: string
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
      description: 'Start a new chat session',
      keybind: 'n',
      category: 'Session',
      action: () => {
        createSession()
        setDialog('none')
      },
    },
    {
      id: 'session.list',
      title: 'Session List',
      description: 'Browse and switch sessions',
      keybind: 's',
      category: 'Session',
      action: () => setDialog('sessions'),
    },
    {
      id: 'session.sidebar',
      title: 'Toggle Sidebar',
      description: 'Show/hide session sidebar',
      keybind: 'b',
      category: 'Session',
      action: () => {
        toggleSidebar()
        setDialog('none')
      },
    },
    {
      id: 'model.select',
      title: 'Select Model',
      description: 'Choose a different AI model',
      keybind: 'm',
      category: 'Model',
      action: () => setDialog('models'),
    },
    {
      id: 'theme.select',
      title: 'Select Theme',
      description: 'Change color theme',
      keybind: 'T',
      category: 'Theme',
      action: () => setDialog('themes'),
    },
    {
      id: 'theme.cycle',
      title: 'Cycle Theme',
      description: 'Switch to next theme',
      keybind: 't',
      category: 'Theme',
      action: () => {
        cycleTheme()
        setDialog('none')
      },
    },
    {
      id: 'help',
      title: 'Help',
      description: 'Show keybinding help',
      keybind: '?',
      category: 'General',
      action: () => setDialog('help'),
    },
    {
      id: 'apikey',
      title: 'Configure API Key',
      description: 'Set OpenRouter API key',
      category: 'Settings',
      action: () => setDialog('apikey'),
    },
    ...(isStreaming
      ? [
          {
            id: 'cancel',
            title: 'Cancel Streaming',
            description: 'Stop current response',
            keybind: 'Ctrl+c',
            category: 'General',
            action: () => {
              cancelStreaming()
              setDialog('none')
            },
          },
        ]
      : []),
    {
      id: 'quit',
      title: 'Quit',
      description: 'Exit TermChat',
      keybind: 'q',
      category: 'General',
      action: () => process.exit(0),
    },
  ], [isStreaming])
  
  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands
    }
    
    const results = fuzzysort.go(query, commands, {
      keys: ['title', 'description', 'category'],
      limit: 20,
    })
    
    return results.map((r) => r.obj)
  }, [query, commands])
  
  const clampedIndex = Math.min(selectedIndex, filteredCommands.length - 1)
  const maxVisible = height - 5
  const scrollOffset = Math.max(0, clampedIndex - maxVisible + 2)
  
  useInput((input, key) => {
    // Navigation
    if (key.downArrow || (key.ctrl && input === 'n')) {
      setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
      return
    }
    if (key.upArrow || (key.ctrl && input === 'p')) {
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return
    }
    
    // Execute command
    if (key.return) {
      const cmd = filteredCommands[clampedIndex]
      if (cmd) {
        cmd.action()
      }
      return
    }
  })
  
  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    }
    return groups
  }, [filteredCommands])
  
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.primary} bold>
          Command Palette
        </Text>
      </Box>
      
      {/* Search */}
      <Box marginBottom={1}>
        <Text color={theme.textMuted}>› </Text>
        <TextInput
          value={query}
          onChange={(v) => {
            setQuery(v)
            setSelectedIndex(0)
          }}
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
            <Box key={cmd.id} justifyContent="space-between">
              <Box>
                <Text color={isSelected ? theme.accent : theme.text}>
                  {isSelected ? '› ' : '  '}
                </Text>
                <Text
                  color={isSelected ? theme.accent : theme.text}
                  bold={isSelected}
                >
                  {cmd.title}
                </Text>
                <Text color={theme.textMuted}> - {cmd.description}</Text>
              </Box>
              
              {cmd.keybind && (
                <Text color={theme.textMuted}>
                  {cmd.keybind}
                </Text>
              )}
            </Box>
          )
        })}
        
        {filteredCommands.length === 0 && (
          <Text color={theme.textMuted}>
            No commands found
          </Text>
        )}
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} borderStyle="single" borderColor={theme.border} borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} paddingTop={0}>
        <Text color={theme.textMuted}>
          enter: execute · ↑/↓: navigate · esc: close
        </Text>
      </Box>
    </Box>
  )
}
