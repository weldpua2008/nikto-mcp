# 🔒 Nikto MCP Server

[![CI](https://github.com/weldpua2008/nikto-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/weldpua2008/nikto-mcp/actions/workflows/ci.yml) [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A secure MCP (Model Context Protocol) server that enables AI agents to interact with [Nikto web server scanner](https://github.com/sullo/nikto) for comprehensive web security scanning.

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [⚡ Quick Start](#-quick-start)
- [🚀 Prerequisites & Installation](#-prerequisites--installation)
- [🔧 Configuration](#-configuration)
- [🛠️ Available Tools](#️-available-tools)
- [🔒 Security Features](#-security-features)
- [💡 Example Usage](#-example-usage)
- [🤝 Contributing](#-contributing)
- [ License](#-license)

## ✨ Key Features

- ✅ **100% TypeScript** – fully typed, production-ready
- 📊 **Multiple output formats** – JSON (machine-readable) and rich CLI (human-readable)
- 🌐 **Optional REST API** for remote scan management
- 🛡️ **Secure by default** – sandboxed execution, sensible timeouts, and minimal privileges
- 🐳 **Docker support** with proper volume mounting and JSON output handling

---

## ⚡ Quick Start

```bash
# Install and run with MCP Inspector
npx @modelcontextprotocol/inspector nikto-mcp@latest
```

## 🚀 Prerequisites & Installation

**Requirements:**
- **Node.js** 20 or newer
- **Nikto Scanner** - Install and ensure it's accessible in your PATH
- **MCP Client** - VS Code, Cursor, Windsurf, Claude Desktop, Goose or any other MCP client

**Basic Configuration:**
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

**Install Nikto:**
```bash
# macOS
brew install nikto

# Ubuntu/Debian  
sudo apt-get install nikto

# Or from source
git clone https://github.com/sullo/nikto
```

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

---

## 🔧 Configuration

### MCP Inspector (Development)

```bash
# Install and run with MCP Inspector
npx @modelcontextprotocol/inspector nikto-mcp@latest
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

### Environment Variables

- `NIKTO_MODE` - Execution mode: `local` or `docker` (default: `local`)
- `NIKTO_DOCKER_IMAGE` - Docker image to use (default: `ghcr.io/sullo/nikto:latest`)
- `NIKTO_DOCKER_NETWORK` - Docker network mode (default: `host`)
- `NIKTO_BINARY` - Path to Nikto executable for local mode (default: `nikto`)
- `LOG_LEVEL` - Logging level: debug, info, warn, error (default: `info`)
- `SCAN_TIMEOUT` - Maximum scan duration in seconds (default: `3600`)
- `MAX_CONCURRENT_SCANS` - Maximum concurrent scans (default: `3`)

> **Note**: JSON output automatically uses unique filenames per scan (`/tmp/nikto-scan-<uuid>.json`) to prevent concurrent scan collisions.

---

## 🐳 Docker Support

The MCP server supports running Nikto via Docker for better isolation and consistency.

### Docker Mode Configuration

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

### Building and Running with Docker

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

## 🛠️ Available Tools

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

## 🔒 Security Features

- 🛡️ **Input sanitization** to prevent command injection
- ✅ **Comprehensive validation** of targets, ports, and hostnames  
- 🔐 **Sandboxed execution** with configurable timeouts and concurrent limits
- ⚠️ **Safe defaults** and conflict prevention between options

## 💡 Example Usage

See `examples/scan-demo.js` for comprehensive examples of all supported options and use cases:

```bash
node examples/scan-demo.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

Bug reports and feature requests are welcome via [GitHub Issues](https://github.com/weldpua2008/nikto-mcp/issues).

---

## 📄 License

This project is licensed under the GNU General Public License v3.0.

Commercial licenses are available for organizations that wish to use this software under different terms. For more information, please contact: [weldpua2008](https://github.com/weldpua2008)
