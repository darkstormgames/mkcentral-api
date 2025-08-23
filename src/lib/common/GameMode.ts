import { getFromRegistry, hasNormalizedKey, mapRegistry, normalizeKey } from './Helpers';

/**
 * Canonical keys for supported game modes.
 */
export type GameModeKey =
	| '150cc'
	| '200cc'
	| 'rt'
	| 'ct'
	| 'vsrace'
	| 'match_race'
	| 'mixed_battle'
	| 'balloon_battle'
	| 'shine_thief'
	| 'bobomb_blast'
	| 'coin_runners'
	| 'renegade_roundup'
	| 'mixed';

/**
 * Internal shape of a game mode entry in the registry.
 * @internal
 */
type GameModeDefinition = {
	readonly displayName: string;
	readonly shortName: string;
};

// Central mode registry (single source of truth)
/**
 * Central registry of all known game modes keyed by {@link GameModeKey}.
 */
const MODE_DEFINITIONS: Readonly<Record<GameModeKey, GameModeDefinition>> = Object.freeze({
	'150cc': { displayName: '150cc', shortName: '150cc' },
	'200cc': { displayName: '200cc', shortName: '200cc' },
	rt: { displayName: 'Regular Tracks', shortName: 'RT' },
	ct: { displayName: 'Custom Tracks', shortName: 'CT' },
	vsrace: { displayName: 'VS Race', shortName: 'VS' },
	match_race: { displayName: 'Match Race', shortName: 'MR' },
	mixed_battle: { displayName: 'Mixed Battle', shortName: 'Mixed Battle' },
	balloon_battle: { displayName: 'Balloon Battle', shortName: 'Balloon' },
	shine_thief: { displayName: 'Shine Thief', shortName: 'Shine' },
	bobomb_blast: { displayName: 'Bob-omb Blast', shortName: 'Bob-omb' },
	coin_runners: { displayName: 'Coin Runners', shortName: 'Coins' },
	renegade_roundup: { displayName: 'Renegade Roundup', shortName: 'Renegade' },
	mixed: { displayName: 'Mixed', shortName: 'Mixed' },
});

/**
 * Immutable game mode metadata (display/short names).
 * Construct via key or use the provided static getters (e.g., {@link GameMode.RT}).
 */
export class GameMode {
	/** Canonical key for this game mode. */
	public readonly Key: GameModeKey;
	/** Human-friendly display name (e.g., "VS Race"). */
	public readonly DisplayName: string;
	/** Abbreviated name (e.g., "VS"). */
	public readonly ShortName: string;

	/**
	 * Create a {@link GameMode} from a key. Key is normalized; unknown keys throw.
	 * @param key Game mode key or reasonable variant (case/format-insensitive)
	 * @throws Error if the key is not recognized
	 */
	constructor(key: string) {
		const normalized = GameMode.normalizeKey(key);
		const def = getFromRegistry(normalized as GameModeKey, MODE_DEFINITIONS);
		if (!def) {
			throw new Error(`Unknown game mode: ${key}`);
		}
		this.Key = normalized as GameModeKey;
		this.DisplayName = def.displayName;
		this.ShortName = def.shortName;
	}

	// Utility helpers

	/** Normalize a mode key (case, separators) to its canonical form. */
	static normalizeKey(key: string): string {
		return normalizeKey(key) as string;
	}

	/** Check if a key corresponds to a known game mode. */
	static exists(key: string): key is GameModeKey {
		return hasNormalizedKey(key, MODE_DEFINITIONS, GameMode.normalizeKey);
	}

	/** Try to get a {@link GameMode} from a key; returns null if unknown. */
	static tryGet(key: string): GameMode | null {
		return GameMode.exists(key) ? new GameMode(key) : null;
	}

	/**
	 * Get all known game modes as {@link GameMode} objects.
	 * @returns Readonly array of all modes in the registry
	 */
	static all(): ReadonlyArray<GameMode> {
		return mapRegistry(MODE_DEFINITIONS, (k) => new GameMode(k));
	}

	// Static members for each GameModeKey (PascalCase)
	/** 150cc mode. */
	public static get CC150(): GameMode {
		return new GameMode('150cc');
	}

	/** 200cc mode. */
	public static get CC200(): GameMode {
		return new GameMode('200cc');
	}

	/** Regular Tracks. */
	public static get RT(): GameMode {
		return new GameMode('rt');
	}

	/** Custom Tracks. */
	public static get CT(): GameMode {
		return new GameMode('ct');
	}

	/** VS Race. */
	public static get VSRace(): GameMode {
		return new GameMode('vsrace');
	}

	/** Match Race. */
	public static get MatchRace(): GameMode {
		return new GameMode('match_race');
	}

	/** Mixed Battle. */
	public static get MixedBattle(): GameMode {
		return new GameMode('mixed_battle');
	}

	/** Balloon Battle. */
	public static get BalloonBattle(): GameMode {
		return new GameMode('balloon_battle');
	}

	/** Shine Thief. */
	public static get ShineThief(): GameMode {
		return new GameMode('shine_thief');
	}

	/** Bob-omb Blast. */
	public static get BobOmbBlast(): GameMode {
		return new GameMode('bobomb_blast');
	}

	/** Coin Runners. */
	public static get CoinRunners(): GameMode {
		return new GameMode('coin_runners');
	}

	/** Renegade Roundup. */
	public static get RenegadeRoundup(): GameMode {
		return new GameMode('renegade_roundup');
	}

	/** Mixed. */
	public static get Mixed(): GameMode {
		return new GameMode('mixed');
	}
}
