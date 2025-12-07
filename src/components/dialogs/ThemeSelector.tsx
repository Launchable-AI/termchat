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
  
  const maxVisible = height - 4
  const scrollOffset = Math.max(0, selectedIndex - maxVisible + 3)
  
  useInput((input, key) => {
    if (key.downArrow || input === 'j') {
      setSelectedIndex((i) => Math.min(i + 1, availableThemes.length - 1))
      return
    }
    if (key.upArrow || input === 'k') {
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (key.return) {
      setTheme(selectedThemeName)
      setDialog('none')
      return
    }
  })
  
  const listWidth = 18
  const previewWidth = width - listWidth - 3
  
  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.accent} bold>Theme</Text>
        <Text color={theme.border}> │ </Text>
        <Text color={theme.textMuted}>{availableThemes.length} themes</Text>
      </Box>
      
      {/* Two-column layout */}
      <Box flexDirection="row" height={maxVisible}>
        {/* Theme list */}
        <Box flexDirection="column" width={listWidth}>
          {availableThemes.slice(scrollOffset, scrollOffset + maxVisible).map((name, i) => {
            const actualIndex = i + scrollOffset
            const isSelected = actualIndex === selectedIndex
            const isCurrent = name === themeName
            const displayName = themes[name]?.name || name
            
            return (
              <Box key={name}>
                <Text color={isSelected ? theme.accent : theme.textMuted}>
                  {isSelected ? '▸' : ' '}
                </Text>
                <Text> </Text>
                <Text
                  color={isSelected ? theme.text : isCurrent ? theme.success : theme.textMuted}
                  bold={isSelected}
                >
                  {displayName}
                </Text>
                {isCurrent && <Text color={theme.success}> ●</Text>}
              </Box>
            )
          })}
        </Box>
        
        {/* Separator */}
        <Box flexDirection="column" width={1} marginX={1}>
          {Array.from({ length: maxVisible }).map((_, i) => (
            <Text key={i} color={theme.border}>│</Text>
          ))}
        </Box>
        
        {/* Preview */}
        <Box flexDirection="column" width={previewWidth}>
          <Text color={theme.textMuted} dimColor>Preview</Text>
          <Box marginTop={1} flexDirection="column">
            <Box>
              <Text color={previewTheme.accent}>accent </Text>
              <Text color={previewTheme.primary}>primary </Text>
              <Text color={previewTheme.secondary}>secondary</Text>
            </Box>
            <Box>
              <Text color={previewTheme.success}>success </Text>
              <Text color={previewTheme.warning}>warning </Text>
              <Text color={previewTheme.error}>error</Text>
            </Box>
            <Box marginTop={1}>
              <Text color={previewTheme.text}>Regular text</Text>
            </Box>
            <Box>
              <Text color={previewTheme.textMuted}>Muted text</Text>
            </Box>
            <Box marginTop={1}>
              <Text color={previewTheme.syntaxKeyword}>const </Text>
              <Text color={previewTheme.syntaxVariable}>x </Text>
              <Text color={previewTheme.syntaxOperator}>= </Text>
              <Text color={previewTheme.syntaxString}>"hello"</Text>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1}>
        <Text color={theme.border}>─</Text>
        <Text color={theme.textMuted}> </Text>
        <Text color={theme.accent}>enter</Text>
        <Text color={theme.textMuted}> select </Text>
        <Text color={theme.accent}>j/k</Text>
        <Text color={theme.textMuted}> navigate </Text>
        <Text color={theme.accent}>esc</Text>
        <Text color={theme.textMuted}> close</Text>
      </Box>
    </Box>
  )
}
