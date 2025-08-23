export class BanInfo {
    /** 
    * Whether the ban is indefinite
    * Is always null in a public context
    */
    public IsIndefinite: boolean | null;
    /** ID of the banned player */
    public PlayerId: number;
    /** Reason for the ban */
    public Reason: string;
    /** 
    * Unix timestamp for when the ban ends
    * Is always null in a public context
    */
    public UnbanDate: number | null;

    constructor(data: string | object) {
        let obj: any;
        if (typeof data === 'string') {
            obj = JSON.parse(data);
        } else {
            obj = data;
        }
        this.IsIndefinite = obj.is_indefinite ?? null;
        this.PlayerId = obj.player_id;
        this.Reason = obj.reason;
        this.UnbanDate = obj.unban_date ?? null;
    }
}