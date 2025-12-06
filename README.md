# TermChat

A beautiful terminal chat client for LLMs, inspired by [OpenCode](https://opencode.ai).

![TermChat](./screenshot.png)

## Features

- **Multi-model support** via OpenRouter - access 300+ LLM models
- **Fuzzy model search** - quickly find and switch between models
- **Multiple sessions** - manage multiple conversations
- **Vim-inspired keybindings** - efficient keyboard navigation
- **Beautiful themes** - 6 built-in themes (OpenCode, Tokyo Night, Catppuccin, Gruvbox, Nord, Dracula)
- **Real-time streaming** - see responses as they're generated
- **Reasoning model support** - display thinking/reasoning for models like o3, DeepSeek R1

## Installation

```bash
# Using npm
npm install -g termchat

# Or from source
git clone <repo>
cd termchat
npm install
npm run build
npm link
```

## Setup

TermChat requires an OpenRouter API key. Get one at [openrouter.ai/keys](https://openrouter.ai/keys).

```bash
# Option 1: Environment variable (recommended)
export OPENROUTER_API_KEY=sk-or-...

# Option 2: Pass via CLI
termchat --api-key sk-or-...

# Option 3: Enter in the app
# The app will prompt for API key on first run
```

## Usage

```bash
termchat [options]

Options:
  --model, -m    Set the default model
  --theme, -t    Set the color theme
  --api-key, -k  Set OpenRouter API key
  --help         Show help
  --version      Show version
```

## Keybindings

### Mode

| Key | Action |
|-----|--------|
| `i` or `Enter` | Enter insert mode (start typing) |
| `Esc` | Exit insert mode |

### Navigation

| Key | Action |
|-----|--------|
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `Ctrl+d` | Page down |
| `Ctrl+u` | Page up |

### Sessions

| Key | Action |
|-----|--------|
| `n` | New session |
| `s` | Session list |
| `b` | Toggle sidebar |

### Models & Themes

| Key | Action |
|-----|--------|
| `m` | Model selector (fuzzy search) |
| `t` | Cycle theme |
| `T` | Theme selector |

### General

| Key | Action |
|-----|--------|
| `Ctrl+p` | Command palette |
| `?` | Help |
| `c` | Clear error |
| `q` | Quit |
| `Ctrl+c` | Cancel streaming / Quit |

## Slash Commands

| Command | Action |
|---------|--------|
| `/help` | Show help |
| `/models` | Model selector |
| `/sessions` | Session list |
| `/theme` | Theme selector |
| `/new` | New session |
| `/quit` | Quit |

## Themes

TermChat includes 6 beautiful themes:

- **OpenCode** (default) - Clean, minimal dark theme
- **Tokyo Night** - Popular VS Code theme
- **Catppuccin** - Soothing pastel theme
- **Gruvbox** - Retro groove color scheme
- **Nord** - Arctic, bluish color palette
- **Dracula** - Dark theme for vampires

Press `t` to cycle themes or `T` to open the theme selector.

## Configuration

Settings are stored in `~/.config/termchat/config.json`:

```json
{
  "theme": "opencode",
  "defaultModel": "deepseek/deepseek-chat:free",
  "favoriteModels": [
    "anthropic/claude-sonnet-4",
    "openai/gpt-4o",
    "deepseek/deepseek-chat:free"
  ]
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Type check
npm run typecheck

# Build
npm run build
```

## License

MIT

## Credits

Inspired by [OpenCode](https://opencode.ai) by [SST](https://sst.dev).
