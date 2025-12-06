import 'dotenv/config'
import React from 'react'
import { render } from 'ink'
import meow from 'meow'
import App from './components/App.js'

// Check if we're in a proper TTY
if (!process.stdin.isTTY) {
  console.error('Error: TermChat requires an interactive terminal.')
  console.error('Run it directly in your terminal, not through pipes or scripts.')
  process.exit(1)
}

const cli = meow(
  `
  Usage
    $ termchat [options]

  Options
    --model, -m    Set the default model
    --theme, -t    Set the color theme
    --api-key, -k  Set OpenRouter API key
    --help         Show this help
    --version      Show version

  Examples
    $ termchat
    $ termchat --model gpt-4o
    $ termchat --theme tokyonight

  Keybindings
    i, Enter     Enter insert mode (start typing)
    Esc          Exit insert mode
    m            Model selector (fuzzy search)
    s            Session list
    n            New session
    t            Cycle theme
    T            Theme selector
    b            Toggle sidebar
    Ctrl+p       Command palette
    ?            Help
    q            Quit
`,
  {
    importMeta: import.meta,
    flags: {
      model: {
        type: 'string',
        shortFlag: 'm',
      },
      theme: {
        type: 'string',
        shortFlag: 't',
      },
      apiKey: {
        type: 'string',
        shortFlag: 'k',
      },
    },
  }
)

// Apply CLI flags
import { useStore } from './hooks/useStore.js'

async function main() {
  const { flags } = cli
  
  // Pre-apply flags before rendering
  if (flags.apiKey) {
    useStore.getState().setApiKey(flags.apiKey)
  }
  
  if (flags.theme) {
    useStore.getState().setTheme(flags.theme)
  }
  
  if (flags.model) {
    useStore.getState().setCurrentModel(flags.model)
  }
  
  // Render the app
  const { waitUntilExit } = render(<App />)
  
  await waitUntilExit()
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
