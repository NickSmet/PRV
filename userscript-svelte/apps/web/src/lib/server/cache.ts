type Entry<T> = { value: T; expiresAt: number };

export class TtlCache<K, V> {
  #map = new Map<K, Entry<V>>();

  constructor(private ttlMs: number) {}

  get(key: K): V | undefined {
    const entry = this.#map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.#map.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    this.#map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

