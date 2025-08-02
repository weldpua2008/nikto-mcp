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

// Handle command line arguments
function handleCommandLineArgs(): boolean {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Nikto MCP Server v${config.version}

DESCRIPTION:
  A secure MCP (Model Context Protocol) server that enables AI agents to interact
  with Nikto web server scanner for vulnerability assessment.

USAGE:
  nikto-mcp [OPTIONS]

OPTIONS:
  -h, --help     Show this help message and exit
  --version      Show version information and exit

MCP SERVER MODE:
  When run without arguments, starts as an MCP server listening on stdin for
  JSON-RPC messages from MCP clients (like Claude Desktop or other AI agents).

AVAILABLE MCP TOOLS:
  scan           Run a Nikto scan against a target
  scan_status    Get the status of a running scan  
  stop_scan      Stop a running scan

AVAILABLE MCP RESOURCES:
  nikto://scans  List of currently active Nikto scans
  nikto://config Current Nikto MCP server configuration

EXAMPLES:
  # Start MCP server (for use with AI agents)
  nikto-mcp

  # Show help
  nikto-mcp --help

  # Show version
  nikto-mcp --version

  # Run with Docker
  docker run -i nikto-mcp:latest

  # Run with Docker and custom Nikto binary path
  docker run -i -e NIKTO_BINARY=/usr/local/bin/nikto nikto-mcp:latest

CONFIGURATION:
  ### Environment Variables

  - NIKTO_MODE - Execution mode: local or docker (default: local)
  - NIKTO_BINARY - Path to Nikto executable for local mode (default: nikto)
  - NIKTO_DOCKER_IMAGE - Docker image to use (default: ghcr.io/sullo/nikto:latest)
  - NIKTO_DOCKER_NETWORK - Docker network mode (default: host)
  - MCP_PORT - Port for MCP server (optional)
  - LOG_LEVEL - Logging level: debug, info, warn, error (default: info)
  - SCAN_TIMEOUT - Maximum scan duration in seconds (default: 3600)
  - MAX_CONCURRENT_SCANS - Maximum concurrent scans (default: 3)
  - MCP_STDOUT_LOGS - Set to 'allow' for development debugging
  - TMPDIR - Temporary directory for scan outputs (default: /tmp)

For more information, visit: https://github.com/weldpua2008/nikto-mcp
`);
    return true;
  }

  if (args.includes('--version')) {
    console.log(`nikto-mcp v${config.version}`);
    return true;
  }

  return false;
}

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

// Handle command line arguments first
if (handleCommandLineArgs()) {
  // Help or version was shown, exit cleanly
  process.exit(0);
}

// Start the server
const server = new NiktoMCPServer();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
