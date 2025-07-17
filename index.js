#!/usr/bin/env node
/**
 * nikto-mcp bootstrap for stdin JSON-RPC server
 * 
 * This file serves as the entry point for the MCP server when run with:
 * node /path/to/nikto-mcp/index.js
 * 
 * It handles both production (compiled) and development (TypeScript) scenarios.
 */

const { join } = require('path');
const { existsSync } = require('fs');

async function main() {
  // Try compiled output first (production/after npm run build)
  const distEntry = join(__dirname, 'dist', 'index.js');
  if (existsSync(distEntry)) {
    require(distEntry);
    return;
  }

  // Development fallback - register TypeScript runtime
  try {
    // Prefer tsx (faster, better for modern Node.js)
    require.resolve('tsx');
    require('tsx/cjs');
  } catch {
    try {
      // Fallback to ts-node
      require.resolve('ts-node/register');
      require('ts-node/register');
    } catch {
      console.error(
        '[nikto-mcp] Error: Cannot find compiled output and no TypeScript runtime available.\n' +
        'Please run one of the following:\n' +
        '  npm run build     (to compile TypeScript)\n' +
        '  npm install       (to install dev dependencies including tsx/ts-node)'
      );
      process.exit(1);
    }
  }

  // Load TypeScript source
  require(join(__dirname, 'src', 'index.ts'));
}

// Start the server with error handling
main().catch((error) => {
  console.error('[nikto-mcp] Fatal bootstrap error:', error);
  process.exit(1);
});
