export class Discord {
    /** Discord user ID */
    public DiscordId: string;
    /** Discord username */
    public Username: string;
    /** Discord discriminator */
    public Discriminator: string;
    /** Discord global name (optional) */
    public GlobalName: string | null;
    /** Discord avatar hash (optional) */
    public Avatar: string | null;

    constructor(data: string | object) {
        let obj: any;
        if (typeof data === 'string') {
            obj = JSON.parse(data);
        } else {
            obj = data;
        }
        this.DiscordId = obj.discord_id;
        this.Username = obj.username;
        this.Discriminator = obj.discriminator;
        this.GlobalName = obj.global_name ?? null;
        this.Avatar = obj.avatar ?? null;
    }
}