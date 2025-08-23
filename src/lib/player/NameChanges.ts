export class NameChange {
    /** Unique ID of the name change */
    public Id: number | null;
    /** Unix timestamp of the change */
    public Date: number | null;
    /** The previous player name */
    public OldName: string | null;
    /** The new player name */
    public NewName: string | null;
    /** Approval status of the change */
    public ApprovalStatus: string | null;

    constructor(data: string | object) {
        let obj: any;
        if (typeof data === 'string') {
            obj = JSON.parse(data);
        } else {
            obj = data;
        }
        this.Id = obj.id ?? null;
        this.Date = obj.date ?? null;
        this.OldName = obj.old_name ?? null;
        this.NewName = obj.new_name ?? null;
        this.ApprovalStatus = obj.approval_status ?? null;
    }
}
