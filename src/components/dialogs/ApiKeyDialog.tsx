import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { useStore } from '../../hooks/useStore.js'

interface Props {
  width: number
  height: number
}

export default function ApiKeyDialog({ width, height }: Props) {
  const { theme, setApiKey, testConnection, setDialog, loadModels } = useStore()
  
  const [apiKey, setApiKeyValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  useInput(async (input, key) => {
    if (key.return && apiKey.trim()) {
      setStatus('testing')
      
      // Set the key
      setApiKey(apiKey.trim())
      
      // Test connection
      const success = await testConnection()
      
      if (success) {
        setStatus('success')
        await loadModels()
        // Close dialog after short delay
        setTimeout(() => setDialog('none'), 1000)
      } else {
        setStatus('error')
        setErrorMessage('Invalid API key or connection failed')
      }
    }
  })
  
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={theme.primary} bold>
          OpenRouter API Key
        </Text>
      </Box>
      
      {/* Instructions */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color={theme.text}>
          Enter your OpenRouter API key to connect.
        </Text>
        <Text color={theme.textMuted}>
          Get one at{' '}
          <Text color={theme.info}>https://openrouter.ai/keys</Text>
        </Text>
      </Box>
      
      {/* Input */}
      <Box marginBottom={1}>
        <Text color={theme.textMuted}>API Key: </Text>
        <TextInput
          value={apiKey}
          onChange={setApiKeyValue}
          placeholder="sk-or-..."
          focus={status !== 'success'}
          mask="*"
        />
      </Box>
      
      {/* Status */}
      <Box marginBottom={1}>
        {status === 'testing' && (
          <Text color={theme.warning}>Testing connection...</Text>
        )}
        {status === 'success' && (
          <Text color={theme.success}>✓ Connected successfully!</Text>
        )}
        {status === 'error' && (
          <Text color={theme.error}>✗ {errorMessage}</Text>
        )}
      </Box>
      
      {/* Environment variable hint */}
      <Box flexDirection="column" marginTop={1}>
        <Text color={theme.textMuted}>
          Tip: Set OPENROUTER_API_KEY environment variable
        </Text>
        <Text color={theme.textMuted}>
          to avoid entering key each time.
        </Text>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} borderStyle="single" borderColor={theme.border} borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} paddingTop={0}>
        <Text color={theme.textMuted}>
          enter: submit · esc: close (without key)
        </Text>
      </Box>
    </Box>
  )
}
