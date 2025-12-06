import React from 'react'
import { Box, Text, useInput } from 'ink'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import ModelSelector from './dialogs/ModelSelector.js'
import SessionList from './dialogs/SessionList.js'
import ThemeSelector from './dialogs/ThemeSelector.js'
import HelpDialog from './dialogs/HelpDialog.js'
import CommandPalette from './dialogs/CommandPalette.js'
import ApiKeyDialog from './dialogs/ApiKeyDialog.js'

export default function Dialog() {
  const { dialog, theme, setDialog } = useStore()
  const { width, height } = useTerminalSize()
  
  // Dialog dimensions
  const dialogWidth = Math.min(70, width - 4)
  const dialogHeight = Math.min(20, height - 6)
  
  // Close on Escape
  useInput((input, key) => {
    if (key.escape) {
      setDialog('none')
    }
  })
  
  const renderContent = () => {
    switch (dialog) {
      case 'models':
        return <ModelSelector width={dialogWidth} height={dialogHeight} />
      case 'sessions':
        return <SessionList width={dialogWidth} height={dialogHeight} />
      case 'themes':
        return <ThemeSelector width={dialogWidth} height={dialogHeight} />
      case 'help':
        return <HelpDialog width={dialogWidth} height={dialogHeight} />
      case 'command':
        return <CommandPalette width={dialogWidth} height={dialogHeight} />
      case 'apikey':
        return <ApiKeyDialog width={dialogWidth} height={dialogHeight} />
      default:
        return null
    }
  }
  
  if (dialog === 'none') return null
  
  // Center the dialog
  const left = Math.floor((width - dialogWidth - 2) / 2)
  const top = Math.floor((height - dialogHeight - 2) / 2)
  
  return (
    <Box
      position="absolute"
      marginLeft={left}
      marginTop={top}
      width={dialogWidth + 2}
      height={dialogHeight + 2}
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.borderActive}
    >
      {renderContent()}
    </Box>
  )
}
