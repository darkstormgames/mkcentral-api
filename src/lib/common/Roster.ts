import type { Player } from "../Player";
import type { Invite } from "../team/Invite";
import type { Team } from "../Team";
import { Game } from "./Game";
import { toBoolean } from "./Helpers";
import { GameMode } from "./GameMode";

// TODO: Consider collapsing Name <-> RosterName | TeamName and Tag <-> RosterTag | TeamTag once usage is audited.
export class Roster {
    /** Roster approval status; maps from 'approval_status' (team roster). 
    * Null when absent. */
    public ApprovalStatus: string | null;
    /** Team color; canonical field. Maps from 'color' (team roster) or 'team_color' (player roster). 
    * Null when absent. */
    public Color: number | null;
    /** Roster creation date (unix timestamp); maps from 'creation_date' (team roster). 
    * Null when absent. */
    public CreationDate: number | null;
    /** Game registry entry; maps from 'game' via Game.tryGet(key). 
    * Null when unknown or absent. */
    public Game: Game | null;
    /** Canonical roster ID; maps from 'id' (team roster) or 'roster_id' (player roster). 
    * Null when absent. */
    public Id: number | null;
    /** Whether the roster is active; maps from 'is_active' (number/boolean -> boolean). Null when absent. */
    public IsActive: boolean | null;
    /** Whether the roster is recruiting; maps from 'is_recruiting' (number/boolean -> boolean). Null when absent. */
    public IsRecruiting: boolean | null;
    /** Game mode; maps from 'mode'. Null when absent. */
    public Mode: GameMode | null;
    /** Roster name; maps from 'name'. Null when absent. */
    public Name: string | null;
    /** Roster tag; maps from 'tag'. Null when absent. */
    public Tag: string | null;
    /** Parent team ID; maps from 'team_id'. Null when absent. */
    public TeamId: number | null;
    /** Players on this roster (roster-embedded Player variant); maps from 'players'. Empty when absent. */
    public Players: Player[];
    /** Pending invites for this roster; maps from 'invites'. Empty when absent. */
    public Invites: Invite[];

    // Player roster style (aliases / additional context)

    /** Player join date to this roster (unix timestamp); maps from 'join_date'. Null when absent. */
    public JoinDate: number | null;
    /** Whether the player is under the bagger clause on this roster; maps from 'is_bagger_clause'. Null when absent. */
    public IsBaggerClause: boolean | null;
    /** Alias for roster name in player context; maps from 'roster_name', falls back to Name. Null when absent. */
    public RosterName: string | null;
    /** Alias for roster tag in player context; maps from 'roster_tag', falls back to Tag. Null when absent. */
    public RosterTag: string | null;
    /** Parent team name (player context); maps from 'team_name'. Null when absent. */
    public TeamName: string | null;
    /** Parent team tag (player context); maps from 'team_tag'. Null when absent. */
    public TeamTag: string | null;

    /** Construct from a JSON string or a plain object; normalizes snake_case fields to PascalCase with null defaults. */
    constructor(data: string | object) {
        const obj: any = typeof data === "string" ? JSON.parse(data) : (data ?? {});

        this.Game = obj.game ? Game.tryGet(obj.game) : null;
        this.Mode = obj.mode ? GameMode.tryGet(obj.mode) : null;

        // Player-context
        this.JoinDate = obj.join_date ?? null;
        this.IsBaggerClause = obj.is_bagger_clause ?? null;

        // Normalize ids and aliases across shapes (Id is canonical)
        const id = obj.id ?? obj.roster_id;
        this.Id = id ?? null;

        this.Name = obj.name ?? null;
        this.Tag = obj.tag ?? null;
        this.RosterName = obj.roster_name ?? (this.Name ?? null);
        this.RosterTag = obj.roster_tag ?? (this.Tag ?? null);

        this.TeamId = obj.team_id ?? null;
        this.TeamName = obj.team_name ?? null;
        this.TeamTag = obj.team_tag ?? null;

        this.ApprovalStatus = obj.approval_status ?? null;
        this.Color = (obj.color ?? obj.team_color) ?? null;
        this.CreationDate = obj.creation_date ?? null;
        this.IsActive =
            obj.is_active === undefined || obj.is_active === null ? null : toBoolean(obj.is_active);
        this.IsRecruiting =
            obj.is_recruiting === undefined || obj.is_recruiting === null
                ? null
                : toBoolean(obj.is_recruiting);

        // Map nested arrays with dynamic require to avoid circular deps
        const rawPlayers = Array.isArray(obj.players) ? obj.players : [];
        const rawInvites = Array.isArray(obj.invites) ? obj.invites : [];

        const PlayerCtor: any = rawPlayers.length ? require("../Player").Player : null;
        const InviteCtor: any = rawInvites.length ? require("../team/Invite").Invite : null;

        this.Players = PlayerCtor ? rawPlayers.map((p: any) => new PlayerCtor(p)) : [];
        this.Invites = InviteCtor ? rawInvites.map((i: any) => new InviteCtor(i)) : [];
    }

    /** True when the instance has team-roster context (e.g., Id/Players/ApprovalStatus present). */
    public get IsTeamContext(): boolean {
        return this.Id != null || this.Players.length > 0 || this.ApprovalStatus != null;
    }

    /** True when the instance has player-roster context (e.g., JoinDate/TeamName/TeamTag present). */
    public get IsPlayerContext(): boolean {
        return this.Id != null || this.JoinDate != null || this.TeamName != null || this.TeamTag != null;
    }

    /**
     * Load the full roster (team-context) corresponding to this roster using Team.Get(TeamId),
     * then copy team-side fields onto this instance to preserve identity.
     * 
     * Throws when TeamId is null.
     */
    public async LoadFromTeam(): Promise<void> {
        if (this.TeamId == null) {
            throw new Error("Cannot load roster from team without TeamId");
        }
        const TeamMod: any = require("../Team");
        const team = await TeamMod.Team.Get(this.TeamId);

        const targetId = this.Id ?? this.Id;
        let match: Roster | null =
            targetId != null ? (team.Rosters.find((r: Roster) => r.Id === targetId) ?? null) : null;

        if (!match) {
            const tag = this.Tag ?? this.RosterTag;
            const modeKey = this.Mode?.Key;
            match =
                team.Rosters.find(
                    (r: Roster) =>
                        (tag ? r.Tag === tag : true) &&
                        (modeKey ? (r.Mode?.Key === modeKey) : true) &&
                        (this.Game && r.Game ? r.Game === this.Game : true)
                ) ?? null;
        }

        if (match) {
            this.ApprovalStatus = match.ApprovalStatus;
            this.Color = match.Color;
            this.CreationDate = match.CreationDate;
            this.Game = match.Game;
            this.Id = match.Id;
            this.IsActive = match.IsActive;
            this.IsRecruiting = match.IsRecruiting;
            this.Mode = match.Mode;
            this.Name = match.Name;
            this.Tag = match.Tag;
            this.TeamId = match.TeamId;
            this.Players = match.Players;
            this.Invites = match.Invites;
            // Backfill player-side aliases if missing
            if (this.RosterName == null) this.RosterName = this.Name;
            if (this.RosterTag == null) this.RosterTag = this.Tag;
        }
    }

    /**
     * Load and return the owning Team object using TeamId.
     * 
     * Throws when TeamId is null.
     */
    public async LoadTeam(): Promise<Team> {
        if (this.TeamId == null) {
            throw new Error("Cannot load team without TeamId");
        }
        const TeamMod: any = require("../Team");
        return await TeamMod.Team.Get(this.TeamId);
    }
}
