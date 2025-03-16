// Simple in-memory cache implementation
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired items periodically
  startCleanup(interval = 60 * 1000): void { // Clean every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.timestamp) {
          this.cache.delete(key);
        }
      }
    }, interval);
  }
}

// Create cache instances with different TTLs for different types of data
export const weatherCache = new CacheManager(30 * 60 * 1000); // 30 minutes
export const foodDataCache = new CacheManager(24 * 60 * 60 * 1000); // 24 hours
export const healthEducationCache = new CacheManager(7 * 24 * 60 * 60 * 1000); // 7 days
export const globalHealthCache = new CacheManager(24 * 60 * 60 * 1000); // 24 hours

// Start cleanup for all caches
weatherCache.startCleanup();
foodDataCache.startCleanup();
healthEducationCache.startCleanup();
globalHealthCache.startCleanup();