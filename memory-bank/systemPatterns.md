# Nikto MCP System Patterns

## Architecture Overview

### Layered Architecture
```
┌─────────────────────────────────────┐
│         MCP Client (AI Agent)       │
├─────────────────────────────────────┤
│          MCP Protocol Layer         │
├─────────────────────────────────────┤
│         Nikto MCP Server            │
├─────────────────────────────────────┤
│     Service Layer (Business Logic)  │
├─────────────────────────────────────┤
│    Nikto Wrapper (Process Manager)  │
├─────────────────────────────────────┤
│        Nikto Binary (External)      │
└─────────────────────────────────────┘
```

## Key Design Patterns

### 1. Command Pattern
- Each Nikto operation encapsulated as a command
- Validation, execution, and result handling separated
- Enables queuing, logging, and undo capabilities

### 2. Factory Pattern
- Scanner factory creates appropriate scanner instances
- Output writer factory for different formats (JSON, CLI)
- Plugin factory for extensibility

### 3. Observer Pattern
- Real-time scan progress updates
- Event-driven architecture for async operations
- Subscribers for logging, monitoring, alerts

### 4. Strategy Pattern
- Pluggable scanning strategies
- Interchangeable output formatters
- Configurable security policies

## Component Relationships

### Core Components
```typescript
// MCP Server - Entry point
class NiktoMCPServer {
  - scanner: IScannerService
  - validator: IValidator
  - logger: ILogger
  - config: IServerConfig
}

// Scanner Service - Business logic
interface IScannerService {
  startScan(options: ScanOptions): Promise<ScanResult>
  stopScan(scanId: string): Promise<void>
  getScanStatus(scanId: string): ScanStatus
}

// Nikto Wrapper - Process management
class NiktoWrapper {
  - spawn(args: string[]): ChildProcess
  - parseOutput(data: Buffer): ParsedResult
  - sanitizeInput(input: string): string
}

// Plugin System
interface IPlugin {
  name: string
  version: string
  execute(context: PluginContext): Promise<void>
}
```

## Critical Implementation Paths

### Scan Execution Flow
1. **Request Validation**
   - Input sanitization
   - Permission checks
   - Rate limit validation

2. **Command Construction**
   - Build Nikto arguments
   - Apply security constraints
   - Set resource limits

3. **Process Execution**
   - Spawn sandboxed process
   - Stream output handling
   - Timeout management

4. **Result Processing**
   - Parse Nikto output
   - Transform to requested format
   - Store results if needed

### Security Flow
1. **Input Layer**
   - Whitelist allowed parameters
   - Escape special characters
   - Validate URLs/IPs

2. **Execution Layer**
   - Sandbox process execution
   - Resource limits (CPU, memory)
   - Network restrictions

3. **Output Layer**
   - Sanitize results
   - Remove sensitive data
   - Audit logging

## Extension Points

### Plugin Hooks
- `preScan`: Modify scan parameters
- `postScan`: Process results
- `onError`: Custom error handling
- `onProgress`: Progress monitoring

### Custom Scanners
- Implement `IScanner` interface
- Register with scanner factory
- Support for third-party tools

### Output Writers
- Implement `IOutputWriter` interface
- Support custom formats
- Streaming capabilities for large outputs
