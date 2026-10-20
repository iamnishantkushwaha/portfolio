type Fetch = typeof fetch;

/** Minimal shared-store contract: counters with expiry, set-if-absent, delete. */
export interface LimitStore {
  /** Increments a counter, starting its expiry window on first use. Returns the new count. */
  incr(key: string, windowSec: number): Promise<number>;
  /** Sets a key only if absent. Returns true when this call created it. */
  setOnce(key: string, ttlSec: number): Promise<boolean>;
  del(key: string): Promise<void>;
}

/** Per-process store. Fine for local development; on serverless hosts each instance has its own copy. */
export class MemoryStore implements LimitStore {
  private map = new Map<string, { value: number; expires: number }>();
  private now: () => number;
  private maxKeys: number;
  constructor(now: () => number = Date.now, maxKeys = 5_000) {
    this.now = now;
    this.maxKeys = maxKeys;
  }

  private sweep() {
    const t = this.now();
    for (const [k, v] of this.map) if (v.expires <= t) this.map.delete(k);
    // Hard ceiling so a flood of unique keys cannot grow memory without bound.
    while (this.map.size > this.maxKeys) this.map.delete(this.map.keys().next().value as string);
  }
  private live(key: string) {
    const entry = this.map.get(key);
    if (entry && entry.expires <= this.now()) { this.map.delete(key); return undefined; }
    return entry;
  }
  async incr(key: string, windowSec: number) {
    if (this.map.size > this.maxKeys) this.sweep();
    const entry = this.live(key);
    if (entry) { entry.value += 1; return entry.value; }
    this.map.set(key, { value: 1, expires: this.now() + windowSec * 1000 });
    return 1;
  }
  async setOnce(key: string, ttlSec: number) {
    if (this.live(key)) return false;
    this.map.set(key, { value: 1, expires: this.now() + ttlSec * 1000 });
    return true;
  }
  async del(key: string) { this.map.delete(key); }
}

/** Upstash Redis over its REST API. Works from serverless and edge runtimes with no extra dependency. */
export class UpstashStore implements LimitStore {
  private url: string;
  private token: string;
  private fetchImpl: Fetch;
  private timeoutMs: number;
  constructor(url: string, token: string, fetchImpl: Fetch = fetch, timeoutMs = 3_000) {
    this.url = url;
    this.token = token;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  private async call(path: string, body: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(`${this.url.replace(/\/$/, "")}${path}`, {
        method: "POST",
        headers: { authorization: `Bearer ${this.token}`, "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`upstash ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async incr(key: string, windowSec: number) {
    const out = (await this.call("/pipeline", [["INCR", key], ["EXPIRE", key, windowSec, "NX"]])) as Array<{ result?: number }>;
    const n = out?.[0]?.result;
    if (typeof n !== "number") throw new Error("upstash bad incr");
    return n;
  }
  async setOnce(key: string, ttlSec: number) {
    const out = (await this.call("", ["SET", key, "1", "NX", "EX", ttlSec])) as { result?: string | null };
    return out?.result === "OK";
  }
  async del(key: string) { await this.call("", ["DEL", key]); }
}

/** Uses the shared store when it answers, and degrades to a per-process store (never to "unlimited") if it errors. */
export class ResilientStore implements LimitStore {
  private primary: LimitStore;
  private fallback: LimitStore;
  private onError: (error: unknown) => void;
  constructor(primary: LimitStore, fallback: LimitStore, onError: (error: unknown) => void = () => {}) {
    this.primary = primary;
    this.fallback = fallback;
    this.onError = onError;
  }
  private async run<T>(fn: (s: LimitStore) => Promise<T>): Promise<T> {
    try { return await fn(this.primary); } catch (error) { this.onError(error); return fn(this.fallback); }
  }
  incr(key: string, windowSec: number) { return this.run((s) => s.incr(key, windowSec)); }
  setOnce(key: string, ttlSec: number) { return this.run((s) => s.setOnce(key, ttlSec)); }
  del(key: string) { return this.run((s) => s.del(key)); }
}

let shared: LimitStore | undefined;
const memory = new MemoryStore();

export function getStore(env: Readonly<Record<string, string | undefined>>, onError: (error: unknown) => void): LimitStore {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return memory;
  shared ??= new ResilientStore(new UpstashStore(url, token), memory, onError);
  return shared;
}

export type LimitResult = { allowed: boolean; count: number; limit: number; retryAfterSec: number };

/** Fixed-window limit: the first `limit` calls per window pass. */
export async function consume(store: LimitStore, key: string, limit: number, windowSec: number): Promise<LimitResult> {
  const count = await store.incr(key, windowSec);
  return { allowed: count <= limit, count, limit, retryAfterSec: windowSec };
}
