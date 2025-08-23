export class FriendCode {
    /** Unique friend code ID */
    public Id: number;
    /** Friend code string */
    public Fc: string;
    /** Friend code type */
    public Type: FriendCodeType;
    /** Player ID */
    public PlayerId: number;
    /** Whether the code is verified */
    public IsVerified: boolean;
    /** Whether the code is primary */
    public IsPrimary: boolean;
    /** Creation date (epoch seconds) */
    public CreationDate: number;
    /** Optional description */
    public Description: string | null;
    /** Whether the code is active */
    public IsActive: boolean;

    constructor(data: string | object) {
        let obj: any;
        if (typeof data === 'string') {
            obj = JSON.parse(data);
        } else {
            obj = data;
        }
        this.Id = obj.id;
        this.Fc = obj.fc;
        this.Type = obj.type as FriendCodeType;
        this.PlayerId = obj.player_id;
        this.IsVerified = obj.is_verified;
        this.IsPrimary = obj.is_primary;
        this.CreationDate = obj.creation_date;
        this.Description = obj.description ?? null;
        this.IsActive = obj.is_active ?? true;
    }
}

export enum FriendCodeType {
    Switch = "switch",
    NNID = "nnid",
    ThreeDS = "3ds",
    MKW = "mkw",
    MKT = "mkt",
}

// Map moved to Game.ts (use Game.getFriendCodeType or new Game(key).FriendCodeType)
// export const GameFCMap ... removed.
//     'mkworld': FriendCodeType.Switch,
//     'mk8dx': FriendCodeType.Switch,
//     'mk7': FriendCodeType.ThreeDS,
//     'mk8': FriendCodeType.NNID,
//     'mkt': FriendCodeType.MKT,
//     'mkw': FriendCodeType.MKW,
//     'smk': FriendCodeType.Switch,
// }
