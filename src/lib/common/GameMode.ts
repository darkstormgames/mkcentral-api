import { getFromRegistry, hasNormalizedKey, mapRegistry, normalizeKey } from './Helpers';

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

type GameModeDefinition = {
	readonly displayName: string;
	readonly shortName: string;
};

// Central mode registry (single source of truth)
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

export class GameMode {
	public readonly Key: GameModeKey;
	public readonly DisplayName: string;
	public readonly ShortName: string;

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

	static normalizeKey(key: string): string {
		return normalizeKey(key) as string;
	}

	static exists(key: string): key is GameModeKey {
		return hasNormalizedKey(key, MODE_DEFINITIONS, GameMode.normalizeKey);
	}

	static tryGet(key: string): GameMode | null {
		return GameMode.exists(key) ? new GameMode(key) : null;
	}

	static all(): ReadonlyArray<GameMode> {
		return mapRegistry(MODE_DEFINITIONS, (k) => new GameMode(k));
	}
}
