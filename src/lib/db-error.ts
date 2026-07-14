export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

export function isDatabaseUnavailableError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("prismaclientinitializationerror") ||
    message.includes("can't reach database server") ||
    message.includes("failed to connect") ||
    message.includes("connection refused") ||
    message.includes("connection terminated") ||
    message.includes("timed out") ||
    message.includes("server closed the connection")
  );
}

type DatabaseFallbackOptions = {
  cacheKey?: string;
  freshMs?: number;
  staleMs?: number;
  timeoutMs?: number;
};

type CacheEntry<T> = {
  value: T;
  freshUntil: number;
  staleUntil: number;
};

const globalForDbFallback = globalThis as unknown as {
  dbReadCache?: Map<string, CacheEntry<unknown>>;
  dbReadInFlight?: Map<string, Promise<unknown>>;
  dbErrorLastLoggedAt?: Map<string, number>;
};

const dbReadCache = globalForDbFallback.dbReadCache ?? new Map<string, CacheEntry<unknown>>();
const dbReadInFlight = globalForDbFallback.dbReadInFlight ?? new Map<string, Promise<unknown>>();
const dbErrorLastLoggedAt =
  globalForDbFallback.dbErrorLastLoggedAt ?? new Map<string, number>();

if (process.env.NODE_ENV !== "production") {
  globalForDbFallback.dbReadCache = dbReadCache;
  globalForDbFallback.dbReadInFlight = dbReadInFlight;
  globalForDbFallback.dbErrorLastLoggedAt = dbErrorLastLoggedAt;
}

function isFresh(entry: CacheEntry<unknown> | undefined, now: number) {
  return !!entry && entry.freshUntil > now;
}

function isStaleUsable(entry: CacheEntry<unknown> | undefined, now: number) {
  return !!entry && entry.staleUntil > now;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs?: number) {
  if (!timeoutMs) return promise;

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`Database read timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function setCachedValue<T>(cacheKey: string, value: T, freshMs: number, staleMs: number) {
  const now = Date.now();
  dbReadCache.set(cacheKey, {
    value,
    freshUntil: now + freshMs,
    staleUntil: now + freshMs + staleMs,
  });
}

function logDatabaseFallback(context: string, error: unknown) {
  const now = Date.now();
  const lastLoggedAt = dbErrorLastLoggedAt.get(context) ?? 0;
  if (now - lastLoggedAt < 30_000) return;

  dbErrorLastLoggedAt.set(context, now);
  console.error(`[db-unavailable] ${context}`, error);
}

function getOrStartCachedRead<T>(
  operation: () => Promise<T>,
  cacheKey: string,
  freshMs: number,
  staleMs: number
) {
  const existing = dbReadInFlight.get(cacheKey);
  if (existing) return existing as Promise<T>;

  const read = operation()
    .then((value) => {
      setCachedValue(cacheKey, value, freshMs, staleMs);
      return value;
    })
    .finally(() => {
      dbReadInFlight.delete(cacheKey);
    });

  dbReadInFlight.set(cacheKey, read);
  return read;
}

function refreshCachedRead<T>(
  operation: () => Promise<T>,
  cacheKey: string,
  context: string,
  freshMs: number,
  staleMs: number
) {
  void getOrStartCachedRead(operation, cacheKey, freshMs, staleMs).catch((error) => {
    logDatabaseFallback(context, error);
  });
}

export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string,
  options: DatabaseFallbackOptions = {}
) {
  const cacheKey = options.cacheKey;
  const freshMs = options.freshMs ?? 30_000;
  const staleMs = options.staleMs ?? 10 * 60_000;
  const timeoutMs = options.timeoutMs ?? 3_000;
  const now = Date.now();
  const cached = cacheKey ? dbReadCache.get(cacheKey) : undefined;

  if (cached && isFresh(cached, now)) {
    return cached.value as T;
  }

  if (cacheKey && cached && isStaleUsable(cached, now)) {
    refreshCachedRead(operation, cacheKey, context, freshMs, staleMs);
    return cached.value as T;
  }

  try {
    const result = await withTimeout(
      cacheKey ? getOrStartCachedRead(operation, cacheKey, freshMs, staleMs) : operation(),
      timeoutMs
    );
    return result;
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    if (cacheKey && cached && isStaleUsable(cached, now)) {
      refreshCachedRead(operation, cacheKey, context, freshMs, staleMs);
      return cached.value as T;
    }

    logDatabaseFallback(context, error);
    return fallback;
  }
}
