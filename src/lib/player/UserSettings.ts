import { Language } from "../common/Language";
import { fetchHttpsBuffer } from "../common/APIRequest";

export class UserSettings {
	/** User ID */
	public UserId: number;
	/** Avatar URL */
	public Avatar: string;
	/** About Me text */
	public AboutMe: string;
	/** Language code */
	public Language: Language;
	/** Color scheme */
	public ColorScheme: string;
	/** Timezone */
	public Timezone: string;
	/** Hide Discord flag */
	public HideDiscord: boolean;

	// Cache to avoid re-downloading
	private _avatarImage?: Buffer;
	private _avatarImagePromise?: Promise<Buffer>;

	constructor(data: string | object) {
		let obj: any;
		if (typeof data === 'string') {
			obj = JSON.parse(data);
		} else {
			obj = data;
		}
		this.UserId = obj.user_id;
		this.Avatar = obj.avatar;
		this.AboutMe = obj.about_me;
		this.Language = obj.language;
		this.ColorScheme = obj.color_scheme;
		this.Timezone = obj.timezone;
		this.HideDiscord = obj.hide_discord;
	}

	public get AvatarImage(): Promise<Buffer> {
		if (this._avatarImage) return Promise.resolve(this._avatarImage);
		if (this._avatarImagePromise) return this._avatarImagePromise;

		if (!this.Avatar) {
			return Promise.reject(new Error("No avatar URL available."));
		}

		const url = /^https?:\/\//i.test(this.Avatar) ? this.Avatar : `https://mkcentral.com${this.Avatar}`;

		this._avatarImagePromise = fetchHttpsBuffer(url)
			.then((buf) => {
				this._avatarImage = buf;
				return buf;
			})
			.finally(() => {
				this._avatarImagePromise = undefined;
			});

		return this._avatarImagePromise;
	}
}

