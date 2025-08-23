// Common helper utilities shared across models

/**
 * Coerce a value into a boolean. Undefined/null/unknown values become false.
 */
export function toBoolean(v: any): boolean {
	if (typeof v === "boolean") return v;
	if (typeof v === "number") return v !== 0;
	if (typeof v === "string") return v === "1" || v.toLowerCase() === "true";
	return false;
}

/**
 * Coerce a value into a boolean or null. Undefined/null/unknown values become null.
 */
export function toNullableBoolean(v: any): boolean | null {
	if (v === undefined || v === null) return null;
	if (typeof v === "boolean") return v;
	if (typeof v === "number") return v !== 0;
	if (typeof v === "string") return v === "1" || v.toLowerCase() === "true";
	return null;
}

// Generic registry helpers (for Game, Platform, etc.)

/** Normalize a key: trim and lowercase. */
export function normalizeKey(key: string): string {
	return (key || '').trim().toLowerCase();
}

/** Check if a (normalized) key exists in the provided registry. */
export function hasNormalizedKey<K extends string, V>(
	key: string,
	registry: Readonly<Record<K, V>>,
	normalizer: (k: string) => string = normalizeKey
): key is K {
	const k = normalizer(key) as K;
	return (k as string) in registry;
}

/** Get a value from a registry by normalized key. */
export function getFromRegistry<K extends string, V>(
	key: string,
	registry: Readonly<Record<K, V>>,
	normalizer: (k: string) => string = normalizeKey
): V | undefined {
	const k = normalizer(key) as K;
	return (registry as Record<string, V>)[k as unknown as string];
}

/** Map over a registry into an array using key and value. */
export function mapRegistry<K extends string, V, T>(
	registry: Readonly<Record<K, V>>,
	mapper: (key: K, value: V) => T
): ReadonlyArray<T> {
	return Object.keys(registry).map((k) => {
		const key = k as K;
		return mapper(key, (registry as Record<K, V>)[key]);
	});
}
