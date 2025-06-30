#!/usr/bin/env node

const { Command } = require("commander");
const startProxy = require("./proxy");
const clearCache = require("./cache").clearCache;

const program = new Command();

program
  .name("caching-proxy")
  .description("A caching proxy server")
  .version("1.0.0");

program
  .option("-p, --port <number>", "Port to run the proxy server on")
  .option("-o, --origin <url>", "Origin server URL to proxy requests to")
  .option("--clear-cache", "Clear the cache and exit");

program.parse();

const options = program.opts();

if (options.clearCache) {
  clearCache();
  console.log("Cache cleared successfully");
  process.exit(0);
}

if (!options.port || !options.origin) {
  console.error("Error: Both --port and --origin are required");
  console.error("Usage: caching-proxy --port <number> --origin <url>");
  process.exit(1);
}

const port = parseInt(options.port);
if (isNaN(port) || port <= 0 || port > 65535) {
  console.error("Error: Port must be a valid number between 1 and 65535");
  process.exit(1);
}

startProxy(port, options.origin);