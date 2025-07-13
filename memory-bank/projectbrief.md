# Nikto MCP Server Project Brief

## Project Overview
Building a TypeScript-based MCP (Model Context Protocol) server that provides a secure, modern interface for AI agents to interact with Nikto web server scanner.

## Core Requirements

### Technical Requirements
- 100% TypeScript implementation with full type safety (no `any` types)
- Comprehensive test suite using Jest (unit + integration tests)
- Version-locked to latest official Nikto release
- Modular, extensible architecture
- Plugin system for custom scan modules
- Multiple output formats (JSON for machines, rich CLI for humans)
- Optional REST API for remote management
- Secure by default (sandboxed execution, timeouts, minimal privileges)

### Project Structure
- TypeScript source code compiled to `dist/`
- MCP server implementation following Model Context Protocol standards
- Integration with Nikto scanner (requires `nikto` binary)
- Environment variable support (`NIKTO_BINARY` for custom paths)

### Key Goals
1. Enable AI agents to perform web vulnerability scanning via Nikto
2. Provide type-safe, testable interface to Nikto functionality
3. Support extensibility through plugins and custom modules
4. Maintain compatibility with official Nikto releases
5. Ensure secure execution environment

## License
GNU General Public License v3.0 (with commercial licensing available)

## Repository
https://github.com/weldpua2008/nikto-mcp
