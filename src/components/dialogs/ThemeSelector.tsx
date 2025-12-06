import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { useStore } from '../../hooks/useStore.js'
import { getAvailableThemes, themes, getTheme } from '../../themes/index.js'

interface Props {
  width: number
  height: number
}

export default function ThemeSelector({ width, height }: Props) {
  const { theme, themeName, setTheme, setDialog } = useStore()
  
  const availableThemes = getAvailableThemes()
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(0, availableThemes.indexOf(themeName))
  )
  
  const selectedThemeName = availableThemes[selectedIndex]
  const previewTheme = getTheme(selectedThemeName)
  
  useInput((input, key) => {
    // Navigation
    if (key.downArrow || input === 'j') {
      setSelectedIndex((i) => Math.min(i + 1, availableThemes.length - 1))
      return
    }
    if (key.upArrow || input === 'k') {
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return
    }
    
    // Select theme
    if (key.return) {
      setTheme(selectedThemeName)
      setDialog('none')
      return
    }
  })
  
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.primary} bold>
          Select Theme
        </Text>
      </Box>
      
      {/* Theme list */}
      <Box flexDirection="row" height={height - 4}>
        {/* List */}
        <Box flexDirection="column" width={20}>
          {availableThemes.map((name, i) => {
            const isSelected = i === selectedIndex
            const isCurrent = name === themeName
            const displayName = themes[name]?.name || name
            
            return (
              <Box key={name}>
                <Text color={isSelected ? theme.accent : theme.text}>
                  {isSelected ? '› ' : '  '}
                </Text>
                <Text
                  color={isSelected ? theme.accent : isCurrent ? theme.success : theme.text}
                  bold={isSelected}
                >
                  {displayName}
                </Text>
                {isCurrent && (
                  <Text color={theme.success}> ✓</Text>
                )}
              </Box>
            )
          })}
        </Box>
        
        {/* Preview */}
        <Box flexDirection="column" marginLeft={2} flexGrow={1}>
          <Text color={theme.textMuted}>Preview:</Text>
          <Box marginTop={1} flexDirection="column">
            <Box>
              <Text color={previewTheme.primary}>Primary </Text>
              <Text color={previewTheme.secondary}>Secondary </Text>
              <Text color={previewTheme.accent}>Accent</Text>
            </Box>
            <Box>
              <Text color={previewTheme.success}>Success </Text>
              <Text color={previewTheme.warning}>Warning </Text>
              <Text color={previewTheme.error}>Error</Text>
            </Box>
            <Box marginTop={1}>
              <Text color={previewTheme.text}>Regular text</Text>
            </Box>
            <Box>
              <Text color={previewTheme.textMuted}>Muted text</Text>
            </Box>
            <Box marginTop={1}>
              <Text color={previewTheme.syntaxKeyword}>const </Text>
              <Text color={previewTheme.syntaxVariable}>foo </Text>
              <Text color={previewTheme.syntaxOperator}>= </Text>
              <Text color={previewTheme.syntaxString}>"bar"</Text>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} borderStyle="single" borderColor={theme.border} borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} paddingTop={0}>
        <Text color={theme.textMuted}>
          enter: select · j/k: navigate · esc: close
        </Text>
      </Box>
    </Box>
  )
}
