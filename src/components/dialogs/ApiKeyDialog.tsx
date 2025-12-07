import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { useStore } from '../../hooks/useStore.js'

interface Props {
  width: number
  height: number
}

// Spinner for loading state
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export default function ApiKeyDialog({ width, height }: Props) {
  const { theme, setApiKey, testConnection, setDialog, loadModels } = useStore()
  
  const [apiKey, setApiKeyValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [spinnerFrame, setSpinnerFrame] = useState(0)
  
  // Spinner animation
  React.useEffect(() => {
    if (status === 'testing') {
      const interval = setInterval(() => {
        setSpinnerFrame((f) => (f + 1) % SPINNER.length)
      }, 80)
      return () => clearInterval(interval)
    }
  }, [status])
  
  useInput(async (input, key) => {
    if (key.return && apiKey.trim()) {
      setStatus('testing')
      setApiKey(apiKey.trim())
      
      const success = await testConnection()
      
      if (success) {
        setStatus('success')
        await loadModels()
        setTimeout(() => setDialog('none'), 800)
      } else {
        setStatus('error')
        setErrorMessage('Invalid API key or connection failed')
      }
    }
  })
  
  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.accent} bold>OpenRouter API Key</Text>
      </Box>
      
      {/* Instructions */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color={theme.text}>Enter your API key to connect.</Text>
        <Box>
          <Text color={theme.textMuted}>Get one at </Text>
          <Text color={theme.info}>openrouter.ai/keys</Text>
        </Box>
      </Box>
      
      {/* Input */}
      <Box marginBottom={1}>
        <Text color={theme.accent}>❯</Text>
        <Text> </Text>
        <TextInput
          value={apiKey}
          onChange={setApiKeyValue}
          placeholder="sk-or-..."
          focus={status !== 'success'}
          mask="•"
        />
      </Box>
      
      {/* Status */}
      <Box marginBottom={1} height={1}>
        {status === 'testing' && (
          <>
            <Text color={theme.warning}>{SPINNER[spinnerFrame]}</Text>
            <Text color={theme.warning}> Testing connection...</Text>
          </>
        )}
        {status === 'success' && (
          <>
            <Text color={theme.success}>●</Text>
            <Text color={theme.success}> Connected!</Text>
          </>
        )}
        {status === 'error' && (
          <>
            <Text color={theme.error}>●</Text>
            <Text color={theme.error}> {errorMessage}</Text>
          </>
        )}
      </Box>
      
      {/* Environment hint */}
      <Box flexDirection="column" marginTop={1}>
        <Text color={theme.border}>─</Text>
        <Box marginTop={1}>
          <Text color={theme.textMuted}>Tip: Set </Text>
          <Text color={theme.info}>OPENROUTER_API_KEY</Text>
          <Text color={theme.textMuted}> env var</Text>
        </Box>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1}>
        <Text color={theme.accent}>enter</Text>
        <Text color={theme.textMuted}> submit </Text>
        <Text color={theme.accent}>esc</Text>
        <Text color={theme.textMuted}> close</Text>
      </Box>
    </Box>
  )
}
