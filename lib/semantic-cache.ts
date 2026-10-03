import { qdrantClient, VECTOR_DIMENSION } from './qdrant';
import { DueDiligenceResponse } from './types';

export const CACHE_COLLECTION_NAME = 'deal_semantic_cache_2048';
export const DEFAULT_SIMILARITY_THRESHOLD = parseFloat(process.env.SEMANTIC_CACHE_THRESHOLD || '0.94');
export const DEFAULT_TTL_MS = parseInt(process.env.SEMANTIC_CACHE_TTL_MS || String(24 * 60 * 60 * 1000), 10); // 24 hours

export interface SemanticCacheEntry {
  id: string;
  deal_id: string;
  query: string;
  vector: number[];
  response: DueDiligenceResponse;
  created_at: string;
  expires_at: number;
}

export interface SemanticCacheStats {
  hits: number;
  misses: number;
  totalLookups: number;
  hitRate: number;
  dealEntryCounts: Record<string, number>;
  totalCachedEntries: number;
}

// In-Memory fallback store for zero-config local dev & fast-path cache
const memoryCache: Map<string, SemanticCacheEntry[]> = new Map();

// In-memory telemetry counters
let cacheHits = 0;
let cacheMisses = 0;

let qdrantCollectionInitialized = false;

/**
 * Computes exact cosine similarity between two vectors.
 * Handles both normalized and non-normalized vectors safely.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Ensures the Qdrant semantic cache collection exists.
 */
async function ensureQdrantCacheCollection(): Promise<boolean> {
  if (qdrantCollectionInitialized) return true;

  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections?.some((c) => c.name === CACHE_COLLECTION_NAME);

    if (!exists) {
      await qdrantClient.createCollection(CACHE_COLLECTION_NAME, {
        vectors: {
          size: VECTOR_DIMENSION,
          distance: 'Cosine',
        },
      });
      console.log(`[SemanticCache] Initialized Qdrant collection: "${CACHE_COLLECTION_NAME}"`);
    }

    qdrantCollectionInitialized = true;
    return true;
  } catch (err: any) {
    // Qdrant server may be offline during development; fallback to in-memory gracefully
    return false;
  }
}

/**
 * Searches the semantic cache for a matching query within the specific deal.
 * 
 * Rules:
 * 1. Strictly isolated by `dealId`.
 * 2. Compares cosine similarity against `threshold` (default 0.94).
 * 3. Checks in-memory fast-path first, then checks Qdrant collection if available.
 * 4. Ignores expired entries.
 */
export async function getSemanticCache(
  dealId: string,
  queryVector: number[],
  incomingQuery: string,
  threshold: number = DEFAULT_SIMILARITY_THRESHOLD
): Promise<DueDiligenceResponse | null> {
  const now = Date.now();

  // 1. Fast Path: In-Memory Search
  const dealEntries = memoryCache.get(dealId);
  if (dealEntries && dealEntries.length > 0) {
    let bestMatch: SemanticCacheEntry | null = null;
    let highestSim = -1;

    // Filter out expired items while searching
    const activeEntries: SemanticCacheEntry[] = [];
    for (const entry of dealEntries) {
      if (entry.expires_at > now) {
        activeEntries.push(entry);
        const sim = cosineSimilarity(queryVector, entry.vector);
        if (sim >= threshold && sim > highestSim) {
          highestSim = sim;
          bestMatch = entry;
        }
      }
    }

    // Prune expired entries
    if (activeEntries.length !== dealEntries.length) {
      memoryCache.set(dealId, activeEntries);
    }

    if (bestMatch && highestSim >= threshold) {
      cacheHits++;
      console.log(
        `[SemanticCache] Cache HIT (In-Memory) for deal "${dealId}" | sim: ${(highestSim * 100).toFixed(1)}% | original: "${bestMatch.query}"`
      );

      return {
        ...bestMatch.response,
        query: incomingQuery, // Keep user's query for display
        deal_id: dealId,
        cached: true,
        cache_similarity: parseFloat(highestSim.toFixed(4)),
        matched_cached_query: bestMatch.query,
        cache_timestamp: bestMatch.created_at,
      };
    }
  }

  // 2. Secondary Path: Qdrant Vector Cache Search
  try {
    const qdrantAvailable = await ensureQdrantCacheCollection();
    if (qdrantAvailable) {
      const searchResults = await qdrantClient.search(CACHE_COLLECTION_NAME, {
        vector: queryVector,
        limit: 1,
        score_threshold: threshold,
        filter: {
          must: [
            {
              key: 'deal_id',
              match: { value: dealId },
            },
          ],
        },
        with_payload: true,
      });

      if (searchResults && searchResults.length > 0) {
        const topResult = searchResults[0];
        const payload = topResult.payload as any;

        // Verify expiration
        if (payload?.expires_at && payload.expires_at > now && payload.response) {
          cacheHits++;
          const score = topResult.score || threshold;
          console.log(
            `[SemanticCache] Cache HIT (Qdrant) for deal "${dealId}" | sim: ${(score * 100).toFixed(1)}% | original: "${payload.query}"`
          );

          // Backfill into memory cache for instant future hits
          const entry: SemanticCacheEntry = {
            id: String(topResult.id),
            deal_id: dealId,
            query: payload.query,
            vector: queryVector,
            response: payload.response,
            created_at: payload.created_at || new Date().toISOString(),
            expires_at: payload.expires_at,
          };
          const current = memoryCache.get(dealId) || [];
          memoryCache.set(dealId, [entry, ...current]);

          return {
            ...payload.response,
            query: incomingQuery,
            deal_id: dealId,
            cached: true,
            cache_similarity: parseFloat(score.toFixed(4)),
            matched_cached_query: payload.query,
            cache_timestamp: payload.created_at,
          };
        }
      }
    }
  } catch (err: any) {
    // Non-fatal if Qdrant search encounters temporary glitch
    console.warn(`[SemanticCache] Qdrant cache query error:`, err?.message || err);
  }

  cacheMisses++;
  return null;
}

/**
 * Stores a synthesized due diligence response into the semantic cache.
 */
export async function setSemanticCache(
  dealId: string,
  queryVector: number[],
  query: string,
  response: DueDiligenceResponse,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
  const now = Date.now();
  const entryId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = now + ttlMs;

  const entry: SemanticCacheEntry = {
    id: entryId,
    deal_id: dealId,
    query,
    vector: queryVector,
    response,
    created_at: createdAt,
    expires_at: expiresAt,
  };

  // 1. Store in In-Memory Cache (LRU capped per deal at 100 entries)
  const existing = memoryCache.get(dealId) || [];
  const updated = [entry, ...existing.filter((e) => e.expires_at > now)].slice(0, 100);
  memoryCache.set(dealId, updated);

  // 2. Persist in Qdrant collection if active
  try {
    const qdrantAvailable = await ensureQdrantCacheCollection();
    if (qdrantAvailable) {
      await qdrantClient.upsert(CACHE_COLLECTION_NAME, {
        wait: false,
        points: [
          {
            id: entryId,
            vector: queryVector,
            payload: {
              deal_id: dealId,
              query,
              response,
              created_at: createdAt,
              expires_at: expiresAt,
            },
          },
        ],
      });
      console.log(`[SemanticCache] Successfully persisted query "${query}" to Qdrant collection.`);
    }
  } catch (err: any) {
    // Non-fatal, entry is safely stored in memory cache
    console.warn(`[SemanticCache] Could not persist cache entry to Qdrant:`, err?.message || err);
  }
}

/**
 * Invalidates the semantic cache for a specific deal, or completely clears all cache.
 * Called automatically when new documents are ingested to maintain financial audit integrity.
 */
export async function invalidateSemanticCache(dealId?: string): Promise<{ deletedCount: number }> {
  let deletedCount = 0;

  if (dealId) {
    const existing = memoryCache.get(dealId);
    deletedCount = existing ? existing.length : 0;
    memoryCache.delete(dealId);

    try {
      const qdrantAvailable = await ensureQdrantCacheCollection();
      if (qdrantAvailable) {
        await qdrantClient.delete(CACHE_COLLECTION_NAME, {
          filter: {
            must: [
              {
                key: 'deal_id',
                match: { value: dealId },
              },
            ],
          },
        });
      }
    } catch (err: any) {
      console.warn(`[SemanticCache] Qdrant cache invalidation error for deal ${dealId}:`, err?.message || err);
    }

    console.log(`[SemanticCache] Invalidated cache for deal "${dealId}" (${deletedCount} entries removed).`);
  } else {
    for (const [_, entries] of memoryCache.entries()) {
      deletedCount += entries.length;
    }
    memoryCache.clear();

    try {
      const qdrantAvailable = await ensureQdrantCacheCollection();
      if (qdrantAvailable) {
        await qdrantClient.deleteCollection(CACHE_COLLECTION_NAME);
        qdrantCollectionInitialized = false;
      }
    } catch (err: any) {
      console.warn(`[SemanticCache] Qdrant global cache wipe error:`, err?.message || err);
    }

    console.log(`[SemanticCache] Wiped all semantic cache entries (${deletedCount} total).`);
  }

  return { deletedCount };
}

/**
 * Provides live telemetry on cache hits, misses, and active cached queries.
 */
export function getSemanticCacheStats(): SemanticCacheStats {
  const totalLookups = cacheHits + cacheMisses;
  const hitRate = totalLookups > 0 ? parseFloat((cacheHits / totalLookups).toFixed(4)) : 0;

  const dealEntryCounts: Record<string, number> = {};
  let totalCachedEntries = 0;

  for (const [dealId, entries] of memoryCache.entries()) {
    const active = entries.filter((e) => e.expires_at > Date.now()).length;
    dealEntryCounts[dealId] = active;
    totalCachedEntries += active;
  }

  return {
    hits: cacheHits,
    misses: cacheMisses,
    totalLookups,
    hitRate,
    dealEntryCounts,
    totalCachedEntries,
  };
}
