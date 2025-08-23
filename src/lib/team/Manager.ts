import { toNullableBoolean } from '../common/Helpers';
import { Discord } from '../player/Discord';

export class Manager {
    /** Two-letter country code */
    public CountryCode: string | null;
    /** Discord profile */
    public Discord: Discord | null;
    /** Unique ID of the manager */
    public Id: number | null;
    /** Is Manager Banned */
    public IsBanned: boolean | null;
    /** Is Manager Hidden */
    public IsHidden: boolean | null;
    /** Is Manager Shadow User */
    public IsShadow: boolean | null;
    /** Unix timestamp of join date */
    public JoinDate: number | null;
    /** Manager name */
    public Name: string | null;

    constructor(data: string | object) {
        let obj: any;
        if (typeof data === 'string') {
            obj = JSON.parse(data);
        } else {
            obj = data;
        }
        this.CountryCode = obj.country_code ?? null;
        this.Discord = obj.discord ? new Discord(obj.discord) : null;
        this.Id = obj.id ?? null;
        // Convert 0/1 (or boolean) to boolean, keep null when absent
        this.IsBanned = obj.is_banned === undefined || obj.is_banned === null ? null : (obj.is_banned === 1 || obj.is_banned === true || obj.is_banned === '1');
        this.IsHidden = obj.is_hidden === undefined || obj.is_hidden === null ? null : (obj.is_hidden === 1 || obj.is_hidden === true || obj.is_hidden === '1');
        this.IsShadow = obj.is_shadow === undefined || obj.is_shadow === null ? null : (obj.is_shadow === 1 || obj.is_shadow === true || obj.is_shadow === '1');
        this.JoinDate = obj.join_date ?? null;
        this.Name = obj.name ?? null;
    }
}
