# Kiro Agent - VS Code Extension

## Overview

The **Kiro Agent** is a sophisticated AI-integrated, spec-based development environment that transforms how developers build software. This VS Code extension enables developers to define systems and their components using friendly, natural language specifications that generate production-ready code for deployment.

**Key Features:**
- AI-powered coding assistant with multi-provider support
- Specification-based development workflow
- Advanced prompt engineering system
- Comprehensive tool ecosystem
- Real-time collaboration capabilities
- Enterprise-grade security and authentication

## Architecture

### Extension Structure

The extension follows a monorepo architecture with 11 specialized packages:

- **`@amzn/codewhisperer-runtime`** - AWS CodeWhisperer integration
- **`continuedev/*`** - Core AI chat functionality (core, extension, GUI, config)
- **`kiro-shared`** - Shared utilities and types
- **`kiro-shared-types`** - TypeScript definitions
- **`kiricons`** - Icon system (495+ SVG icons)
- **`hook-editor`** - Automation hook editor
- **`webview-components`** - UI components

### Main Components

**Extension Entry Point:**
- Main bundle: [`dist/extension.js`](file:///Users/ghuntley/Desktop/kiro.kiro-agent/dist/extension.js) (~764KB)
- Activation lifecycle: `activate()` → `dynamicImportAndActivate()` → `activateExtension()`
- Command registry: 52 commands with comprehensive VS Code integration

**Core Modules:**
- **VsCodeExtension**: Central coordinator
- **VsCodeIde**: VS Code API integration
- **DiffManager**: Code change management
- **TabAutocompleteModel**: AI-powered completions
- **Core**: Main business logic processor

## AI/LLM Integration

### Supported AI Providers

**OpenAI Models:**
- GPT-3.5-turbo, GPT-4, GPT-4o variants
- Context lengths up to 128K tokens
- Tokenizer mappings for accurate token counting

**Anthropic Models:**
- Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- Context lengths up to 200K tokens
- Specialized prompt formatting

**Other Providers:**
- **AWS Bedrock** - Enterprise AI models
- **Ollama** - Local model execution
- **Mistral** - European AI models
- **Gemini** - Google's AI models
- **Amazon Q Developer** - AWS development assistant
- **Kiro** - Custom provider integration

### Model Configuration

**Template System:**
- Model-specific prompt templates with auto-detection
- Provider-specific formatting (OpenAI, Anthropic, Ollama, etc.)
- Template factory pattern for consistent message handling

**Streaming Support:**
- Real-time response streaming via `streamComplete()` methods
- AWS CodeWhisperer streaming client integration
- Bidirectional communication with webview components

## Prompt Engineering System

### Base System Prompt

The core system prompt (`getBasePrompt()`) establishes Kiro's comprehensive identity and operational framework. This prompt defines Kiro's personality, capabilities, response style, and key features.

**Full prompt text:** See [`prompts/system-prompt.md`](prompts/system-prompt.md)

**Key Components:**
- **Identity:** Defines Kiro as an AI assistant and IDE for developers
- **Capabilities:** File system operations, code assistance, infrastructure help
- **Rules:** Security guidelines, PII handling, code quality requirements
- **Response Style:** Warm, knowledgeable, developer-focused communication
- **System Information:** OS, platform, shell, date/time context
- **Kiro Features:** Autonomy modes, chat context, steering, specs, hooks, MCP

**Dynamic Context Injection:**
- System information (OS, platform, shell)
- Current workspace state
- Open editor files
- Active file information
- Current date/time

### Model-Specific Templates

**Edit Prompt Templates for Different AI Models:**

Kiro includes optimized edit prompts for 14+ different AI models and providers. Each prompt is carefully crafted to work with the specific formatting and instruction-following patterns of different models.

**Available Edit Prompts:**
- **GPT Edit Prompt:** [`prompts/gpt-edit.md`](prompts/gpt-edit.md) - OpenAI GPT models
- **Claude Edit Prompt:** [`prompts/claude-edit.md`](prompts/claude-edit.md) - Anthropic Claude models
- **Mistral Edit Prompt:** [`prompts/mistral-edit.md`](prompts/mistral-edit.md) - Mistral models
- **DeepSeek Edit Prompt:** [`prompts/deepseek-edit.md`](prompts/deepseek-edit.md) - DeepSeek Coder models
- **Llama 3 Edit Prompt:** [`prompts/llama3-edit.md`](prompts/llama3-edit.md) - Llama 3 models
- **Alpaca Edit Prompt:** [`prompts/alpaca-edit.md`](prompts/alpaca-edit.md) - Alpaca models
- **Phind Edit Prompt:** [`prompts/phind-edit.md`](prompts/phind-edit.md) - Phind models
- **Zephyr Edit Prompt:** [`prompts/zephyr-edit.md`](prompts/zephyr-edit.md) - Zephyr models
- **OpenChat Edit Prompt:** [`prompts/openchat-edit.md`](prompts/openchat-edit.md) - OpenChat models
- **XWin-Coder Edit Prompt:** [`prompts/xwin-coder-edit.md`](prompts/xwin-coder-edit.md) - XWin-Coder models
- **Neural Chat Edit Prompt:** [`prompts/neural-chat-edit.md`](prompts/neural-chat-edit.md) - Neural Chat models
- **CodeLlama 70B Edit Prompt:** [`prompts/codellama-70b-edit.md`](prompts/codellama-70b-edit.md) - CodeLlama 70B models
- **Gemma Edit Prompt:** [`prompts/gemma-edit.md`](prompts/gemma-edit.md) - Gemma models
- **Simplified Edit Prompt:** [`prompts/simplified-edit.md`](prompts/simplified-edit.md) - Generic fallback

**Template Factory System:**
- Automatic model detection via `autodetectPromptTemplates()`
- Provider-specific handling (OpenAI, Anthropic, Ollama, etc.)
- Template compilation with Handlebars support
- Message role management and formatting
- Context-aware rendering with dynamic variables

### Specialized Workflow Prompts

**Specification Generation Workflow:**

Kiro implements a sophisticated specification-based development workflow that guides users through requirements gathering, design, and implementation planning.

**Available Workflow Prompts:**
- **Requirements Clarification:** [`prompts/spec-requirements-clarification.md`](prompts/spec-requirements-clarification.md) - EARS format requirements generation
- **Design Document Creation:** [`prompts/spec-design-document.md`](prompts/spec-design-document.md) - Architecture and component design
- **Implementation Planning:** [`prompts/spec-implementation-plan.md`](prompts/spec-implementation-plan.md) - Task breakdown and coding steps
- **Task Execution:** [`prompts/spec-task-execution.md`](prompts/spec-task-execution.md) - Individual task implementation
- **Hook Creation:** [`prompts/hook-creation.md`](prompts/hook-creation.md) - Automated workflow triggers

### Intent Classification System

**Multi-Modal Intent Detection:**
The `IntentClassifier` uses sophisticated prompt engineering for intent recognition:

```
Classify the user's intent from their message:
- DO: Imperative actions (default mode)
- CHAT: Questions and explanations
- SPEC: Specification creation and management

Consider context, tone, and explicit keywords to determine intent.
Provide confidence scores for classification accuracy.
```

**Classification Strategies:**
- **Local Rule-Based:** Pattern matching for common intents
- **LLM-Based:** Sophisticated intent detection with confidence scoring
- **Hybrid Approach:** Combines local and LLM results with weighted scoring

### Built-in Tool Prompts

**File System Operations:**
- **Read File:** [`prompts/read-file.md`](prompts/read-file.md) - Read single files with optional line ranges
- **Read Multiple Files:** [`prompts/read-multiple-files.md`](prompts/read-multiple-files.md) - Batch file reading operations
- **Write File:** [`prompts/fs-write.md`](prompts/fs-write.md) - Create or overwrite files
- **Append File:** [`prompts/fs-append.md`](prompts/fs-append.md) - Add content to existing files
- **String Replace:** [`prompts/str-replace.md`](prompts/str-replace.md) - Replace text in files with exact matching
- **Delete File:** [`prompts/delete-file.md`](prompts/delete-file.md) - Delete files with safety checks

**Search and Discovery:**
- **Grep Search:** [`prompts/grep-search.md`](prompts/grep-search.md) - Fast regex-based text search with ripgrep
- **File Search:** [`prompts/file-search.md`](prompts/file-search.md) - Fuzzy file path matching
- **List Directory:** [`prompts/list-directory.md`](prompts/list-directory.md) - Directory contents with recursive options

**System Operations:**
- **Execute Bash:** [`prompts/execute-bash.md`](prompts/execute-bash.md) - Shell command execution with safety rules

### MCP (Model Context Protocol) Prompt Integration

**Protocol-Level Prompts:**
- System prompt configuration through MCP servers
- Template argument handling and injection
- Provider-specific prompt customization
- Context injection from external MCP servers

**Dynamic Template Loading:**
- External prompt templates via MCP
- Runtime template compilation
- Context-aware template selection
- Error handling for template failures

### Advanced Prompt Engineering Techniques

**Hierarchical Prompt Structure:**
1. **Base System Prompt** - Core identity and capabilities
2. **Model-Specific Formatting** - Provider optimization layer
3. **Context Injection** - Dynamic environment data
4. **Task-Specific Prompts** - Workflow-oriented instructions
5. **Tool Integration** - Action-specific prompting

**Context Management:**
- **History Pruning:** Intelligent conversation history management
- **Token Counting:** Accurate token usage tracking per model
- **Message Compilation:** Role-based message formatting
- **Context Preservation:** Prefix/suffix preservation in code edits

**Error Handling & Fallbacks:**
- **Template Detection Failures:** Graceful fallback to generic templates
- **Unknown Model Handling:** Default template assignment
- **Context Injection Failures:** Safe degradation without context
- **Prompt Rendering Errors:** Error recovery and user notification

### Handlebars Template System

**Template Utilities:**
- `renderTemplatedString()` - Handlebars compilation and rendering
- `renderPromptTemplate()` - Context-aware template processing
- Helper function registration for complex operations
- Promise resolution for async template data

**Template Features:**
- Variable interpolation with `{{variable}}` syntax
- Conditional rendering with `{{#if condition}}`
- Loop handling with `{{#each items}}`
- File path replacement and context provider integration
- Custom helper functions for development tasks

## Tool System

### Built-in System Tools

**File System Operations:**
- `ToolReadFile` - Read single files
- `ToolReadMultipleFiles` - Batch file reading
- `ToolFsWrite` - Write to files
- `ToolFsAppend` - Append to files
- `DeleteFileTool` - Delete files

**Development Tools:**
- `ToolExecuteBash` - Execute shell commands
- `ToolListDirectory` - Directory listing
- `ToolFileSearch` - Find files
- `ToolGrepSearch` - Text pattern search
- `ToolStrReplace` - String replacement

### MCP (Model Context Protocol) Integration

**External Tool Discovery:**
- Dynamic tool discovery through MCP servers
- `ToolMCPWrapper` for external tool execution
- Server lifecycle management
- Auto-approval settings for trusted tools

**Configuration:**
- MCP server definitions in `.kiro/settings/mcp.json`
- Environment variable support
- Command-line argument handling
- Disabled server management

## User Interface

### Webview Architecture

**Framework Stack:**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- VS Code Webview API for communication

**Main Components:**
- **Chat Interface** - Primary AI interaction
- **Spec Explorer** - Specification management
- **Hook Editor** - Automation configuration
- **Steering Explorer** - Agent guidance system

### Custom Editors

**Specialized Editors:**
- Chat context viewer (`.chat` files)
- Test specification editor
- Hook configuration editor
- Steering document editor

### Theme System

**Built-in Themes:**
- 8 pre-configured themes (dark/light variants)
- Tailwind CSS configuration
- Custom VS Code theme integration
- Responsive design support

## Specification System

### Workflow Management

**Spec Generation Process:**
1. **Requirements Clarification** - Natural language requirement gathering
2. **Design Document Creation** - Technical specification generation
3. **Implementation Planning** - Task breakdown and planning
4. **Task Execution** - Step-by-step implementation

**File Organization:**
- `.kiro/specs/` - Specification documents
- `.kiro/steering/` - Agent guidance documents
- `.hooks/` - Automation hook definitions

### Hook System

**Hook Types:**
- `FileEditedHook` - File modification triggers
- `FileCreatedHook` - File creation triggers
- `FileDeletedHook` - File deletion triggers
- `UserTriggeredHook` - Manual triggers
- `AlertHook` - Notification system
- `AskAgentHook` - Automated agent queries

**Configuration Schema:**
```json
{
  "hooks": [{
    "type": "FileEditedHook",
    "filePattern": "*.js",
    "action": {
      "type": "AskAgentHook",
      "message": "Review this JavaScript file for potential issues"
    }
  }]
}
```

## Configuration System

### Extension Settings

**Core Configuration:**
- `kiroAgent.enableDevMode` - Development mode features
- `kiroAgent.trustedCommands` - Auto-approved shell commands
- `kiroAgent.autoApproveAgentCommands` - Auto-approved agent actions
- `kiroAgent.configureMCP` - MCP server configuration

### MCP Server Configuration

**Location:** `.kiro/settings/mcp.json`
```json
{
  "mcpServers": {
    "serverName": {
      "command": "node",
      "args": ["server.js"],
      "env": {"API_KEY": "value"},
      "disabled": false,
      "autoApprove": ["tool1", "tool2"]
    }
  }
}
```

### Environment-Specific Settings

**Development vs Production:**
- `NODE_ENV` environment detection
- CI/CD pipeline integration
- Debug logging configuration
- Performance optimization settings

## Security & Authentication

### Authentication System

**Multi-Provider Support:**
- OAuth 2.0 with PKCE flow
- Social authentication (Google, GitHub)
- SSO and OIDC integration
- JWT token management

**Token Management:**
- Secure token storage in `~/.aws/sso/cache/`
- Automatic token refresh
- Session lifecycle management
- Cryptographic validation (SHA-256, PKCE)

### Security Features

**Input Validation:**
- Zod schema validation for all inputs
- XSS prevention with HTML encoding
- CSRF protection with XSRF tokens
- PII detection and masking

**Data Protection:**
- End-to-end encryption for sensitive data
- Certificate validation and TLS enforcement
- Privacy-first design with local processing
- Secure communication protocols

**Access Control:**
- Role-based authentication
- Permission validation
- Trusted command whitelisting
- Sandbox execution for shell commands

## Bundled Resources

### Local AI Models

**Embedding Model:**
- `all-MiniLM-L6-v2` sentence transformer
- ONNX quantized model for efficiency
- Local codebase embeddings
- Privacy-preserving semantic search

### Language Support

**Tree-sitter Parsers:**
- 27 language parsers including JavaScript, TypeScript, Python, Rust, Go, Java, C++
- Code snippet extraction queries
- Import statement detection
- Function/method definition parsing

**Tokenizers:**
- Llama tokenizer with worker pool
- Tiktoken for OpenAI models
- Multi-threaded tokenization
- Accurate token counting

### Assets & Icons

**Icon System:**
- 495+ SVG icons for comprehensive UI coverage
- Development tool icons
- File type indicators
- Custom Kiro branding

## Development Workflow

### Build System

**Bundling Strategy:**
- ESBuild for main extension bundle
- Selective external dependencies
- Native binary preservation
- Platform-specific optimizations

**Build Commands:**
```bash
npm run compile     # Build all components
npm run package     # Compile code only
npm run release     # Full build with packaging
npm run analyze-externals  # Update dependencies
```

### Testing Framework

**Test Configuration:**
- Mocha framework with XML reporting
- Chai assertions and Sinon mocks
- Test discovery in `__tests__` directories
- VS Code extension testing support

## Extension Activation

### Activation Events

**File System Support:**
- Custom schemes: `kiro-diff`, `kiro-meta`, `kiro-spec`
- Language detection: JavaScript, TypeScript variants
- Webview activation: onboarding, GUI, hooks

**Command Activation:**
- Startup commands and configuration
- Execution triggers and event handlers
- Language server integration

### Key Bindings

**Essential Shortcuts:**
- `Cmd+L` - Focus chat input
- `Cmd+I` - Start inline chat
- `Shift+Cmd+Enter` - Accept changes
- `Shift+Cmd+Backspace` - Reject changes
- `Cmd+K Cmd+A` - Toggle tab autocomplete

## Advanced Features

### VS Code API Integration

**Experimental APIs:**
- 21 experimental VS Code APIs
- Chat participants and diff commands
- Terminal integration and file search
- Semantic tokens and inline actions

**Custom Providers:**
- File system providers for custom schemes
- Language servers for syntax highlighting
- Webview providers for rich UI
- Authentication providers for secure access

### Performance Optimizations

**Efficient Processing:**
- Streaming AI responses
- Incremental parsing and analysis
- Lazy loading of heavy components
- Worker-based tokenization

**Memory Management:**
- Context pruning for large conversations
- Efficient bundling strategy
- Resource cleanup and disposal
- Optimized asset loading

## Extensibility

### Plugin Architecture

**MCP Integration:**
- External tool discovery
- Server lifecycle management
- Protocol-level communication
- Custom tool development

**Hook System:**
- Event-driven automation
- Custom trigger conditions
- Flexible action definitions
- Workspace-specific configuration

### API Surface

**Extension Points:**
- Custom tool definitions
- Prompt template customization
- Authentication provider integration
- UI component extensions

## Troubleshooting

### Common Issues

**Configuration Problems:**
- Check `.kiro/settings/mcp.json` for MCP server issues
- Verify authentication tokens in `~/.aws/sso/cache/`
- Review extension logs for error details

**Performance Issues:**
- Disable unnecessary MCP servers
- Reduce context window size for large files
- Enable development mode for detailed logging

### Debug Tools

**Logging System:**
- Extension output channel
- LLM request/response logging
- MCP server communication logs
- Performance metrics tracking

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run compile`
4. Launch VS Code with the extension: `F5`

### Adding External Dependencies

1. Add package to `UNBUNDLEABLE_PACKAGES` in `scripts/analyze-externals.mjs`
2. Categorize appropriately (native binaries, runtime dependencies, etc.)
3. Run `npm run analyze-externals` to update configuration

### Security Guidelines

- Never commit secrets or API keys
- Use proper input validation for all user inputs
- Follow VS Code security best practices
- Report security issues through proper channels

## License

This project is licensed under the Apache-2.0 License.

## Support

For issues and questions:
- GitHub Issues: [kiro-team/kiro-extension](https://github.com/kiro-team/kiro-extension)
- Security Issues: See [CONTRIBUTING.md](https://github.com/kiro-team/kiro-extension/blob/main/CONTRIBUTING.md#security-issue-notifications)

---

*This extension represents a comprehensive AI-powered development environment that combines the power of large language models with sophisticated tooling and workflow management to create a next-generation coding experience.*
