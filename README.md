# Whhaaat CLI

A premium command-line interface tool designed to explain complex or dangerous terminal commands in plain English. It serves as a safety net for developers, system administrators, and beginners by parsing terminal commands, assessing their risk levels, and suggesting safer alternatives before execution.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [AI Fallback Setup](#ai-fallback-setup)
- [Built With](#built-with)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Plain English Explanations**: Translates technical commands into straightforward descriptions.
- **Risk Assessment**: Flags highly dangerous commands (e.g., `rm -rf /`, `chmod 777`) and warns about destructive flags.
- **Smart Autocomplete**: Includes a built-in typo correction engine (e.g., automatically suggesting `git push` if `git pus` is provided).
- **Safer Alternatives**: Recommends non-destructive ways to achieve the same result.
- **AI Fallback**: Automatically invokes a local LLM via Ollama to generate explanations for unfamiliar commands.
- **Auto-Caching**: AI generated answers are permanently cached and instantly mapped to your autocomplete engine.
- **Extensible**: Fully configuration-driven via `~/.whhaaatrc` plugins and API overrides.
- **Polished Terminal UI**: Rendered with clean typography, boxes, and gradient elements.

## Prerequisites

- Node.js (version 18.x or higher is strictly required)
- npm or yarn package manager
- (Optional) [Ollama](https://ollama.com/) installed locally for dynamic AI-generated explanations.

## Installation

Clone the repository and install dependencies locally.

```bash
git clone https://github.com/yourusername/Whhaaat-CLI.git
cd Whhaaat-CLI

npm install

# Make the command globally available
npm link
```

## Usage

You can pass the command you want explained directly to `whhaaat`.

```bash
# Basic usage
whhaaat rm -rf /

# Explain specific commands with flags
whhaaat chmod 777 index.js

# Autocomplete intelligently suggests corrections
whhaaat git pus

# Passing the ignore keyword explicitly
whhaaat whhaaat ls
```

## Configuration & Plugins

Upon its first execution, the CLI automatically generates a `~/.whhaaatrc` configuration file in your home directory:

```json
{
  "ai_model": "llama3",
  "ai_url": "http://localhost:11434/api/generate",
  "timeout": 10000,
  "plugins": []
}
```

### Writing Plugins
You can easily inject custom command logic without modifying the package source. Add absolute paths to the `plugins` array in your `~/.whhaaatrc`:
- **JSON files**: `["~/my-company-commands.json"]` will merge custom JSON schema commands into memory.
- **Javascript scripts**: `["~/my-plugin.js"]` will dynamically `import()` your Javascript and extract any `export const commands = {}` objects automatically.

## AI Fallback Setup

Whhaaat CLI utilizes a robust local database of commands. If a command is completely unrecognized, the tool automatically delegates the query to a local AI model for a dynamic explanation.

To enable this feature:

1. Install [Ollama](https://ollama.com/). On Linux/macOS, you can run: `curl -fsSL https://ollama.com/install.sh | sh`
2. Start the Ollama background service in a separate terminal with `ollama serve`.
3. Download the targeted model by running `ollama pull llama3`.

The CLI will automatically reach out to `http://localhost:11434` when the AI fallback is triggered. By default, it expects the base `llama3` model.

### Training a Custom Model (Recommended)

To make the AI more stable and force it to adhere strictly to the JSON format, it is highly recommended to "train" a custom model by making use of a `Modelfile`. 

1. Create a `Modelfile` in the root of the project:
```dockerfile
FROM llama3
PARAMETER temperature 0.2
SYSTEM """
You are the backend AI for 'Whhaaat CLI', an expert developer terminal assistant. 
Whenever you receive a terminal command, you MUST explain it in simple English for a beginner.
You MUST output ONLY a pure, valid JSON object. No markdown formatting, no backticks, no introduction.
The JSON MUST have these exact keys:
- "name" (string)
- "description" (string)
- "risk" (one of: Zero, Low, Medium, High, Critical)
- "dangerousFlags" (object where keys are flags and values are short descriptions)
- "safeness" (short safety tip)
- "alternatives" (array of strings)
"""
```

2. Compile your custom model by running:
```bash
ollama create whhaaat-ai -f ./Modelfile
```

3. Open your `~/.whhaaatrc` file and update the `ai_model` key from `"llama3"` to `"whhaaat-ai"`.

## Built With

- [Commander.js](https://github.com/tj/commander.js) - Command-line interface framework
- [fastest-levenshtein](https://github.com/ka-weihe/fastest-levenshtein) - Lightning-fast Levenshtein distance for autocomplete
- [Axios](https://github.com/axios/axios) - Promise-based HTTP client for AI network requests
- [Chalk](https://github.com/chalk/chalk) - Terminal string styling
- [Boxen](https://github.com/sindresorhus/boxen) - Terminal box frame creation
- [Gradient String](https://github.com/bokub/gradient-string) - Gradient text output
- [Ora](https://github.com/sindresorhus/ora) - Elegant terminal spinners

## Contributing

Contributions make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Add new command definitions to `commands.json`
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

Distributed under the MIT License.
