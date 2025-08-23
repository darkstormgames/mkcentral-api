import { FriendCodeType } from '../player/FriendCode';
import { Platform, PlatformKey } from './Platform';
import { getFromRegistry, hasNormalizedKey, mapRegistry, normalizeKey } from './Helpers';

export type GameKey = 'mkworld' | 'mk8dx' | 'mk7' | 'mk8' | 'mkt' | 'mkw' | 'smk';

type GameDefinition = {
	readonly displayName: string;
	readonly shortName: string;
	readonly platform: PlatformKey;
	readonly friendCodeType: FriendCodeType;
};

// Central game registry (single source of truth)
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

export class Game {
	public readonly Key: GameKey;
	public readonly DisplayName: string;
	public readonly ShortName: string;
	public readonly Platform: Platform;
	public readonly FriendCodeType: FriendCodeType;

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

	static normalizeKey(key: string): string {
		return normalizeKey(key) as string;
	}

	static exists(key: string): key is GameKey {
		return hasNormalizedKey(key, GAME_DEFINITIONS, Game.normalizeKey);
	}

	static tryGet(key: string): Game | null {
		return Game.exists(key) ? new Game(key) : null;
	}

	static getFriendCodeType(key: string): FriendCodeType | undefined {
		const def = getFromRegistry(Game.normalizeKey(key) as GameKey, GAME_DEFINITIONS);
		return def?.friendCodeType;
	}

	static all(): ReadonlyArray<Game> {
		return mapRegistry(GAME_DEFINITIONS, (k) => new Game(k));
	}
}
