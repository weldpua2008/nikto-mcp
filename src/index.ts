import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
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
  private server: McpServer;
  private niktoService: NiktoService;

  constructor() {
    this.server = new McpServer({
      name: 'nikto-mcp',
      version: config.version,
    });

    this.niktoService = new NiktoService();
    this.setupTools();
    this.setupResources();
  }

  private setupTools(): void {
    // Register the scan tool
    this.server.registerTool(
      'scan',
      {
        title: 'Nikto Scan',
        description: 'Run a Nikto scan against a target',
        inputSchema: {
          target: z.string().describe('Target URL or IP address to scan'),
          port: z.number().int().min(1).max(65535).optional().default(80).describe('Port number (default: 80)'),
          ssl: z.boolean().optional().default(false).describe('Use SSL/HTTPS (default: false)'),
          nossl: z.boolean().optional().default(false).describe('Disable SSL (default: false)'),
          nolookup: z.boolean().optional().default(false).describe('Disable DNS lookups (default: false)'),
          timeout: z.number().positive().optional().default(3600).describe('Scan timeout in seconds (default: 3600)'),
          vhost: z.string().optional().describe('Virtual host for the Host header'),
          outputFormat: z.enum(['json', 'text']).optional().default('json').describe('Output format (default: json)'),
          dryRun: z.boolean().optional().default(false).describe('Test command generation without execution (default: false)'),
        },
      },
      async (args) => {
        try {
          const options = validateScanOptions(args);
          const result = await this.niktoService.startScan(options);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          logger.error('Scan tool execution error:', error);
          throw error;
        }
      }
    );

    // Register the scan_status tool
    this.server.registerTool(
      'scan_status',
      {
        title: 'Scan Status',
        description: 'Get the status of a running scan',
        inputSchema: {
          scanId: z.string().describe('ID of the scan to check'),
        },
      },
      async ({ scanId }) => {
        try {
          const status = this.niktoService.getScanStatus(scanId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(status, null, 2),
              },
            ],
          };
        } catch (error) {
          logger.error('Scan status tool execution error:', error);
          throw error;
        }
      }
    );

    // Register the stop_scan tool
    this.server.registerTool(
      'stop_scan',
      {
        title: 'Stop Scan',
        description: 'Stop a running scan',
        inputSchema: {
          scanId: z.string().describe('ID of the scan to stop'),
        },
      },
      async ({ scanId }) => {
        try {
          await this.niktoService.stopScan(scanId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ success: true, scanId }, null, 2),
              },
            ],
          };
        } catch (error) {
          logger.error('Stop scan tool execution error:', error);
          throw error;
        }
      }
    );
  }

  private setupResources(): void {
    // Register the scans resource
    this.server.registerResource(
      'scans',
      'nikto://scans',
      {
        title: 'Active Scans',
        description: 'List of currently active Nikto scans',
      },
      async () => ({
        contents: [
          {
            uri: 'nikto://scans',
            mimeType: 'application/json',
            text: JSON.stringify(this.niktoService.getActiveScans(), null, 2),
          },
        ],
      })
    );

    // Register the config resource
    this.server.registerResource(
      'config',
      'nikto://config',
      {
        title: 'Nikto Configuration',
        description: 'Current Nikto MCP server configuration',
      },
      async () => ({
        contents: [
          {
            uri: 'nikto://config',
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                version: config.version,
                niktoBinary: config.niktoBinary,
                maxConcurrentScans: config.maxConcurrentScans,
                defaultTimeout: config.defaultTimeout,
              },
              null,
              2
            ),
          },
        ],
      })
    );
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
