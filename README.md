# Nikto MCP (Model Context Protocol) server in TypeScript

A secure MCP (Model Context Protocol) server that enables AI agents to interact with [Nikto web server scanner](https://github.com/sullo/nikto).
This project provides a modern, testable, and extensible interface for managing and interacting with Nikto scans, designed to mirror and stay in sync with the official Nikto.

## ✨ Key Features

- ✅ 100 % TypeScript source – fully typed, no `any`
- 🧪 Extensive test suite (unit + integration) powered by Jest
- 🔄 Version-locked to the latest official Nikto release
- ♻️ Modular, plug-and-play architecture (bring your own scanners or output writers)
- 🔌 First-class plugin system for custom scan modules
- 📊 Multiple output formats: JSON (machine-readable) and rich CLI (human-readable)
- 🌐 Optional REST API for remote scan management
- 🛡️ Secure by default: sandboxed execution, sensible timeouts, and minimal privileges

---

## 📦 Installation

```bash
git clone https://github.com/weldpua2008/nikto-mcp.git
cd nikto-mcp
npm install              # install dependencies
npm run build            # compile TypeScript → dist
```

### Prerequisites

1. **Nikto Scanner**: Install Nikto and ensure it's accessible
   ```bash
   # macOS
   brew install nikto
   
   # Ubuntu/Debian
   sudo apt-get install nikto
   
   # Or from source
   git clone https://github.com/sullo/nikto
   ```

2. **Node.js**: Version 18 or higher required

---

## 🚀 Quick Start

### Running the MCP Server

```bash
# Production mode (compiled)
node index.js

# Development mode (TypeScript)
npm run dev
```

### MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "nikto": {
      "command": "node",
      "args": ["/absolute/path/to/nikto-mcp/index.js"],
      "env": {
        "NIKTO_BINARY": "/usr/local/bin/nikto",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Claude Desktop Configuration

For Claude Desktop, edit your configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nikto": {
      "command": "node",
      "args": ["/Users/yourname/path/to/nikto-mcp/index.js"],
      "env": {
        "NIKTO_BINARY": "/opt/homebrew/bin/nikto"
      }
    }
  }
}
```

### Testing with MCP Inspector

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Test the server
npx @modelcontextprotocol/inspector node index.js
```

---

## Available Tools

### `scan` - Run Nikto Security Scan

The enhanced `scan` tool supports comprehensive Nikto command-line options for flexible web security scanning.

#### Basic Usage
```json
{
  "target": "https://example.com"
}
```

#### Advanced Options
```json
{
  "target": "https://example.com",
  "port": 8443,
  "ssl": true,
  "nolookup": true,
  "vhost": "internal.example.com",
  "timeout": 1800,
  "outputFormat": "json",
  "dryRun": false
}
```

#### Supported Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `target` | string | ✅ | - | Target URL, IP address, or hostname |
| `port` | number | ❌ | 80 | Port number (1-65535) |
| `ssl` | boolean | ❌ | false | Force SSL/HTTPS mode |
| `nossl` | boolean | ❌ | false | Disable SSL (mutually exclusive with `ssl`) |
| `nolookup` | boolean | ❌ | false | Disable DNS lookups |
| `timeout` | number | ❌ | 3600 | Request timeout in seconds |
| `vhost` | string | ❌ | - | Virtual host for Host header |
| `outputFormat` | enum | ❌ | "json" | Output format: "json" or "text" |
| `dryRun` | boolean | ❌ | false | Test command generation without execution |

#### Example Commands Generated
- Basic: `nikto -h https://example.com -timeout 3600 -nointeractive`
- Advanced: `nikto -h example.com -p 8443 -ssl -nolookup -vhost internal.example.com -timeout 1800 -Format json -nointeractive`

### `scan_status` - Check Scan Status

Get the current status and results of a running scan.

```json
{
  "scanId": "uuid-of-scan"
}
```

### `stop_scan` - Stop Running Scan

Terminate a currently running scan.

```json
{
  "scanId": "uuid-of-scan"
}
```

## Security Features

- **Input Sanitization**: All inputs are sanitized to prevent command injection
- **Validation**: Comprehensive validation of targets, ports, and hostnames
- **Conflict Prevention**: Prevents invalid option combinations (e.g., `ssl` + `nossl`)
- **Safe Execution**: Sandboxed command execution with timeouts
- **Concurrent Limits**: Configurable limits on simultaneous scans

## Example Usage

See `examples/scan-demo.js` for comprehensive examples of all supported options and use cases.

```bash
node examples/scan-demo.js
```

## 🤝 Contributing

Bug reports, feature requests, and pull requests are welcome!

1. Fork the repo
2. `git checkout -b feature/awesome`
3. Commit your changes
4. Push and open a PR

All contributors agree to abide by the project's Code of Conduct.

---

## 📄 License

This project is licensed under the GNU General Public License v3.0.

Commercial licenses are available for organizations that wish to use this software under different terms. For more information, please contact: [weldpua2008](https://github.com/weldpua2008)
