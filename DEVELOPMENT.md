# Nikto MCP Development Guide

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **Nikto**: Installed and accessible in PATH
   ```bash
   # macOS
   brew install nikto
   
   # Linux
   apt-get install nikto
   
   # Or from source
   git clone https://github.com/sullo/nikto
   ```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

## Development

### Available Scripts

- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run the built server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

### Environment Variables

- `NIKTO_BINARY` - Path to Nikto executable (default: `nikto`)
- `MCP_PORT` - Port for MCP server (optional)
- `LOG_LEVEL` - Logging level: debug, info, warn, error (default: `info`)
- `SCAN_TIMEOUT` - Maximum scan duration in seconds (default: `3600`)
- `MAX_CONCURRENT_SCANS` - Maximum concurrent scans (default: `3`)

### Testing

The project uses Jest for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Using with Claude Desktop

To use this MCP server with Claude Desktop, add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "nikto": {
      "command": "node",
      "args": ["/path/to/nikto-mcp/dist/index.js"],
      "env": {
        "NIKTO_BINARY": "/usr/local/bin/nikto"
      }
    }
  }
}
```

## Architecture

### Directory Structure

```
nikto-mcp/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── config/            # Configuration management
│   ├── services/          # Business logic
│   │   └── nikto.service.ts
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── validators/        # Input validation
├── tests/                 # Test files
├── dist/                  # Compiled output
└── memory-bank/           # Project documentation
```

### Key Components

1. **MCP Server** (`src/index.ts`): Handles MCP protocol communication
2. **Nikto Service** (`src/services/nikto.service.ts`): Manages Nikto process execution
3. **Validators** (`src/validators/`): Input sanitization and validation
4. **Types** (`src/types/`): TypeScript interfaces and types

## Security Considerations

- All user inputs are sanitized before passing to shell commands
- Nikto processes run with timeouts to prevent resource exhaustion
- Concurrent scan limits prevent DoS
- Process cleanup on server shutdown

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Troubleshooting

### Common Issues

1. **"Nikto not found"**: Ensure Nikto is installed and in PATH, or set `NIKTO_BINARY` environment variable
2. **TypeScript errors**: Run `npm install` to install dependencies
3. **Build errors**: Ensure you're using Node.js 18+
