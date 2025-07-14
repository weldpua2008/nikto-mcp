#!/usr/bin/env node

/**
 * Demonstration script for the Nikto MCP server enhanced scan function
 * 
 * This script shows how to use the various command-line options that are now
 * supported by the scan tool, including:
 * - Basic scans with different targets
 * - SSL/HTTPS configuration
 * - DNS lookup control
 * - Virtual host specification
 * - Timeout configuration
 * - Dry run mode for testing
 */

const examples = [
  {
    name: "Basic HTTP scan",
    description: "Simple scan of a website",
    request: {
      target: "http://example.com"
    },
    expectedCommand: "nikto -h http://example.com -timeout 3600 -nointeractive"
  },
  
  {
    name: "HTTPS scan with custom port",
    description: "Scan HTTPS site on custom port",
    request: {
      target: "https://example.com",
      port: 8443,
      ssl: true
    },
    expectedCommand: "nikto -h https://example.com -p 8443 -ssl -timeout 3600 -nointeractive"
  },
  
  {
    name: "Scan with no DNS lookup",
    description: "Scan without performing DNS lookups",
    request: {
      target: "192.168.1.100",
      nolookup: true,
      timeout: 300
    },
    expectedCommand: "nikto -h 192.168.1.100 -nolookup -timeout 300 -nointeractive"
  },
  
  {
    name: "Scan with virtual host",
    description: "Scan with custom Host header",
    request: {
      target: "192.168.1.100",
      vhost: "internal.example.com",
      port: 80
    },
    expectedCommand: "nikto -h 192.168.1.100 -p 80 -vhost internal.example.com -timeout 3600 -nointeractive"
  },
  
  {
    name: "Force non-SSL scan",
    description: "Explicitly disable SSL even if port suggests HTTPS",
    request: {
      target: "example.com",
      port: 443,
      nossl: true
    },
    expectedCommand: "nikto -h example.com -p 443 -nossl -timeout 3600 -nointeractive"
  },
  
  {
    name: "JSON output with dry run",
    description: "Test command generation without execution",
    request: {
      target: "https://api.example.com",
      ssl: true,
      outputFormat: "json",
      timeout: 1800,
      dryRun: true
    },
    expectedCommand: "nikto -h https://api.example.com -ssl -timeout 1800 -Format json -nointeractive"
  },
  
  {
    name: "Complex scan scenario",
    description: "Full-featured scan with multiple options",
    request: {
      target: "https://secure.example.com",
      port: 9443,
      ssl: true,
      vhost: "secure-internal.example.com",
      nolookup: true,
      timeout: 2400,
      outputFormat: "json"
    },
    expectedCommand: "nikto -h https://secure.example.com -p 9443 -ssl -nolookup -vhost secure-internal.example.com -timeout 2400 -Format json -nointeractive"
  }
];

console.log("🔒 Nikto MCP Server - Enhanced Scan Function Examples\n");
console.log("The following examples demonstrate the new command-line options");
console.log("supported by the enhanced 'scan' tool:\n");

examples.forEach((example, index) => {
  console.log(`${index + 1}. ${example.name}`);
  console.log(`   Description: ${example.description}`);
  console.log(`   MCP Request:`);
  console.log(`   ${JSON.stringify(example.request, null, 6)}`);
  console.log(`   Generated Command: ${example.expectedCommand}`);
  console.log("");
});

console.log("💡 Key Features:");
console.log("✅ Target validation (URLs, IPs, hostnames)");
console.log("✅ SSL/HTTPS support with -ssl flag");
console.log("✅ SSL disable with -nossl flag (mutually exclusive with -ssl)");
console.log("✅ DNS lookup control with -nolookup flag");
console.log("✅ Custom port specification with -p option");
console.log("✅ Virtual host support with -vhost option");
console.log("✅ Configurable timeout with -timeout option");
console.log("✅ Output format selection (json/text)");
console.log("✅ Dry run mode for command testing");
console.log("✅ Comprehensive input validation and sanitization");
console.log("✅ Error handling for invalid option combinations");
console.log("");

console.log("🚨 Security Features:");
console.log("• Input sanitization to prevent command injection");
console.log("• Validation of hostnames and IP addresses");
console.log("• Prevention of conflicting SSL options");
console.log("• Safe handling of special characters");
console.log("");

console.log("To test these examples, use the MCP 'scan' tool with the");
console.log("request objects shown above. The dry run option is particularly");
console.log("useful for testing command generation without actually executing Nikto.");
