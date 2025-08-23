import { CountryCode } from "./common/CountryCode";
import { toNullableBoolean } from "./common/Helpers";
import { fetchHttpsContent } from "./common/APIRequest";
import { Roster } from "./common/Roster";
import { BanInfo } from "./player/BanInfo";
import { Discord } from "./player/Discord";
import { FriendCode } from "./player/FriendCode";
import { NameChange } from "./player/NameChanges";
import type { Notes } from "./player/Notes";
import { Role } from "./player/Roles";
import { UserSettings } from "./player/UserSettings";

export enum PlayerDataKind {
	Full = "full",
	List = "list",
	Roster = "roster",
}

export class Player {
	/** Unique ID of the player */
	public Id: number | null;
	/** Player name */
	public Name: string | null;
	/** ISO-3166-1 alpha-2 country code */
	public CountryCode: CountryCode | null;

	/** Whether the player is hidden */
	public IsHidden: boolean | null;
	/** Whether the player is a shadow account */
	public IsShadow: boolean | null;
	/** Whether the player is banned */
	public IsBanned: boolean | null;

	/** Join date (unix timestamp) */
	public JoinDate: number | null;

	/** Discord info */
	public Discord: Discord | null;
	/** Friend codes */
	public FriendCodes: FriendCode[];
	/** Rosters this player is on (full/list variants) */
	public Rosters: Roster[];

	/** Ban info (null in many public contexts) */
	public BanInfo: BanInfo | null;
	/** User settings (null in many public contexts) */
	public UserSettings: UserSettings | null;
	/** Name change history */
	public NameChanges: NameChange[];
	/** Notes (Seemingly always null in public contexts) */
	public Notes: Notes | null;
	/** Roles */
	public Roles: Role[];

	/** Roster-embedded only: is leader */
	public IsLeader: boolean | null;
	/** Roster-embedded only: is manager */
	public IsManager: boolean | null;
	/** Roster-embedded only: bagger clause flag */
	public IsBaggerClause: boolean | null;

	/** Indicates which data shape was parsed */
	public DataKind: PlayerDataKind;
	/** Convenience flag for full player payloads */
	public IsFull: boolean;

	constructor(data: string | object) {
		let obj: any;
		if (typeof data === "string") {
			obj = JSON.parse(data);
		} else {
			obj = data ?? {};
		}

		// Determine which variant we're dealing with
		const looksRoster =
			("player_id" in obj && !("id" in obj)) ||
			("is_leader" in obj) ||
			("is_manager" in obj) ||
			("is_bagger_clause" in obj);

		let kind: PlayerDataKind;
		if (looksRoster) {
			kind = PlayerDataKind.Roster;
		} else {
			// ToDo: Check key availability for full/list objects
			const fullKeys = ["roles", "rosters", "ban_info", "user_settings", "name_changes", "notes"];
			const hasAllFullKeys = fullKeys.every((k) => k in obj);
			kind = hasAllFullKeys ? PlayerDataKind.Full : PlayerDataKind.List;
		}
		this.DataKind = kind;
		this.IsFull = kind === PlayerDataKind.Full;

		// Common mappings
		this.Id = obj.id ?? obj.player_id ?? null;
		this.Name = obj.name ?? null;
		this.CountryCode = (obj.country_code ?? null) as CountryCode | null;

		this.IsHidden = toNullableBoolean(obj.is_hidden);
		this.IsShadow = toNullableBoolean(obj.is_shadow);
		this.IsBanned = toNullableBoolean(obj.is_banned);

		this.JoinDate = obj.join_date ?? null;

		this.Discord = obj.discord ? new Discord(obj.discord) : null;

		this.FriendCodes = Array.isArray(obj.friend_codes)
			? obj.friend_codes.map((fc: any) => new FriendCode(fc))
			: [];

		// Roster-embedded specific flags
		this.IsLeader = toNullableBoolean(obj.is_leader);
		this.IsManager = toNullableBoolean(obj.is_manager);
		this.IsBaggerClause = toNullableBoolean(obj.is_bagger_clause);

		// Full/List specific collections and objects
		this.Rosters = Array.isArray(obj.rosters)
			? obj.rosters.map((r: any) => new Roster(r))
			: [];

		this.BanInfo = obj.ban_info ? new BanInfo(obj.ban_info) : null;
		this.UserSettings = obj.user_settings ? new UserSettings(obj.user_settings) : null;

		this.NameChanges = Array.isArray(obj.name_changes)
			? obj.name_changes.map((nc: any) => new NameChange(nc))
			: [];

		// Notes are always null publicly; avoid circular imports at runtime.
		this.Notes = null;

		// Roles can be numeric IDs, strings, or objects; Role handles all
		this.Roles = Array.isArray(obj.roles)
			? obj.roles.map((r: any) => new Role(r))
			: [];
	}

	/**
	 * Fetch a player's full profile by id and return a populated Player instance.
	 */
	public static async Get(playerId: number): Promise<Player> {
		if (playerId == null || Number.isNaN(playerId)) {
			throw new TypeError("playerId must be a valid number");
		}
		const url = `https://mkcentral.com/api/registry/players/${encodeURIComponent(playerId)}`;
		const json = await fetchHttpsContent(url);
		return new Player(json);
	}

	/**
	 * Load this player's full profile into the current instance (no object replacement).
	 * If the instance is already full, this is a no-op.
	 */
	public async Load(): Promise<void> {
		if (this.IsFull) return;
		if (this.Id == null) {
			throw new Error("Cannot load player without an Id");
		}
		const full = await Player.Get(this.Id);
		// Copy properties to preserve object identity
		this.Id = full.Id;
		this.Name = full.Name;
		this.CountryCode = full.CountryCode;
		this.IsHidden = full.IsHidden;
		this.IsShadow = full.IsShadow;
		this.IsBanned = full.IsBanned;
		this.JoinDate = full.JoinDate;
		this.Discord = full.Discord;
		this.FriendCodes = full.FriendCodes;
		this.Rosters = full.Rosters;
		this.BanInfo = full.BanInfo;
		this.UserSettings = full.UserSettings;
		this.NameChanges = full.NameChanges;
		this.Notes = full.Notes;
		this.Roles = full.Roles;
		// this.IsLeader = full.IsLeader;
		// this.IsManager = full.IsManager;
		// this.IsBaggerClause = full.IsBaggerClause;
		this.DataKind = full.DataKind;
		this.IsFull = full.IsFull;
	}
}
