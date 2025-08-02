#!/usr/bin/env node

/**
 * Simple JavaScript MCP Client Example
 * 
 * This example demonstrates how to connect to the Nikto MCP server using
 * raw JSON-RPC over stdio. It's a simpler alternative to the TypeScript
 * version that avoids SDK complexity.
 * 
 * Prerequisites:
 * - The nikto-mcp server must be built (npm run build)
 * - Node.js 20+
 * 
 * Usage:
 *   node examples/simple-mcp-client.js
 */

const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

class SimpleMCPClient {
  constructor() {
    this.serverProcess = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  /**
   * Connect to the Nikto MCP server
   */
  async connect() {
    console.log('🔌 Connecting to Nikto MCP server...');
    
    return new Promise((resolve, reject) => {
      // Spawn the nikto-mcp server process
      this.serverProcess = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'inherit'],
        cwd: process.cwd(),
      });

      // Handle server process errors
      this.serverProcess.on('error', (error) => {
        console.error('❌ Server process error:', error);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        console.log(`🔄 Server process exited with code ${code}`);
      });

      // Set up message handling
      let buffer = '';
      this.serverProcess.stdout.on('data', (data) => {
        buffer += data.toString();
        
        // Process complete JSON-RPC messages
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line) {
            try {
              const message = JSON.parse(line);
              this.handleMessage(message);
            } catch (error) {
              console.error('❌ Failed to parse JSON:', error, 'Line:', line);
            }
          }
        }
      });

      // Send initialization request
      this.sendInitialize()
        .then(() => {
          console.log('✅ Connected to Nikto MCP server');
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Send initialization request
   */
  async sendInitialize() {
    const response = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'simple-mcp-client',
        version: '1.0.0'
      }
    });
    
    // Send initialized notification
    this.sendNotification('notifications/initialized');
    
    return response;
  }

  /**
   * Send a JSON-RPC request
   */
  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      
      const request = {
        jsonrpc: '2.0',
        id: id,
        method: method,
        params: params
      };

      // Store the promise resolvers
      this.pendingRequests.set(id, { resolve, reject });

      // Send the request
      const message = JSON.stringify(request) + '\n';
      this.serverProcess.stdin.write(message);
      
      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${id} (${method}) timed out`));
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Send a JSON-RPC notification
   */
  sendNotification(method, params = {}) {
    const notification = {
      jsonrpc: '2.0',
      method: method,
      params: params
    };

    const message = JSON.stringify(notification) + '\n';
    this.serverProcess.stdin.write(message);
  }

  /**
   * Handle incoming messages
   */
  handleMessage(message) {
    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      // This is a response to one of our requests
      const { resolve, reject } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(`RPC Error: ${message.error.message} (${message.error.code})`));
      } else {
        resolve(message.result);
      }
    } else if (message.method) {
      // This is a notification from the server
      console.log('📨 Server notification:', message.method, message.params);
    }
  }

  /**
   * List all available tools
   */
  async listTools() {
    console.log('📋 Requesting list of available tools...');
    
    try {
      const response = await this.sendRequest('tools/list');
      const tools = response.tools || [];
      
      console.log(`✅ Found ${tools.length} available tools:`);
      
      tools.forEach((tool, index) => {
        console.log(`\n${index + 1}. ${tool.name}`);
        console.log(`   Description: ${tool.description}`);
        console.log(`   Input Schema: ${JSON.stringify(tool.inputSchema, null, 4)}`);
      });

      return tools;
    } catch (error) {
      console.error('❌ Failed to list tools:', error);
      throw error;
    }
  }

  /**
   * List all available resources
   */
  async listResources() {
    console.log('\n📋 Requesting list of available resources...');
    
    try {
      const response = await this.sendRequest('resources/list');
      const resources = response.resources || [];
      
      console.log(`✅ Found ${resources.length} available resources:`);
      
      resources.forEach((resource, index) => {
        console.log(`\n${index + 1}. ${resource.name}`);
        console.log(`   URI: ${resource.uri}`);
        console.log(`   Description: ${resource.description}`);
        console.log(`   MIME Type: ${resource.mimeType}`);
      });

      return resources;
    } catch (error) {
      console.error('❌ Failed to list resources:', error);
      throw error;
    }
  }

  /**
   * Read a specific resource
   */
  async readResource(uri) {
    console.log(`\n📖 Reading resource: ${uri}`);
    
    try {
      const response = await this.sendRequest('resources/read', { uri });
      
      console.log(`✅ Resource content:`);
      console.log(JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error(`❌ Failed to read resource ${uri}:`, error);
      throw error;
    }
  }

  /**
   * Call a tool
   */
  async callTool(name, args) {
    console.log(`\n🔧 Calling tool: ${name}`);
    console.log(`   Arguments: ${JSON.stringify(args, null, 2)}`);
    
    try {
      const response = await this.sendRequest('tools/call', {
        name: name,
        arguments: args
      });

      console.log(`✅ Tool response:`);
      console.log(JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error(`❌ Failed to call tool ${name}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from the server
   */
  async disconnect() {
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
      console.log('❌ Disconnected from server');
    }
  }
}

/**
 * Main demonstration function
 */
async function main() {
  const client = new SimpleMCPClient();

  try {
    // Connect to server
    await client.connect();

    // Give the server a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // List available tools
    const tools = await client.listTools();

    // List available resources
    const resources = await client.listResources();

    // Read the configuration resource
    if (resources.length > 0) {
      const configResource = resources.find(r => r.uri === 'nikto://config');
      if (configResource) {
        await client.readResource(configResource.uri);
      }
    }

    // Example tool call (dry run to avoid actual scanning)
    if (tools.length > 0) {
      const scanTool = tools.find(t => t.name === 'scan');
      if (scanTool) {
        console.log('\n🧪 Demonstrating dry run scan...');
        await client.callTool('scan', {
          target: 'http://example.com',
          dryRun: true,
          outputFormat: 'json'
        });
      }
    }

    console.log('\n✅ Example completed successfully!');

  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  } finally {
    // Clean up
    await client.disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the example
if (require.main === module) {
  console.log('🚀 Starting Simple Nikto MCP Client Example\n');
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { SimpleMCPClient };
