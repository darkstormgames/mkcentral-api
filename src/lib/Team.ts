import { fetchHttpsContent } from './common/APIRequest';
import { toBoolean } from './common/Helpers';
import { Roster } from './common/Roster';
import { Manager } from './team/Manager';
import { Approval } from './team/Approval';
import { Language } from './common/Language';
import { Game } from './common/Game';
import { GameMode } from './common/GameMode';

export enum TeamDataKind {
    Full = 'full',
    List = 'list',
}

export class Team {
    /** Unique team ID */
    public Id: number | null;
    /** Team name */
    public Name: string | null;
    /** Team tag */
    public Tag: string | null;

    /** Approval status */
    public ApprovalStatus: Approval | null;
    /** Team color */
    public Color: number | null;
    /** Creation date (unix timestamp) */
    public CreationDate: number | null;
    /** Team description */
    public Description: string | null;
    /** Historical flag */
    public IsHistorical: boolean | null;
    /** Main language */
    public Language: string | null;
    /** Logo URL (normalized to https absolute if possible) */
    public Logo: string | null;

    /** Managers */
    public Managers: Manager[];
    /** Rosters with players and invites */
    public Rosters: Roster[];

    /** Indicates which data shape was parsed */
    public DataKind: TeamDataKind;
    /** Convenience flag mirroring Player style */
    public IsFull: boolean;

    constructor(data: string | object) {
        const obj: any = typeof data === 'string' ? JSON.parse(data) : (data ?? {});

        // Determine list vs full variant by probing roster-embedded player flags
        // If any roster player carries is_leader/is_manager/is_bagger_clause, treat as Full
        const rosterPlayers = Array.isArray(obj.rosters)
            ? obj.rosters.flatMap((r: any) => (Array.isArray(r?.players) ? r.players : []))
            : [];
        const hasRosterEmbeddedFlags = rosterPlayers.some(
            (p: any) =>
                p &&
                (typeof p === 'object') &&
                ('is_leader' in p || 'is_manager' in p || 'is_bagger_clause' in p)
        );
        this.DataKind = hasRosterEmbeddedFlags ? TeamDataKind.Full : TeamDataKind.List;
        this.IsFull = this.DataKind === TeamDataKind.Full;

        this.Id = obj.id ?? null;
        this.Name = obj.name ?? null;
        this.Tag = obj.tag ?? null;

        const approvalRaw: string | null =
            typeof obj.approval_status === 'string' ? obj.approval_status.toLowerCase() : null;
        this.ApprovalStatus =
            approvalRaw === Approval.Approved ||
                approvalRaw === Approval.Pending ||
                approvalRaw === Approval.Denied
                ? (approvalRaw as Approval)
                : null;
        this.Color = obj.color ?? null;
        this.CreationDate = obj.creation_date ?? null;
        this.Description = obj.description ?? null;

        // Keep null when absent; otherwise coerce 0/1, "0"/"1", true/false
        this.IsHistorical = obj.is_historical === undefined || obj.is_historical === null
            ? null
            : toBoolean(obj.is_historical);

        this.Language = obj.language ?? null;
        this.Logo = Team.normalizeLogo(obj.logo);

        this.Managers = Array.isArray(obj.managers) ? obj.managers.map((m: any) => new Manager(m)) : [];
        this.Rosters = Array.isArray(obj.rosters) ? obj.rosters.map((r: any) => new Roster(r)) : [];
    }

    private static normalizeLogo(v: any): string | null {
        const s = typeof v === 'string' ? v : null;
        if (!s) return null;
        if (s.startsWith('http://')) return 'https://' + s.slice('http://'.length);
        if (s.startsWith('https://')) return s;
        if (s.startsWith('/')) return `https://mkcentral.com${s}`;
        return s;
    }

    /** Fetch a team by ID and return a populated Team instance. */
    public static async Get(teamId: number): Promise<Team> {
        if (teamId == null || Number.isNaN(teamId)) {
            throw new TypeError('teamId must be a valid number');
        }
        const url = `https://mkcentral.com/api/registry/teams/${encodeURIComponent(teamId)}`;
        try {
            const json = await fetchHttpsContent(url);
            const trimmed = typeof json === 'string' ? json.trim() : '';
            if (!trimmed || trimmed === 'null') {
                throw new Error(
                    `Team with id ${teamId} was not found or no data was returned from the API`
                );
            }
            return new Team(json);
        } catch (err: any) {
            if (err && err.name === 'HTTPError' && err.statusCode === 404) {
                err.message = `Team with id ${teamId} was not found (404)`;
            }
            throw err;
        }
    }

    /** Load this team's full profile into the current instance (no object replacement). */
    public async Load(): Promise<void> {
        if (this.IsFull) return;
        if (this.Id == null) {
            throw new Error('Cannot load team without an Id');
        }
        const full = await Team.Get(this.Id);
        // Copy properties to preserve object identity
        this.Id = full.Id;
        this.Name = full.Name;
        this.Tag = full.Tag;
        this.ApprovalStatus = full.ApprovalStatus;
        this.Color = full.Color;
        this.CreationDate = full.CreationDate;
        this.Description = full.Description;
        this.IsHistorical = full.IsHistorical;
        this.Language = full.Language;
        this.Logo = full.Logo;
        this.Managers = full.Managers;
        this.Rosters = full.Rosters;
        this.DataKind = full.DataKind;
        this.IsFull = full.IsFull;
    }

    // Namespaced static exports for convenient access
    public static readonly Manager = Manager;
    public static readonly Approval = Approval;
    public static readonly Roster = Roster;
    public static readonly Language = Language;
    public static readonly Game = Game;
    public static readonly GameMode = GameMode;
}
