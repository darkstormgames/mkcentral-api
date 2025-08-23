import { URL } from 'node:url';
import { fetchHttpsContent } from './common/APIRequest';
import { Team } from './Team';
import { TeamFilter } from './team/TeamFilter';
import { Game } from './common/Game';
import { GameMode } from './common/GameMode';
import { Language } from './common/Language';

/**
 * Teams is a typed array of Team items with extra metadata from the API.
 * Mirrors the structure and behavior of Players.
 */
export class Teams extends Array<Team> {
    /** Number of teams contained in this instance (equals length). */
    public Count: number;
    /** Total number of teams available across result set (from API team_count or count). */
    public TeamCount?: number;
    /** Total number of pages (from API page_count). */
    public PageCount?: number;

    /** Filter used to produce this list when refreshed via instance Load(). */
    public Filter: TeamFilter;

    constructor(rawData?: string) {
        super();
        this.Filter = TeamFilter.Default();

        if (!rawData) {
            this.Count = 0;
            return;
        }

        const parsed: any = rawData ? JSON.parse(rawData) : null;

        // Support multiple possible shapes: team_list (preferred), data (legacy), or teams
        const list = Array.isArray(parsed?.team_list)
            ? parsed.team_list
            : Array.isArray(parsed?.data)
                ? parsed.data
                : Array.isArray(parsed?.teams)
                    ? parsed.teams
                    : [];

        for (const item of list) this.push(new Team(item));

        this.Count = this.length;
        const countFallback = typeof parsed?.count === 'number' ? parsed.count : this.length;
        this.TeamCount = typeof parsed?.team_count === 'number' ? parsed.team_count : countFallback;
        this.PageCount = typeof parsed?.page_count === 'number' ? parsed.page_count : undefined;
    }

    /** Refresh this instance using its Filter to fetch fresh data. */
    public async Load(): Promise<void> {
        const uri = Teams.buildURL(this.Filter);
        const result = new Teams(await fetchHttpsContent(uri));
        // Replace contents while preserving this instance
        this.length = 0;
        for (const t of result) this.push(t);
        this.Count = result.Count;
        this.TeamCount = result.TeamCount;
        this.PageCount = result.PageCount;
        // Ensure pagination state has a defined page
        if (typeof this.Filter.Page !== 'number' || this.Filter.Page < 1) this.Filter.Page = 1;
    }

    /**
     * Reload the list with the next page, if available.
     * Returns true if the page advanced and data was loaded; false if already at last page.
     */
    public async LoadNextPage(): Promise<boolean> {
        const current = typeof this.Filter?.Page === 'number' && this.Filter.Page > 0 ? this.Filter.Page : 1;
        if (typeof this.PageCount === 'number' && current >= this.PageCount) return false;
        this.Filter.Page = current + 1;
        await this.Load();
        return true;
    }

    /**
     * Reload the list with the previous page, if available.
     * Returns true if the page moved back and data was loaded; false if already at page 1.
     */
    public async LoadPreviousPage(): Promise<boolean> {
        const current = typeof this.Filter?.Page === 'number' && this.Filter.Page > 0 ? this.Filter.Page : 1;
        if (current <= 1) return false;
        this.Filter.Page = current - 1;
        await this.Load();
        return true;
    }

    /**
     * Load all entries from every available page into this instance.
     * Aggregates results across pages for the current filter and replaces the list contents.
     */
    public async LoadAllPages(): Promise<void> {
        const base = this.Filter ?? TeamFilter.Default();
        const tempFilter = new TeamFilter(base as unknown as Partial<TeamFilter>);
        const all: Team[] = [];

        let page = 1;
        let pageCount: number | undefined;
        let teamCount: number | undefined;

        while (true) {
            tempFilter.Page = page;
            const uri = Teams.buildURL(tempFilter);
            const chunk = new Teams(await fetchHttpsContent(uri));

            if (page === 1) {
                pageCount = chunk.PageCount;
                teamCount = chunk.TeamCount;
            }

            if (chunk.length === 0) break;

            for (const t of chunk) all.push(t);

            if (typeof pageCount === 'number' && page >= pageCount) break;
            page++;
        }

        // Replace contents while preserving identity
        this.length = 0;
        for (const t of all) this.push(t);
        this.Count = this.length;
        this.TeamCount = typeof teamCount === 'number' ? teamCount : this.length;
        this.PageCount = pageCount;
        // After aggregating, normalize page to 1 for the filter
        this.Filter.Page = 1;
    }

    /**
     * Perform a teams query and return a new Teams instance.
     * - If arg is a string, it is used as the 'name_or_tag' query.
     * - If arg is a filter, use its fields.
     */
    public static async Get(arg?: TeamFilter | Partial<TeamFilter> | string): Promise<Teams> {
        let filter: TeamFilter;
        if (typeof arg === 'string') {
            filter = TeamFilter.Default();
            const s = arg.trim();
            if (s.length > 0) filter.NameOrTag = s;
        } else {
            filter = arg instanceof TeamFilter ? arg : new TeamFilter(arg as Partial<TeamFilter>);
        }

        const uri = Teams.buildURL(filter);
        const res = new Teams(await fetchHttpsContent(uri));
		// Ensure prototype is set correctly (fixes Array subclass issues)
		Object.setPrototypeOf(res, Teams.prototype);
		if (typeof filter.Page !== 'number' || filter.Page < 1) filter.Page = 1;
        res.Filter = filter;
        return res;
    }

    private static buildURL(filter: TeamFilter): URL {
        const uri = new URL('https://mkcentral.com/api/registry/teams');
        const qs = filter.ToQueryString();
        if (qs) uri.search = qs;
		if (!uri.searchParams.has('is_historical')) uri.searchParams.set('is_historical', 'false');
		if (!uri.searchParams.has('is_active')) uri.searchParams.set('is_active', 'true');
		if (!uri.searchParams.has('sort_by_newest')) uri.searchParams.set('sort_by_newest', 'false');
		if (!uri.searchParams.has('min_player_count')) uri.searchParams.set('min_player_count', '6');
        if (!uri.searchParams.has('page')) uri.searchParams.set('page', '1');
        return uri;
    }

    public static readonly Filter = TeamFilter;
    public static readonly Item = Team;
    public static readonly Game = Game;
    public static readonly GameMode = GameMode;
    public static readonly Language = Language;
}
