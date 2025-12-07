import React, { useEffect } from 'react'
import { Box, Text, useApp, useInput } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import Header from './Header.js'
import Sidebar from './Sidebar.js'
import Messages from './Messages.js'
import Input from './Input.js'
import Footer from './Footer.js'
import TabBar from './TabBar.js'
import Dialog from './Dialog.js'

const SIDEBAR_WIDTH = 27

export default function App() {
  const { width, height } = useTerminalSize()
  const { exit } = useApp()
  
  const {
    mode,
    dialog,
    sidebarVisible,
    theme,
    isStreaming,
    tabs,
    activeTabIndex,
    setMode,
    setDialog,
    loadSessions,
    createSession,
    cancelStreaming,
    cycleTheme,
    toggleSidebar,
    testConnection,
    loadModels,
    client,
    error,
    setError,
    nextTab,
    prevTab,
    closeTab,
    openTab,
  } = useStore()
  
  // Initialize on mount
  useEffect(() => {
    loadSessions()
    
    // Test connection and load models if API key exists
    if (client.hasApiKey()) {
      testConnection().then((connected) => {
        if (connected) {
          loadModels()
        }
      })
    } else {
      // Show API key dialog
      setDialog('apikey')
    }
    
    // Open first session as a tab if there are sessions but no tabs
    const sessions = useStore.getState().sessions
    if (sessions.length > 0 && tabs.length === 0) {
      openTab(sessions[0].id)
    }
  }, [])
  
  // Global keybindings
  useInput((input, key) => {
    // Always allow Ctrl+C to quit or cancel streaming
    if (key.ctrl && input === 'c') {
      if (isStreaming) {
        cancelStreaming()
      } else {
        exit()
      }
      return
    }
    
    // Skip if dialog is open (dialog handles its own keys)
    if (dialog !== 'none') {
      if (key.escape) {
        setDialog('none')
      }
      return
    }
    
    // Insert mode - only Escape exits
    if (mode === 'insert') {
      if (key.escape) {
        setMode('normal')
      }
      return
    }
    
    // Normal mode keybindings
    if (mode === 'normal') {
      // Enter insert mode
      if (input === 'i' || key.return) {
        setMode('insert')
        return
      }
      
      // Quit
      if (input === 'q') {
        exit()
        return
      }
      
      // Command palette (Ctrl+P or :)
      if ((key.ctrl && input === 'p') || input === ':') {
        setDialog('command')
        return
      }
      
      if (input === 'm') {
        setDialog('models')
        return
      }
      
      if (input === 's') {
        setDialog('sessions')
        return
      }
      
      if (input === 't') {
        cycleTheme()
        return
      }
      
      if (input === 'T') {
        setDialog('themes')
        return
      }
      
      if (input === '?') {
        setDialog('help')
        return
      }
      
      // Toggle sidebar
      if (input === 'b') {
        toggleSidebar()
        return
      }
      
      // New session
      if (input === 'n') {
        createSession()
        return
      }
      
      // Clear error
      if (input === 'c' && error) {
        setError(null)
        return
      }
      
      // Tab navigation with number keys 1-9
      if (input >= '1' && input <= '9') {
        const tabIndex = parseInt(input, 10) - 1
        if (tabIndex < tabs.length) {
          useStore.getState().switchTab(tabIndex)
        }
        return
      }
      
      // Close current tab with Ctrl+W
      if (key.ctrl && input === 'w') {
        closeTab(activeTabIndex)
        return
      }
      
      // Next/prev tab with [ and ]
      if (input === ']') {
        nextTab()
        return
      }
      if (input === '[') {
        prevTab()
        return
      }
    }
  })
  
  // Calculate layout dimensions
  const headerHeight = 1
  const footerHeight = 1
  const tabBarHeight = tabs.length > 1 ? 1 : 0
  const contentHeight = height - headerHeight - footerHeight - tabBarHeight
  
  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
    >
      {/* Header */}
      <Header />
      
      {/* Tab bar (if multiple tabs) */}
      {tabs.length > 1 && <TabBar />}
      
      {/* Main content area */}
      <Box flexGrow={1} flexDirection="row" height={contentHeight}>
        {/* Sidebar */}
        {sidebarVisible && (
          <>
            <Sidebar />
            {/* Vertical separator */}
            <Box flexDirection="column" width={1}>
              {Array.from({ length: contentHeight }).map((_, i) => (
                <Text key={i} color={theme.border}>│</Text>
              ))}
            </Box>
          </>
        )}
        
        {/* Main content (Messages + Input) */}
        <Box flexDirection="column" flexGrow={1}>
          <Messages />
          <Input />
        </Box>
      </Box>
      
      {/* Footer */}
      <Footer />
      
      {/* Dialog overlay */}
      {dialog !== 'none' && <Dialog />}
    </Box>
  )
}
