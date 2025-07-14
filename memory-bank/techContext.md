# Nikto MCP Technical Context

## Technology Stack

### Core Technologies
- **Language**: TypeScript (latest stable)
- **Runtime**: Node.js (LTS version)
- **Protocol**: MCP (Model Context Protocol)
- **Testing**: Jest framework
- **Build**: TypeScript compiler (tsc)

### Dependencies
- **@modelcontextprotocol/sdk**: Official MCP SDK
- **child_process**: For spawning Nikto processes
- **Express** (optional): For REST API functionality
- **Winston**: Structured logging
- **Joi/Zod**: Input validation
- **TypeScript ESLint**: Code quality

### External Requirements
- **Nikto**: Web vulnerability scanner (binary required)
- **Git**: Version control
- **npm/yarn**: Package management

## Development Setup

### Prerequisites
```bash
# Nikto installation
git clone https://github.com/sullo/nikto
cd nikto/program
./nikto.pl -h  # Verify installation

# Node.js LTS
node --version  # Should be LTS version
npm --version   # Should be recent
```

### Environment Variables
- `NIKTO_BINARY`: Path to Nikto executable (default: searches PATH)
- `MCP_PORT`: Port for MCP server (default: 3000)
- `LOG_LEVEL`: Logging verbosity (default: info)
- `SCAN_TIMEOUT`: Maximum scan duration in seconds (default: 3600)

## Technical Constraints

### Security
- Process sandboxing required for Nikto execution
- Input sanitization for all user-provided data
- No direct filesystem access outside designated areas
- Rate limiting for scan requests

### Performance
- Concurrent scan limit to prevent resource exhaustion
- Streaming output for large scan results
- Efficient memory usage for long-running scans

### Compatibility
- Must support Nikto 2.5.0+ 
- Node.js 18+ required for native fetch API
- Cross-platform support (Linux, macOS, Windows via WSL)

## Tool Usage Patterns

### MCP Integration
- Tools exposed via MCP protocol
- Strongly typed interfaces for all operations
- Async/await patterns throughout
- Error boundaries for graceful failure handling

### Testing Strategy
- Unit tests for all business logic
- Integration tests for Nikto interaction
- Mock Nikto responses for CI/CD
- Coverage target: 80%+
