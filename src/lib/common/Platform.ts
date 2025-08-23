import { getFromRegistry, hasNormalizedKey, mapRegistry, normalizeKey } from './Helpers';

export type PlatformKey = 'switch' | '3ds' | 'wiiu' | 'wii' | 'mobile' | 'snes' | 'unknown';

type PlatformDefinition = {
    readonly key: PlatformKey;
    readonly displayName: string;
};

const PLATFORM_DEFINITIONS: Readonly<Record<PlatformKey, PlatformDefinition>> = Object.freeze({
    switch: { key: 'switch', displayName: 'Nintendo Switch' },
    '3ds': { key: '3ds', displayName: 'Nintendo 3DS' },
    wiiu: { key: 'wiiu', displayName: 'Wii U' },
    wii: { key: 'wii', displayName: 'Wii' },
    mobile: { key: 'mobile', displayName: 'Mobile' },
    snes: { key: 'snes', displayName: 'Super Nintendo' },
    unknown: { key: 'unknown', displayName: 'Unknown' },
});

export class Platform {
    public readonly Key: PlatformKey;
    public readonly DisplayName: string;

    constructor(key: string) {
        const normalized = Platform.normalizeKey(key) as PlatformKey;
        const def = getFromRegistry(normalized, PLATFORM_DEFINITIONS) ?? PLATFORM_DEFINITIONS.unknown;
        this.Key = def.key;
        this.DisplayName = def.displayName;
    }

    static normalizeKey(key: string): PlatformKey {
        return normalizeKey(key) as PlatformKey;
    }

    static exists(key: string): key is PlatformKey {
        return hasNormalizedKey(key, PLATFORM_DEFINITIONS, Platform.normalizeKey);
    }

    static tryGet(key: string): Platform | null {
        return Platform.exists(key) ? new Platform(key) : null;
    }

    static all(): ReadonlyArray<Platform> {
        return mapRegistry(PLATFORM_DEFINITIONS, (k) => new Platform(k));
    }
}
