import { URL } from 'node:url';
import { fetchHttpsContent } from './common/APIRequest';
import { Player } from './Player';
import { PlayerFilter } from './player/PlayerFilter';

/**
 * Players is a typed array of Player items with extra metadata from the API.
 * Uses PlayerFilter for querying.
 */
export class Players extends Array<Player> {
	/** Number of players contained in this instance (equals length). */
	public Count: number;
	/** Total number of players available across result set (from API player_count). */
	public PlayerCount?: number;
	/** Total number of pages (from API page_count). */
	public PageCount?: number;

	/** Filter used to produce this list when refreshed via instance Get(). */
	public Filter: PlayerFilter;

	constructor(rawData?: string) {
		super();
		this.Filter = PlayerFilter.Default();

		if (!rawData) {
			this.Count = 0;
			return;
		}

		const parsed: any = JSON.parse(rawData);
		const list = Array.isArray(parsed.player_list) ? parsed.player_list : [];

		for (const item of list) this.push(new Player(item));

		this.Count = this.length;
		this.PlayerCount = typeof parsed.player_count === 'number' ? parsed.player_count : this.length;
		this.PageCount = typeof parsed.page_count === 'number' ? parsed.page_count : undefined;
	}

	/** Refresh this instance using its Filter to fetch fresh data. */
	public async Load(): Promise<void> {
		const uri = Players.buildURL(this.Filter);
		const result = new Players(await fetchHttpsContent(uri));
		// Replace contents while preserving this instance
		this.length = 0;
		for (const p of result) this.push(p);
		this.Count = result.Count;
		this.PlayerCount = result.PlayerCount;
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
		const base = this.Filter ?? PlayerFilter.Default();
		const tempFilter = new PlayerFilter(base as unknown as Partial<PlayerFilter>);
		const all: Player[] = [];

		let page = 1;
		let pageCount: number | undefined;
		let playerCount: number | undefined;

		while (true) {
			tempFilter.Page = page;
			const uri = Players.buildURL(tempFilter);
			const chunk = new Players(await fetchHttpsContent(uri));

			if (page === 1) {
				pageCount = chunk.PageCount;
				playerCount = chunk.PlayerCount;
			}

			if (chunk.length === 0) break;

			for (const p of chunk) all.push(p);

			if (typeof pageCount === 'number' && page >= pageCount) break;
			page++;
		}

		// Replace contents while preserving identity
		this.length = 0;
		for (const p of all) this.push(p);
		this.Count = this.length;
		this.PlayerCount = typeof playerCount === 'number' ? playerCount : this.length;
		this.PageCount = pageCount;

		// After aggregating, normalize page to 1 for the filter
		this.Filter.Page = 1;
	}

	/**
	 * Perform a players query and return a new Players instance
	 */
	public static async Get(arg?: PlayerFilter | Partial<PlayerFilter> | string): Promise<Players> {
		let filter: PlayerFilter;

		if (typeof arg === 'string') {
			filter = PlayerFilter.Default();
			const s = arg.trim();
			if (s.length > 0) filter.NameOrFC = s;
		} else {
			filter = arg instanceof PlayerFilter ? arg : new PlayerFilter(arg as Partial<PlayerFilter>);
		}

		const uri = Players.buildURL(filter);
		const res = new Players(await fetchHttpsContent(uri));
		// Ensure prototype is set correctly (fixes Array subclass issues)
		Object.setPrototypeOf(res, Players.prototype);
		if (typeof filter.Page !== 'number' || filter.Page < 1) filter.Page = 1;
		res.Filter = filter;
		return res;
	}

	private static buildURL(filter: PlayerFilter): URL {
		const uri = new URL('https://mkcentral.com/api/registry/players');
		const qs = filter.ToQueryString();
		if (qs) {
			// The URL constructor doesn't have a nice bulk setter for params; append directly
			uri.search = qs;
		}
		if (!uri.searchParams.has('detailed')) uri.searchParams.set('detailed', 'true');
		if (!uri.searchParams.has('matching_fcs_only')) uri.searchParams.set('matching_fcs_only', 'true');
		if (!uri.searchParams.has('is_banned')) uri.searchParams.set('is_banned', 'false');
		if (!uri.searchParams.has('is_hidden')) uri.searchParams.set('is_hidden', 'false');
		if (!uri.searchParams.has('is_shadow')) uri.searchParams.set('is_shadow', 'false');
		if (!uri.searchParams.has('page')) uri.searchParams.set('page', '1');
		return uri;
	}
}

