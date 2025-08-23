export class Role {
    /** Unique ID of the role */
    public Id: number | null;
    /** Role name */
    public Name: string | null;
    /** Role position/sort order */
    public Position: number | null;

    constructor(data: string | number | object) {
        let obj: any;

        if (typeof data === 'string') {
            // Try JSON first (to match Discord.ts style); fallback to plain role name
            try {
                obj = JSON.parse(data);
            } catch {
                obj = { name: data };
            }
        } else {
            obj = data;
        }

        if (typeof obj === 'number') {
            this.Id = obj;
            this.Name = null;
            this.Position = null;
            return;
        }

        this.Id = obj?.id ?? null;
        this.Name = obj?.name ?? null;
        this.Position = obj?.position ?? null;
    }
}
