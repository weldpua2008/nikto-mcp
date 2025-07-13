#!/usr/bin/env node

// Wrapper script to run Nikto MCP in Docker mode
process.env.NIKTO_MODE = 'docker';
process.env.NIKTO_DOCKER_IMAGE = process.env.NIKTO_DOCKER_IMAGE || 'ghcr.io/sullo/nikto:latest';
process.env.NIKTO_DOCKER_NETWORK = process.env.NIKTO_DOCKER_NETWORK || 'host';

// Import and start the MCP server
require('./index.js');
