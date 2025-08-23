import { FriendCodeType } from '../player/FriendCode';
import { Platform, PlatformKey } from './Platform';
import { getFromRegistry, hasNormalizedKey, mapRegistry, normalizeKey } from './Helpers';

/**
 * Canonical keys for MKCentral-supported games.
 */
export type GameKey = 'mkworld' | 'mk8dx' | 'mk7' | 'mk8' | 'mkt' | 'mkw' | 'smk';

/**
 * Internal shape of a game entry in the registry.
 * @internal
 */
type GameDefinition = {
	readonly displayName: string;
	readonly shortName: string;
	readonly platform: PlatformKey;
	readonly friendCodeType: FriendCodeType;
};

// Central game registry (single source of truth)
/**
 * Central registry of all known games keyed by {@link GameKey}.
 * This is the single source of truth used to construct {@link Game} instances.
 */
const GAME_DEFINITIONS: Readonly<Record<GameKey, GameDefinition>> = Object.freeze({
    mkworld: {
		displayName: 'Mario Kart World',
		shortName: 'MKWORLD',
		platform: 'switch',
		friendCodeType: FriendCodeType.Switch,
	},
	mk8dx: {
		displayName: 'Mario Kart 8 Deluxe',
		shortName: 'MK8DX',
		platform: 'switch',
		friendCodeType: FriendCodeType.Switch,
	},
	mk7: {
		displayName: 'Mario Kart 7',
		shortName: 'MK7',
		platform: '3ds',
		friendCodeType: FriendCodeType.ThreeDS,
	},
	mk8: {
		displayName: 'Mario Kart 8',
		shortName: 'MK8',
		platform: 'wiiu',
		friendCodeType: FriendCodeType.NNID,
	},
	mkt: {
		displayName: 'Mario Kart Tour',
		shortName: 'MKT',
		platform: 'mobile',
		friendCodeType: FriendCodeType.MKT,
	},
	mkw: {
		displayName: 'Mario Kart Wii',
		shortName: 'MKW',
		platform: 'wii',
		friendCodeType: FriendCodeType.MKW,
	},
	smk: {
		displayName: 'Super Mario Kart',
		shortName: 'SMK',
		platform: 'switch',
		friendCodeType: FriendCodeType.Switch,
	},
});

/**
 * Immutable game metadata (display/short names, platform, friend-code type).
 * Construct via key or use the provided static getters (e.g., {@link Game.MK8dx}).
 */
export class Game {
	/** Canonical key for this game. */
	public readonly Key: GameKey;
	/** Human-friendly display name (e.g., "Mario Kart 8 Deluxe"). */
	public readonly DisplayName: string;
	/** Abbreviated name (e.g., "MK8DX"). */
	public readonly ShortName: string;
	/** Platform on which the game runs. */
	public readonly Platform: Platform;
	/** Friend code identifier type used by this game. */
	public readonly FriendCodeType: FriendCodeType;

	/**
	 * Create a {@link Game} from a key. Key is normalized; unknown keys throw.
	 * @param key Game key or reasonable variant (case/format-insensitive)
	 * @throws Error if the key is not recognized
	 */
	constructor(key: string) {
		const normalized = Game.normalizeKey(key);
		const def = getFromRegistry(normalized as GameKey, GAME_DEFINITIONS);
		if (!def) {
			throw new Error(`Unknown game key: ${key}`);
		}
		this.Key = normalized as GameKey;
		this.DisplayName = def.displayName;
		this.ShortName = def.shortName;
		this.Platform = new Platform(def.platform);
		this.FriendCodeType = def.friendCodeType;
	}

	// Utility helpers

	/** Normalize a game key (case, separators) to its canonical form. */
	static normalizeKey(key: string): string {
		return normalizeKey(key) as string;
	}

	/** Check if a key corresponds to a known game. */
	static exists(key: string): key is GameKey {
		return hasNormalizedKey(key, GAME_DEFINITIONS, Game.normalizeKey);
	}

	/** Try to get a {@link Game} from a key; returns null if unknown. */
	static tryGet(key: string): Game | null {
		return Game.exists(key) ? new Game(key) : null;
	}

	/** Get the {@link FriendCodeType} associated with a game key, if known. */
	static getFriendCodeType(key: string): FriendCodeType | undefined {
		const def = getFromRegistry(Game.normalizeKey(key) as GameKey, GAME_DEFINITIONS);
		return def?.friendCodeType;
	}

	/**
	 * Get all known games as {@link Game} objects.
	 * @returns Readonly array of all games in the registry
	 */
	static all(): ReadonlyArray<Game> {
		return mapRegistry(GAME_DEFINITIONS, (k) => new Game(k));
	}

	// Static members for each GameKey (PascalCase)
	/** Mario Kart World. */
	public static get MKWorld(): Game {
		return new Game('mkworld');
	}

	/** Mario Kart 8 Deluxe. */
	public static get MK8dx(): Game {
		return new Game('mk8dx');
	}

	/** Mario Kart 7. */
	public static get MK7(): Game {
		return new Game('mk7');
	}

	/** Mario Kart 8. */
	public static get MK8(): Game {
		return new Game('mk8');
	}

	/** Mario Kart Tour. */
	public static get MKT(): Game {
		return new Game('mkt');
	}

	/** Mario Kart Wii. */
	public static get MKW(): Game {
		return new Game('mkw');
	}

	/** Super Mario Kart. */
	public static get SMK(): Game {
		return new Game('smk');
	}
}
