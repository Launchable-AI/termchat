import React, { useEffect, useRef } from 'react'
import { Box, Text, useApp, useInput, useStdin } from 'ink'
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
  const { stdin } = useStdin()
  
  // Use selective subscriptions
  const mode = useStore(s => s.mode)
  const dialog = useStore(s => s.dialog)
  const sidebarVisible = useStore(s => s.sidebarVisible)
  const theme = useStore(s => s.theme)
  const isStreaming = useStore(s => s.isStreaming)
  const tabsLength = useStore(s => s.tabs.length)
  const activeTabIndex = useStore(s => s.activeTabIndex)
  const error = useStore(s => s.error)
  const client = useStore(s => s.client)
  
  // Initialize on mount
  useEffect(() => {
    const store = useStore.getState()
    store.loadSessions()
    
    if (client.hasApiKey()) {
      store.testConnection().then((connected) => {
        if (connected) {
          store.loadModels()
        }
      })
    } else {
      store.setDialog('apikey')
    }
    
    const sessions = store.sessions
    const tabs = store.tabs
    if (sessions.length > 0 && tabs.length === 0) {
      store.openTab(sessions[0].id)
    }
  }, [])
  
  // Handle mouse scroll events - use ref to avoid re-subscribing
  const mouseHandlerRef = useRef<((data: Buffer) => void) | null>(null)
  
  useEffect(() => {
    if (!stdin) return
    
    // Enable mouse reporting only once
    process.stdout.write('\x1b[?1000h')
    process.stdout.write('\x1b[?1002h')
    process.stdout.write('\x1b[?1006h')
    
    mouseHandlerRef.current = (data: Buffer) => {
      const str = data.toString()
      const sgrMatch = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/)
      if (sgrMatch) {
        const button = parseInt(sgrMatch[1], 10)
        if (button === 64) {
          useStore.getState().scrollUp(3)
        } else if (button === 65) {
          useStore.getState().scrollDown(3)
        }
      }
    }
    
    stdin.on('data', mouseHandlerRef.current)
    
    return () => {
      if (mouseHandlerRef.current) {
        stdin.off('data', mouseHandlerRef.current)
      }
      process.stdout.write('\x1b[?1000l')
      process.stdout.write('\x1b[?1002l')
      process.stdout.write('\x1b[?1006l')
    }
  }, [stdin])
  
  // Global keybindings
  useInput((input, key) => {
    const store = useStore.getState()
    
    // Always allow Ctrl+C to quit or cancel streaming
    if (key.ctrl && input === 'c') {
      if (store.isStreaming) {
        store.cancelStreaming()
      } else {
        exit()
      }
      return
    }
    
    // Skip if dialog is open
    if (store.dialog !== 'none') {
      if (key.escape) {
        store.setDialog('none')
      }
      return
    }
    
    // Scroll mode is handled by Messages component
    if (store.mode === 'scroll') {
      return
    }
    
    // Insert mode - only Escape exits
    if (store.mode === 'insert') {
      if (key.escape) {
        store.setMode('normal')
      }
      return
    }
    
    // Normal mode keybindings
    if (store.mode === 'normal') {
      if (input === 'i' || key.return) {
        store.setMode('insert')
        return
      }
      
      if (input === 'v' || input === '/' || key.upArrow || key.downArrow) {
        store.setMode('scroll')
        return
      }
      
      if (input === 'j' || input === 'k') {
        store.setMode('scroll')
        if (input === 'k') store.scrollUp(1)
        if (input === 'j') store.scrollDown(1)
        return
      }
      
      if (input === 'q') {
        exit()
        return
      }
      
      if ((key.ctrl && input === 'p') || input === ':') {
        store.setDialog('command')
        return
      }
      
      if (input === 'm') {
        store.setDialog('models')
        return
      }
      
      if (input === 's') {
        store.setDialog('sessions')
        return
      }
      
      if (input === 't') {
        store.cycleTheme()
        return
      }
      
      if (input === 'T') {
        store.setDialog('themes')
        return
      }
      
      if (input === '?') {
        store.setDialog('help')
        return
      }
      
      if (input === 'b') {
        store.toggleSidebar()
        return
      }
      
      if (input === 'n') {
        store.createSession()
        return
      }
      
      if (input === 'c' && store.error) {
        store.setError(null)
        return
      }
      
      if (input >= '1' && input <= '9') {
        const tabIndex = parseInt(input, 10) - 1
        if (tabIndex < store.tabs.length) {
          store.switchTab(tabIndex)
        }
        return
      }
      
      if (key.ctrl && input === 'w') {
        store.closeTab(store.activeTabIndex)
        return
      }
      
      if (input === ']') {
        store.nextTab()
        return
      }
      if (input === '[') {
        store.prevTab()
        return
      }
    }
  })
  
  // Calculate layout dimensions
  const headerHeight = 1
  const footerHeight = 1
  const tabBarHeight = tabsLength > 1 ? 1 : 0
  const contentHeight = height - headerHeight - footerHeight - tabBarHeight
  
  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
    >
      <Header />
      
      {tabsLength > 1 && <TabBar />}
      
      <Box flexGrow={1} flexDirection="row" height={contentHeight}>
        {sidebarVisible && (
          <>
            <Sidebar />
            <Box flexDirection="column" width={1}>
              {Array.from({ length: contentHeight }).map((_, i) => (
                <Text key={i} color={theme.border}>│</Text>
              ))}
            </Box>
          </>
        )}
        
        <Box flexDirection="column" flexGrow={1}>
          <Messages />
          <Input />
        </Box>
      </Box>
      
      <Footer />
      
      {dialog !== 'none' && <Dialog />}
    </Box>
  )
}
