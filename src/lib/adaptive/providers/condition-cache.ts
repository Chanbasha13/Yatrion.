/**
 * In-Memory Zero-Cost TTL Cache for External Condition Providers.
 * Operates without external databases, cloud services, or paid dependencies.
 * Strictly guarantees that no personal travel data or user secrets are ever cached.
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;     // epoch ms
  expiresAt: number;    // epoch ms
  ttlSeconds: number;
}

export class ConditionCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Generates a deterministic cache key.
   */
  public static buildKey(providerId: string, destinationId: string, scope: string = "default"): string {
    return `${providerId.toLowerCase()}:${destinationId.toLowerCase()}:${scope.toLowerCase()}`;
  }

  /**
   * Retrieves an item if present and within its valid TTL window.
   */
  public get<T>(key: string, maxAgeSeconds?: number): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();

    // Check custom maxAge constraint if provided
    if (typeof maxAgeSeconds === "number" && (now - entry.cachedAt) / 1000 > maxAgeSeconds) {
      return null;
    }

    // Check entry TTL expiration
    if (now > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Stores an item with a configured TTL.
   */
  public set<T>(key: string, data: T, ttlSeconds: number): void {
    const now = Date.now();
    this.store.set(key, {
      data,
      cachedAt: now,
      expiresAt: now + ttlSeconds * 1000,
      ttlSeconds,
    });
  }

  /**
   * Returns true if a non-expired entry exists for the key.
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Cleans out all expired entries to prevent memory accumulation.
   * Returns the count of pruned entries.
   */
  public pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.store.clear();
  }

  /**
   * Returns current count of entries.
   */
  public size(): number {
    return this.store.size;
  }
}

// Global shared singleton for the application runtime
export const globalConditionCache = new ConditionCache();

