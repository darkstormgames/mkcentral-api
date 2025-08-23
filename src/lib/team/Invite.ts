import { Discord } from '../player/Discord';
import { FriendCode } from '../player/FriendCode';

export class Invite {
    /** Two-letter country code */
    public CountryCode: string | null;
    /** Discord profile */
    public Discord: Discord | null;
    /** Raw friend codes array */
    public FriendCodes: FriendCode[] | null;
    /** Unix timestamp of invite date */
    public InviteDate: number | null;
    /** Bagger clause */
    public IsBaggerClause: boolean | null;
    /** Banned */
    public IsBanned: boolean | null;
    /** Player name */
    public Name: string | null;
    /** Player ID */
    public PlayerId: number | null;

    constructor(data: string | object) {
        let obj: any;
        if (typeof data === 'string') {
            obj = JSON.parse(data);
        } else {
            obj = data;
        }
        this.CountryCode = obj.country_code ?? null;
        this.Discord = obj.discord ? new Discord(obj.discord) : null;
        this.FriendCodes = Array.isArray(obj.friend_codes) ? obj.friend_codes.map((fc: any) => new FriendCode(fc)) : null;
        this.InviteDate = obj.invite_date ?? null;
        this.IsBaggerClause = obj.is_bagger_clause === undefined || obj.is_bagger_clause === null ? null : (obj.is_bagger_clause === 1 || obj.is_bagger_clause === true || obj.is_bagger_clause === '1');
        this.IsBanned = obj.is_banned === undefined || obj.is_banned === null ? null : (obj.is_banned === 1 || obj.is_banned === true || obj.is_banned === '1');
        this.Name = obj.name ?? null;
        this.PlayerId = obj.player_id ?? null;
    }
}
