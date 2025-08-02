#!/usr/bin/env tsx

/**
 * Minimal TypeScript MCP Client Example
 * 
 * This example demonstrates how to connect to the Nikto MCP server and
 * retrieve the list of available tools. It serves as a starting point
 * for building more complex MCP client integrations.
 * 
 * Prerequisites:
 * - The nikto-mcp server must be built (npm run build)
 * - Node.js 20+ and tsx must be installed
 * 
 * Usage:
 *   npx tsx examples/mcp-client.ts
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

class NiktoMCPClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;
  private serverProcess: ChildProcess | null = null;

  constructor() {
    this.client = new Client(
      {
        name: 'nikto-mcp-client-example',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  /**
   * Connect to the Nikto MCP server
   */
  async connect(): Promise<void> {
    console.log('🔌 Connecting to Nikto MCP server...');
    
    // Spawn the nikto-mcp server process
    this.serverProcess = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: process.cwd(),
    });

    // Handle server process errors
    this.serverProcess.on('error', (error) => {
      console.error('❌ Server process error:', error);
      throw error;
    });

    this.serverProcess.on('exit', (code) => {
      console.log(`🔄 Server process exited with code ${code}`);
    });

    // Create transport using the server process stdio
    this.transport = new StdioClientTransport({
      reader: this.serverProcess.stdout!,
      writer: this.serverProcess.stdin!,
    });

    // Connect the client
    await this.client.connect(this.transport);
    console.log('✅ Connected to Nikto MCP server');
  }

  /**
   * Disconnect from the server
   */
  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.client.close();
      console.log('❌ Disconnected from server');
    }
    
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
    }
  }

  /**
   * List all available tools from the server
   */
  async listTools(): Promise<Tool[]> {
    console.log('📋 Requesting list of available tools...');
    
    try {
      const response = await this.client.request(
        {
          method: 'tools/list',
          params: {}
        },
        { method: 'tools/list', params: {} }
      );

      const tools = (response as any).tools as Tool[];
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
   * List all available resources from the server
   */
  async listResources(): Promise<Resource[]> {
    console.log('\n📋 Requesting list of available resources...');
    
    try {
      const response = await this.client.request(
        {
          method: 'resources/list',
          params: {}
        },
        { method: 'resources/list', params: {} }
      );

      const resources = (response as any).resources as Resource[];
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
   * Read a specific resource from the server
   */
  async readResource(uri: string): Promise<any> {
    console.log(`\n📖 Reading resource: ${uri}`);
    
    try {
      const response = await this.client.request(
        {
          method: 'resources/read',
          params: { uri }
        },
        { method: 'resources/read', params: { uri } }
      );

      console.log(`✅ Resource content:`);
      console.log(JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error(`❌ Failed to read resource ${uri}:`, error);
      throw error;
    }
  }

  /**
   * Call a tool with the given arguments
   */
  async callTool(name: string, args: Record<string, any>): Promise<any> {
    console.log(`\n🔧 Calling tool: ${name}`);
    console.log(`   Arguments: ${JSON.stringify(args, null, 2)}`);
    
    try {
      const response = await this.client.request(
        {
          method: 'tools/call',
          params: { 
            name,
            arguments: args
          }
        },
        { 
          method: 'tools/call', 
          params: { 
            name,
            arguments: args
          }
        }
      );

      console.log(`✅ Tool response:`);
      console.log(JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error(`❌ Failed to call tool ${name}:`, error);
      throw error;
    }
  }
}

/**
 * Main demonstration function
 */
async function main(): Promise<void> {
  const client = new NiktoMCPClient();

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
  console.log('🚀 Starting Nikto MCP Client Example\n');
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { NiktoMCPClient };
