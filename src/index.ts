import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createLogger } from './utils/logger';
import { NiktoService } from './services/nikto.service';
import { validateScanOptions } from './validators/scan.validator';
import { config } from './config/index';

const logger = createLogger('MCP-Server');

class NiktoMCPServer {
  private server: Server;
  private niktoService: NiktoService;

  constructor() {
    this.server = new Server(
      {
        name: 'nikto-mcp',
        version: config.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      },
    );

    this.niktoService = new NiktoService();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'scan',
          description: 'Run a Nikto scan against a target',
          inputSchema: {
            type: 'object',
            properties: {
              target: {
                type: 'string',
                description: 'Target URL or IP address to scan',
              },
              port: {
                type: 'number',
                description: 'Port number (default: 80)',
                default: 80,
              },
              ssl: {
                type: 'boolean',
                description: 'Use SSL/HTTPS (default: false)',
                default: false,
              },
              nossl: {
                type: 'boolean',
                description: 'Disable SSL (default: false)',
                default: false,
              },
              nolookup: {
                type: 'boolean',
                description: 'Disable DNS lookups (default: false)',
                default: false,
              },
              timeout: {
                type: 'number',
                description: 'Scan timeout in seconds (default: 3600)',
                default: 3600,
              },
              vhost: {
                type: 'string',
                description: 'Virtual host for the Host header',
              },
              outputFormat: {
                type: 'string',
                enum: ['json', 'text'],
                description: 'Output format (default: json)',
                default: 'json',
              },
              dryRun: {
                type: 'boolean',
                description: 'Test command generation without execution (default: false)',
                default: false,
              },
            },
            required: ['target'],
          },
        },
        {
          name: 'scan_status',
          description: 'Get the status of a running scan',
          inputSchema: {
            type: 'object',
            properties: {
              scanId: {
                type: 'string',
                description: 'ID of the scan to check',
              },
            },
            required: ['scanId'],
          },
        },
        {
          name: 'stop_scan',
          description: 'Stop a running scan',
          inputSchema: {
            type: 'object',
            properties: {
              scanId: {
                type: 'string',
                description: 'ID of the scan to stop',
              },
            },
            required: ['scanId'],
          },
        },
      ],
    }));

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'nikto://scans',
          name: 'Active Scans',
          description: 'List of currently active Nikto scans',
          mimeType: 'application/json',
        },
        {
          uri: 'nikto://config',
          name: 'Nikto Configuration',
          description: 'Current Nikto MCP server configuration',
          mimeType: 'application/json',
        },
      ],
    }));

    // Handle resource requests
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'nikto://scans':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.niktoService.getActiveScans(), null, 2),
              },
            ],
          };

        case 'nikto://config':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    version: config.version,
                    niktoBinary: config.niktoBinary,
                    maxConcurrentScans: config.maxConcurrentScans,
                    defaultTimeout: config.defaultTimeout,
                  },
                  null,
                  2,
                ),
              },
            ],
          };

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'scan': {
            const options = validateScanOptions(args as unknown);
            const result = await this.niktoService.startScan(options);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'scan_status': {
            const { scanId } = args as { scanId: string };
            const status = this.niktoService.getScanStatus(scanId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(status, null, 2),
                },
              ],
            };
          }

          case 'stop_scan': {
            const { scanId } = args as { scanId: string };
            await this.niktoService.stopScan(scanId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ success: true, scanId }, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error('Tool execution error:', error);
        throw error instanceof McpError
          ? error
          : new McpError(
              ErrorCode.InternalError,
              error instanceof Error ? error.message : 'Unknown error',
            );
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Nikto MCP server started');
  }
}

// Start the server
const server = new NiktoMCPServer();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
