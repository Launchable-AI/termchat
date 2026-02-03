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

// Dialog wrapper with dark overlay and centered modal
function DialogWrapper({ children, width, height }: { children: React.ReactNode; width: number; height: number }) {
  const theme = useStore(s => s.theme)
  const { width: termWidth, height: termHeight } = useTerminalSize()
  
  // Close on Escape
  useInput((input, key) => {
    if (key.escape) {
      useStore.getState().setDialog('none')
    }
  })
  
  // Calculate center position
  const dialogWidth = Math.min(width + 4, termWidth - 4)
  const dialogHeight = Math.min(height + 2, termHeight - 4)
  const left = Math.max(0, Math.floor((termWidth - dialogWidth) / 2))
  const top = Math.max(0, Math.floor((termHeight - dialogHeight) / 2))
  
  // Create semi-transparent overlay effect with block characters
  const overlayLines: React.ReactNode[] = []
  
  for (let y = 0; y < termHeight; y++) {
    const inDialogY = y >= top && y < top + dialogHeight
    
    if (inDialogY) {
      // Dialog row
      const dialogY = y - top
      const isTopBorder = dialogY === 0
      const isBottomBorder = dialogY === dialogHeight - 1
      
      overlayLines.push(
        <Box key={y}>
          {/* Left overlay */}
          <Text backgroundColor={theme.background} color={theme.background}>
            {'░'.repeat(left)}
          </Text>
          
          {/* Dialog border/content */}
          {isTopBorder ? (
            <Text backgroundColor={theme.backgroundPanel} color={theme.borderActive}>
              {'╭'}{'─'.repeat(dialogWidth - 2)}{'╮'}
            </Text>
          ) : isBottomBorder ? (
            <Text backgroundColor={theme.backgroundPanel} color={theme.borderActive}>
              {'╰'}{'─'.repeat(dialogWidth - 2)}{'╯'}
            </Text>
          ) : (
            <>
              <Text backgroundColor={theme.backgroundPanel} color={theme.borderActive}>│</Text>
              <Text backgroundColor={theme.backgroundPanel}>
                {' '.repeat(dialogWidth - 2)}
              </Text>
              <Text backgroundColor={theme.backgroundPanel} color={theme.borderActive}>│</Text>
            </>
          )}
          
          {/* Right overlay */}
          <Text backgroundColor={theme.background} color={theme.background}>
            {'░'.repeat(Math.max(0, termWidth - left - dialogWidth))}
          </Text>
        </Box>
      )
    } else {
      // Pure overlay row
      overlayLines.push(
        <Box key={y}>
          <Text backgroundColor={theme.background} color={theme.background}>
            {'░'.repeat(termWidth)}
          </Text>
        </Box>
      )
    }
  }
  
  return (
    <Box
      position="absolute"
      width={termWidth}
      height={termHeight}
      flexDirection="column"
    >
      {/* Overlay layer */}
      <Box position="absolute" flexDirection="column">
        {overlayLines}
      </Box>
      
      {/* Content layer - positioned inside dialog */}
      <Box
        position="absolute"
        marginLeft={left + 1}
        marginTop={top + 1}
        width={dialogWidth - 2}
        height={dialogHeight - 2}
      >
        {children}
      </Box>
    </Box>
  )
}

export default function Dialog() {
  const dialog = useStore(s => s.dialog)
  const { width, height } = useTerminalSize()
  
  if (dialog === 'none') return null
  
  // Dialog dimensions based on type
  const getDialogDimensions = () => {
    switch (dialog) {
      case 'help':
        return { width: Math.min(80, width - 8), height: Math.min(24, height - 6) }
      case 'models':
        return { width: Math.min(70, width - 8), height: Math.min(20, height - 6) }
      case 'sessions':
        return { width: Math.min(65, width - 8), height: Math.min(18, height - 6) }
      case 'themes':
        return { width: Math.min(60, width - 8), height: Math.min(16, height - 6) }
      case 'command':
        return { width: Math.min(65, width - 8), height: Math.min(16, height - 6) }
      case 'apikey':
        return { width: Math.min(55, width - 8), height: Math.min(14, height - 6) }
      default:
        return { width: Math.min(60, width - 8), height: Math.min(16, height - 6) }
    }
  }
  
  const { width: dialogWidth, height: dialogHeight } = getDialogDimensions()
  
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
  
  return (
    <DialogWrapper width={dialogWidth} height={dialogHeight}>
      {renderContent()}
    </DialogWrapper>
  )
}
