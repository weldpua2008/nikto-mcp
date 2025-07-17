# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Fixed issue where info-level logs were appearing as "Error output from MCP server" in MCP clients
- Info and debug logs are now suppressed by default in MCP mode to keep stdout clean for JSON-RPC protocol
- Added `MCP_STDOUT_LOGS=allow` environment variable to enable all log levels for development/debugging

### Changed
- Logger configuration now uses `warn` level by default in MCP mode (only errors and warnings go to stderr)
- In development mode (`MCP_STDOUT_LOGS=allow`), all log levels are available as before

### Technical Details
- Modified Winston logger transport configuration to prevent info/debug logs from polluting MCP JSON-RPC output
- Updated tests to reflect new logging behavior
- Documentation updated with new environment variable information
