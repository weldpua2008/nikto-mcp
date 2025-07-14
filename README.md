# Nikto MCP (Model Context Protocol) server in TypeScript

A secure MCP (Model Context Protocol) server that enables AI agents to interact with [Nikto web server scanner](https://github.com/sullo/nikto).
This server enables LLMs to interact with Nikto scans, designed to mirror and stay in sync with the official Nikto.

### ✨ Key Features

- ✅ 100% TypeScript source – fully typed, production-ready
- 📊 Multiple output formats: JSON (machine-readable) and rich CLI (human-readable)
- 🌐 Optional REST API for remote scan management
- 🛡️ Secure by default: sandboxed execution, sensible timeouts, and minimal privileges
- 🐳 Docker support with proper volume mounting and JSON output handling
---

### Requirements
- Node.js 20 or newer
- VS Code, Cursor, Windsurf, Claude Desktop, Goose or any other MCP client

### Getting started

First, install the Nikto MCP server with your client. A typical configuration looks like this:

```js
{
  "mcpServers": {
    "niktomcp": {
      "command": "npx",
      "args": [
        "nikto-mcp@latest"
      ]
    }
  }
}
```


[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%257B%2522name%2522%253A%2522niktomcp%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522nikto-mcp%2540latest%2522%255D%257D) [<img alt="Install in VS Code Insiders" src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Server&color=24bfa5">](https://insiders.vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%257B%2522name%2522%253A%2522niktomcp%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522nikto-mcp%2540latest%2522%255D%257D)
<details><summary><b>Install in VS Code</b></summary>
You can also install the Nikto MCP server using the VS Code CLI:
```bash
# For VS Code
code --add-mcp '{"name":"niktomcp","command":"npx","args":["nikto-mcp@latest"]}'
```

After installation, the Nikto MCP server will be available for use with your GitHub Copilot agent in VS Code.
</details>

<details>
<summary><b>Install in Cursor</b></summary>
Go to `Cursor Settings` -> `MCP` -> `Add new MCP Server`. Name to your liking, use `command` type with the command `npx nikto-mcp@latest`. You can also verify config or add command like arguments via clicking `Edit`.

```js
{
  "mcpServers": {
    "niktomcp": {
      "command": "npx",
      "args": [
        "nikto-mcp@latest"
      ]
    }
  }
}
```
</details>

<details>
<summary><b>Install in Windsurf</b></summary>

Follow Windsurf MCP [documentation](https://docs.windsurf.com/windsurf/cascade/mcp). Use following configuration:

```js
{
  "mcpServers": {
    "niktomcp": {
      "command": "npx",
      "args": [
        "nikto-mcp@latest"
      ]
    }
  }
}
```
</details>

<details>
<summary><b>Install in Claude Desktop</b></summary>

Follow the MCP install [guide](https://modelcontextprotocol.io/quickstart/user), use following configuration:

```js
{
  "mcpServers": {
    "niktomcp": {
      "command": "npx",
      "args": [
        "nikto-mcp@latest"
      ]
    }
  }
}
```
</details>

<details>
<summary><b>Install in Claude Code</b></summary>

Use the Claude Code CLI to add the Nikto MCP server:

```bash
claude mcp add nikto-mcp npx nikto-mcp
```
</details>

<details>
<summary><b>Install in Goose</b></summary>
Go to `Advanced settings` -> `Extensions` -> `Add custom extension`. Name to your liking, use type `STDIO`, and set the `command` to `npx nikto-mcp`. Click "Add Extension".
</details>
<details>
<summary><b>Install in Qodo Gen</b></summary>

Open [Qodo Gen](https://docs.qodo.ai/qodo-documentation/qodo-gen) chat panel in VSCode or IntelliJ → Connect more tools → + Add new MCP → Paste the following configuration:

```js
{
  "mcpServers": {
    "niktomcp": {
      "command": "npx",
      "args": [
        "nikto-mcp@latest"
      ]
    }
  }
}
```

Click <code>Save</code>.
</details>

<details>
<summary><b>Install in Gemini CLI</b></summary>

Follow the MCP install [guide](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#configure-the-mcp-server-in-settingsjson), use following configuration:

```js
{
  "mcpServers": {
    "niktomcp": {
      "command": "npx",
      "args": [
        "nikto-mcp@latest"
      ]
    }
  }
}
```
</details>

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

### Running the MCP Server via MCP inspector

```bash
 npx @modelcontextprotocol/inspector  nikto-mcp@latest          
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


### Testing with MCP Inspector (Dev)

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Test the server
npx @modelcontextprotocol/inspector node index.js
```

### Docker Support

The MCP server supports running Nikto via Docker for better isolation and consistency.

#### Environment Variables

- `NIKTO_MODE` - Execution mode: `local` or `docker` (default: `local`)
- `NIKTO_DOCKER_IMAGE` - Docker image to use (default: `ghcr.io/sullo/nikto:latest`)
- `NIKTO_DOCKER_NETWORK` - Docker network mode (default: `host`)
- `NIKTO_BINARY` - Path to Nikto executable for local mode (default: `nikto`)
- `LOG_LEVEL` - Logging level: debug, info, warn, error (default: `info`)
- `SCAN_TIMEOUT` - Maximum scan duration in seconds (default: `3600`)
- `MAX_CONCURRENT_SCANS` - Maximum concurrent scans (default: `3`)

**Note**: JSON output automatically uses unique filenames per scan (`/tmp/nikto-scan-<uuid>.json`) to prevent concurrent scan collisions.

#### Docker Mode Configuration

```json
{
  "mcpServers": {
    "nikto": {
      "command": "node",
      "args": ["/absolute/path/to/nikto-mcp/index.js"],
      "env": {
        "NIKTO_MODE": "docker",
        "NIKTO_DOCKER_IMAGE": "ghcr.io/sullo/nikto:latest",
        "NIKTO_DOCKER_NETWORK": "host",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

#### Building and Running with Docker

```bash
# Build the MCP server with embedded Nikto
docker build -t nikto-mcp .

# Run the containerized MCP server
docker run --rm -i nikto-mcp

# Run with custom configuration
docker run --rm -i \
  -e NIKTO_MODE=local \
  -e LOG_LEVEL=debug \
  nikto-mcp
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
