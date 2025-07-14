# Nikto MCP Active Context

## Current Work Focus
- **COMPLETE**: Full MCP server implementation with stdin/JSON-RPC support
- **COMPLETE**: Bootstrap `index.js` with compiled/TypeScript fallback
- **COMPLETE**: Core MCP functionality with enhanced scan tool
- **COMPLETE**: Comprehensive test suite implemented and passing
- **COMPLETE**: Extended Nikto options support (nolookup, nossl, ssl, port, timeout, vhost)
- **COMPLETE**: MCP Inspector compatibility verified and fixed
- **COMPLETE**: MCP communication protocol issues resolved
- **COMPLETE**: Docker mode JSON output fix implemented and verified

## Recent Changes
- **CRITICAL FIX**: Fixed Docker mode JSON output issue that was causing "Output file format specified without a name" error
- **ROOT CAUSE**: Nikto requires `-output` parameter when using `-Format json` but docker mode wasn't providing it
- **SOLUTION**: Implemented volume mounting with proper file handling for JSON output in docker mode
- **IMPLEMENTATION**: Added shell command chaining for docker JSON output with file cleanup
- **VERIFIED**: Docker mode now properly handles JSON output format with volume mounting
- **CONCURRENCY FIX**: Fixed filename collision by generating `/tmp/nikto-scan-<scanId>.json` (docker) and `/tmp/nikto-output-<scanId>.json` (local). Removed post-hoc arg substitution for cleaner, safer concurrent scan handling.
- **CRITICAL FIX**: Resolved MCP JSON-RPC communication issues by redirecting Winston logger to stderr
- **ROOT CAUSE**: Winston Console transport was writing to stdout, polluting MCP JSON-RPC stream
- **SOLUTION**: Changed from Console transport to Stream transport targeting process.stderr
- **VERIFIED**: MCP Inspector now works correctly with proper ping, scan validation, and error responses
- **CRITICAL**: Created root-level `index.js` for stdin MCP server execution
- **CRITICAL**: Fixed SDK import paths to use `.js` extensions for export map compatibility
- **CRITICAL**: Added `tslib` production dependency for compiled TypeScript helpers
- **VERIFIED**: Both compiled (`dist/index.js`) and TypeScript fallback (`tsx`/`ts-node`) execution paths work
- Enhanced scan tool with additional Nikto CLI options
- Added dry-run mode for command testing
- Implemented comprehensive input validation with conflict checks
- Created extensive unit test coverage (validators, service logic)
- Added examples/scan-demo.js for demonstration
- Updated README.md with detailed parameter documentation
- All tests passing with good coverage

## Next Steps
1. **Documentation Enhancement** (COMPLETE)
   - [x] Updated memory bank with latest achievements
   - [x] Enhanced README.md with deployment and MCP configuration
   - [x] Enhanced DEVELOPMENT.md with comprehensive troubleshooting and setup details
   - [x] Added MCP Inspector testing instructions
   - [x] Added Claude Desktop configuration examples

2. **Future Optional Enhancements**
   - Consider adding more Nikto output format options
   - Implement scan result persistence  
   - Create integration tests with actual Nikto execution
   - Add plugin system for custom scan modules
   - Add security best practices document

## Active Decisions
- Using TypeScript strict mode for maximum type safety
- Jest for testing framework (comprehensive ecosystem)
- Modular architecture to support future plugins
- MCP SDK as the protocol implementation

## Important Patterns and Preferences
- Interfaces over concrete types for extensibility
- Async/await over callbacks for clarity
- Comprehensive error handling at boundaries
- Input validation using schema validators (Zod)

## Learnings and Insights
- **CRITICAL**: Docker mode with JSON output requires proper volume mounting and file handling
- **CRITICAL**: Nikto requires `-output` parameter when using `-Format json` in containerized environments
- **CRITICAL**: Shell command chaining is needed for docker JSON output with proper cleanup
- **CRITICAL**: Volume mounting pattern: `-v $TMPDIR:/tmp` enables file access between host/container
- **CRITICAL**: MCP protocol requires stdout to contain ONLY JSON-RPC messages
- **CRITICAL**: Any logging or console output to stdout breaks MCP communication
- **CRITICAL**: Winston logger must use stderr to avoid polluting JSON-RPC stream
- **CRITICAL**: MCP SDK import paths require `.js` extensions for deep imports due to export map
- **CRITICAL**: Bootstrap pattern enables both production (compiled) and development (TypeScript) execution
- **CRITICAL**: `tslib` is required as production dependency for compiled TypeScript helpers
- MCP protocol requires specific tool/resource definitions
- MCP Inspector provides excellent debugging/testing capabilities
- Nikto output parsing needs careful handling of different formats
- Security constraints are critical for production use
- Plugin system should be designed from the start
- Dual execution mode (compiled/TS) provides development flexibility
