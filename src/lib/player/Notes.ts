import { Player } from "../Player";

export class Notes {
	/** Notes text */
	public Notes: string;
	/** Player who edited the notes (optional) */
	public EditedBy: Player | null;
	/** Edit date (unix timestamp) */
	public Date: number;

	constructor(data: string | object) {
		let obj: any;
		if (typeof data === 'string') {
			obj = JSON.parse(data);
		} else {
			obj = data;
		}
		this.Notes = obj.notes;
		this.EditedBy = obj.edited_by ? new Player(obj.edited_by) : null;
		this.Date = obj.date;
	}
}
