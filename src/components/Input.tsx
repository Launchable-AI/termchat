import React, { useState, useEffect } from 'react'
import { Box, Text, useInput, useFocus } from 'ink'
import TextInput from 'ink-text-input'
import { useStore } from '../hooks/useStore.js'

export default function Input() {
  const {
    theme,
    mode,
    inputValue,
    setInputValue,
    setMode,
    sendMessage,
    isStreaming,
    dialog,
    setDialog,
  } = useStore()
  
  const { isFocused } = useFocus({ autoFocus: mode === 'insert' })
  const isActive = mode === 'insert' && dialog === 'none'
  
  // Handle input submission
  const handleSubmit = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    
    // Check for slash commands
    if (trimmed.startsWith('/')) {
      const cmd = trimmed.slice(1).toLowerCase().split(' ')[0]
      switch (cmd) {
        case 'help':
        case 'h':
          setDialog('help')
          setInputValue('')
          return
        case 'models':
        case 'm':
          setDialog('models')
          setInputValue('')
          return
        case 'sessions':
        case 's':
          setDialog('sessions')
          setInputValue('')
          return
        case 'theme':
        case 't':
          setDialog('themes')
          setInputValue('')
          return
        case 'new':
        case 'n':
          useStore.getState().createSession()
          setInputValue('')
          return
        case 'clear':
        case 'c':
          // Clear current session messages
          const session = useStore.getState().getCurrentSession()
          if (session) {
            useStore.getState().updateSessionTitle(session.id, 'New Chat')
            // Storage doesn't have clearMessages, so we'd need to add it
          }
          setInputValue('')
          return
        case 'quit':
        case 'q':
          process.exit(0)
        default:
          // Unknown command, show help
          useStore.getState().setError(`Unknown command: /${cmd}. Type /help for available commands.`)
          setInputValue('')
          return
      }
    }
    
    setInputValue('')
    await sendMessage(trimmed)
  }
  
  // Handle special key combinations when in insert mode
  useInput(
    (input, key) => {
      if (!isActive) return
      
      // Submit on Enter
      if (key.return && !key.shift) {
        handleSubmit(inputValue)
        return
      }
      
      // Exit insert mode on Escape
      if (key.escape) {
        setMode('normal')
        return
      }
    },
    { isActive }
  )
  
  const bg = theme.backgroundPanel
  
  return (
    <Box flexDirection="row" alignItems="center">
      <Text color={isActive ? theme.accent : theme.textMuted} backgroundColor={bg}>
        {'  █ '}
      </Text>
      
      {isActive ? (
        <Box flexGrow={1}>
          <TextInput
            value={inputValue}
            onChange={setInputValue}
            placeholder="Type a message..."
            focus={true}
          />
        </Box>
      ) : (
        <Box flexGrow={1}>
          <Text color={theme.textMuted} backgroundColor={bg}>
            {inputValue || 'Press i or Enter to type...'}
          </Text>
        </Box>
      )}
    </Box>
  )
}
