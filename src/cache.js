const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "proxy-cache.json");

// In-memory cache
let cache = new Map();

// Ensure cache directory exists
function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch (error) {
    console.warn("Failed to create cache directory:", error.message);
  }
}

// Load cache from file on startup
function loadCache() {
  try {
    ensureCacheDir();
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      const cacheData = JSON.parse(data);
      cache = new Map(Object.entries(cacheData));
      console.log(`Loaded ${cache.size} items from cache`);
    }
  } catch (error) {
    console.warn("Failed to load cache from file:", error.message);
    cache = new Map();
  }
}

function saveCache() {
  try {
    ensureCacheDir();
    const cacheData = Object.fromEntries(cache);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.warn("Failed to save cache to file:", error.message);
  }
}

function generateCacheKey(req) {
  return `${req.method.toUpperCase()}:${req.originalUrl}`;
}

function getCachedResponse(req) {
  const key = generateCacheKey(req);
  const cached = cache.get(key);
  console.log(`Cache lookup for "${key}": ${cached ? 'HIT' : 'MISS'}`);
  return cached;
}

function setCachedResponse(req, responseData) {
  const key = generateCacheKey(req);
  console.log(`Caching response for "${key}"`);
  cache.set(key, {
    ...responseData,
    cachedAt: Date.now()
  });
  saveCache();
}

function clearCache() {
  console.log("Clearing cache...");
  cache.clear();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
      console.log(`Cache file deleted: ${CACHE_FILE}`);
    }
  } catch (error) {
    console.warn("Failed to delete cache file:", error.message);
  }
}

// Load cache on module initialization
loadCache();

module.exports = {
  getCachedResponse,
  setCachedResponse,
  clearCache
};