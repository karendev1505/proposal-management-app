import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data: value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries periodically
  startCleanup(intervalMs: number = 60000): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        this.logger.debug(`Cleaned ${cleaned} expired cache entries`);
      }
    }, intervalMs);
  }
}

