# Caching Proxy

A simple CLI-based HTTP caching proxy server.

It forwards requests to an origin server, caches the responses, and serves cached responses on repeated requests. Useful for debugging, testing, and understanding how caching works.

## Installation

```bash
npm install
```

To install globally and use as a command:

```bash
npm link
```

After linking, you can use `caching-proxy` command directly from anywhere.

## Example Usage

Start the proxy server:

```bash
# Using node
node src/index.js --port 3000 --origin https://dummyjson.com

# Or if installed globally with npm link
caching-proxy -p 3000 -o https://dummyjson.com
```

## Options

- `--port <number>` - Port to run the proxy server on
- `--origin <url>` - Target server URL to proxy requests to  
- `--clear-cache` - Clear the cache and exit

## Cache Headers

The proxy adds an `X-Cache` header to responses:
- `X-Cache: MISS` - Response fetched from origin server
- `X-Cache: HIT` - Response served from cache

## Cache Storage

Cache data is stored in `.cache/proxy-cache.json` in the project directory. The cache persists between server restarts.