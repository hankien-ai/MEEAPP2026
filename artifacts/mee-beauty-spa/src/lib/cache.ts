// src/lib/cache.ts
const cache = new Map<string, { data: any; expiry: number }>();

interface CacheOptions {
  ttl?: number; // seconds
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache(key: string, data: any, ttlSeconds: number = 60): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function invalidateCachePattern(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) {
      cache.delete(key);
    }
  }
}

export function clearCache(): void {
  cache.clear();
}