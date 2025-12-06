import React, { useState, useMemo, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import fuzzysort from 'fuzzysort'
import { useStore } from '../../hooks/useStore.js'
import { isFreeTierModel, isReasoningModel, formatModelPrice, Model } from '../../api/openrouter.js'

interface Props {
  width: number
  height: number
}

export default function ModelSelector({ width, height }: Props) {
  const {
    theme,
    models,
    allModels,
    currentModel,
    setCurrentModel,
    toggleFavorite,
    setDialog,
    getSettings,
    loadModels,
    isLoadingModels,
  } = useStore()
  
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  const settings = getSettings()
  
  // Load models on mount if not already loaded
  useEffect(() => {
    if (allModels.length === 0) {
      loadModels()
    }
  }, [])
  
  // Filter and sort models - always search full API list
  const displayModels = useMemo(() => {
    // Use allModels for search, or models (favorites) if showFavoritesOnly
    let sourceModels = showFavoritesOnly ? models : allModels
    
    // Fallback to favorites if allModels not loaded yet
    if (sourceModels.length === 0) {
      sourceModels = models
    }
    
    if (!query.trim()) {
      // Sort: favorites first, then by name
      return sourceModels.slice().sort((a, b) => {
        const aFav = settings.favoriteModels.includes(a.id)
        const bFav = settings.favoriteModels.includes(b.id)
        if (aFav && !bFav) return -1
        if (!aFav && bFav) return 1
        return a.name.localeCompare(b.name)
      })
    }
    
    // Fuzzy search across ALL models
    const results = fuzzysort.go(query, sourceModels, {
      keys: ['name', 'id', 'description'],
      limit: 100,
      threshold: -10000,
    })
    
    return results.map((r) => r.obj)
  }, [query, models, allModels, showFavoritesOnly, settings.favoriteModels])
  
  // Keep selection in bounds
  const clampedIndex = Math.min(selectedIndex, displayModels.length - 1)
  const maxVisible = height - 6 // Account for header, search, footer
  const scrollOffset = Math.max(0, clampedIndex - maxVisible + 3)
  
  useInput((input, key) => {
    // Navigation
    if (key.downArrow || (key.ctrl && input === 'n') || input === 'j') {
      setSelectedIndex((i) => Math.min(i + 1, displayModels.length - 1))
      return
    }
    if (key.upArrow || (key.ctrl && input === 'p') || input === 'k') {
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return
    }
    
    // Page up/down
    if (key.pageUp) {
      setSelectedIndex((i) => Math.max(i - maxVisible, 0))
      return
    }
    if (key.pageDown) {
      setSelectedIndex((i) => Math.min(i + maxVisible, displayModels.length - 1))
      return
    }
    
    // Select model
    if (key.return) {
      const model = displayModels[clampedIndex]
      if (model) {
        setCurrentModel(model.id)
        setDialog('none')
      }
      return
    }
    
    // Toggle favorite
    if (key.tab) {
      const model = displayModels[clampedIndex]
      if (model) {
        toggleFavorite(model.id)
      }
      return
    }
    
    // Toggle favorites only
    if (key.ctrl && input === 'a') {
      setShowFavoritesOnly((s) => !s)
      setSelectedIndex(0)
      return
    }
  })
  
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.primary} bold>
          Select Model
        </Text>
        <Text color={theme.textMuted}> · </Text>
        <Text color={theme.textMuted}>
          {isLoadingModels ? 'loading...' : showFavoritesOnly ? `${models.length} favorites` : `${allModels.length} models`}
        </Text>
      </Box>
      
      {/* Search */}
      <Box marginBottom={1}>
        <Text color={theme.textMuted}>› </Text>
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder="Search models..."
          focus={true}
        />
      </Box>
      
      {/* Model list */}
      <Box flexDirection="column" height={maxVisible}>
        {displayModels.slice(scrollOffset, scrollOffset + maxVisible).map((model, i) => {
          const actualIndex = i + scrollOffset
          const isSelected = actualIndex === clampedIndex
          const isCurrent = model.id === currentModel
          const isFavorite = settings.favoriteModels.includes(model.id)
          const isFree = isFreeTierModel(model.id)
          const isReasoning = isReasoningModel(model.id)
          
          // Truncate name to fit
          const maxNameLen = width - 20
          const displayName = model.name.length > maxNameLen
            ? model.name.slice(0, maxNameLen - 3) + '...'
            : model.name
          
          return (
            <Box key={model.id}>
              <Text color={isSelected ? theme.accent : theme.text}>
                {isSelected ? '› ' : '  '}
              </Text>
              <Text color={isFavorite ? theme.warning : theme.textMuted}>
                {isFavorite ? '★ ' : '  '}
              </Text>
              <Text
                color={isSelected ? theme.accent : isCurrent ? theme.success : theme.text}
                bold={isSelected || isCurrent}
              >
                {displayName}
              </Text>
              
              <Box flexGrow={1} />
              
              {isFree && (
                <Text color={theme.success}>
                  {' free'}
                </Text>
              )}
              {isReasoning && (
                <Text color={theme.info}>
                  {' 🧠'}
                </Text>
              )}
              {isCurrent && (
                <Text color={theme.success}>
                  {' ✓'}
                </Text>
              )}
            </Box>
          )
        })}
        
        {displayModels.length === 0 && (
          <Text color={theme.textMuted}>
            No models found
          </Text>
        )}
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} borderStyle="single" borderColor={theme.border} borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} paddingTop={0}>
        <Text color={theme.textMuted}>
          enter: select · tab: ★ favorite · ctrl+a: {showFavoritesOnly ? 'all' : 'favorites'} · esc: close
        </Text>
      </Box>
    </Box>
  )
}
