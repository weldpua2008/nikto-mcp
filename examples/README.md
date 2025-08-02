# Nikto MCP Examples

This directory contains examples demonstrating how to interact with the Nikto MCP server.

## Available Examples

### 1. scan-demo.js
A JavaScript demonstration script showing various scan configurations and their expected command outputs. This example helps understand the different options available for the Nikto scanner.

**Usage:**
```bash
node examples/scan-demo.js
```

### 2. simple-mcp-client.js
A simple JavaScript MCP client that demonstrates how to connect to the Nikto MCP server using raw JSON-RPC over stdio. This is the recommended example as it avoids TypeScript SDK complexity.

**Prerequisites:**
- Build the project: `npm run build`
- Node.js 20+

**Usage:**
```bash
# Run the simple JavaScript example (recommended)
node examples/simple-mcp-client.js
```

### 3. mcp-client.ts
A TypeScript MCP client example that demonstrates how to connect to the Nikto MCP server and interact with its tools and resources. Note: This example has some TypeScript compilation issues with the current MCP SDK version.

**Prerequisites:**
- Build the project: `npm run build`
- Install tsx: `npm install -g tsx` or use `npx tsx`

**Usage:**
```bash
# Run the TypeScript example
npx tsx examples/mcp-client.ts
```

## MCP Client Example Features

The TypeScript MCP client example demonstrates:

1. **Server Connection**: How to spawn and connect to the Nikto MCP server
2. **Tool Discovery**: Listing all available tools from the server
3. **Resource Access**: Accessing server resources like configuration and active scans
4. **Tool Invocation**: Calling tools with parameters (using dry run for safety)

### Example Output

When you run the MCP client example, you'll see:

```
🚀 Starting Nikto MCP Client Example

🔌 Connecting to Nikto MCP server...
✅ Connected to Nikto MCP server
📋 Requesting list of available tools...
✅ Found 3 available tools:

1. scan
   Description: Run a Nikto scan against a target
   Input Schema: {
       "type": "object",
       "properties": {
           "target": {
               "type": "string",
               "description": "Target URL or IP address to scan"
           },
           ...
       }
   }

2. scan_status
   Description: Get the status of a running scan
   ...

3. stop_scan
   Description: Stop a running scan
   ...

📋 Requesting list of available resources...
✅ Found 2 available resources:

1. Active Scans
   URI: nikto://scans
   Description: List of currently active Nikto scans
   MIME Type: application/json

2. Nikto Configuration
   URI: nikto://config
   Description: Current Nikto MCP server configuration
   MIME Type: application/json

🧪 Demonstrating dry run scan...
✅ Tool response: {
  "content": [
    {
      "type": "text",
      "text": "{\n  \"scanId\": \"...\",\n  \"status\": \"completed\",\n  \"target\": \"http://example.com\",\n  ...\n}"
    }
  ]
}

✅ Example completed successfully!
```

## Building Your Own MCP Client

The `mcp-client.ts` example provides a solid foundation for building your own MCP client. Key components include:

### 1. Client Setup
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: 'your-client-name',
  version: '1.0.0',
}, {
  capabilities: {},
});
```

### 2. Server Connection
```typescript
// Spawn the server process
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

// Create transport
const transport = new StdioClientTransport({
  reader: serverProcess.stdout!,
  writer: serverProcess.stdin!,
});

// Connect
await client.connect(transport);
```

### 3. Making Requests
```typescript
// List tools
const toolsResponse = await client.request({
  method: 'tools/list',
  params: {}
});

// Call a tool
const scanResponse = await client.request({
  method: 'tools/call',
  params: {
    name: 'scan',
    arguments: {
      target: 'http://example.com',
      dryRun: true
    }
  }
});
```

## Error Handling

The examples include comprehensive error handling:

- Process spawn errors
- Connection failures
- Request/response errors
- Graceful shutdown on signals

## Development Tips

1. **Use Dry Run**: Always use `dryRun: true` when testing to avoid actual network scans
2. **Check Server Status**: Ensure the server process starts successfully before making requests
3. **Handle Cleanup**: Always disconnect and kill server processes when done
4. **Type Safety**: Use TypeScript interfaces for better type checking and IDE support

## Troubleshooting

### Common Issues

1. **Server not starting**: Ensure `npm run build` was successful
2. **Connection timeout**: Give the server time to initialize (1000ms delay recommended)
3. **Process hanging**: Ensure proper cleanup in error handlers and signal handlers
4. **TypeScript errors**: The current MCP SDK types may have some compatibility issues; the examples use type assertions where needed

### Debug Mode

To see more detailed output, set the log level:
```bash
LOG_LEVEL=debug npx tsx examples/mcp-client.ts
