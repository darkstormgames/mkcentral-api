import { Team, Teams } from '../index';
import { Approval } from '../lib/team/Approval';
import { TeamFilter } from '../lib/team/TeamFilter';
import { GameMode } from '../lib/common/GameMode';
import { Game } from '../lib/common/Game';

// Live tests may take longer (hits mkcentral.com)
jest.setTimeout(20000);

// A stable live Team ID with rich data
const LIVE_TEAM_ID = 35; // Wii Elite Clan

describe('Team (live)', () => {
	test('Get full team by id returns normalized data', async () => {
		const t = await Team.Get(LIVE_TEAM_ID);
		expect(t).toBeInstanceOf(Team);
		expect(t.Id).toBe(LIVE_TEAM_ID);
		expect(t.Name).toBe('Wii Elite Clan');
		expect(t.Tag).toBe('WEC');
		expect(t.ApprovalStatus).toBe(Approval.Approved);
		expect(t.IsFull).toBe(true);
		expect(t.Language).toBe('de');
		expect(typeof t.CreationDate).toBe('number');
		expect(t.Color).toBe(21);
		expect(t.IsHistorical).toBe(false);
		expect(t.Logo).toMatch(/^https:\/\//);

		// Rosters present with parsed modes/games and roster-embedded players
		expect(Array.isArray(t.Rosters)).toBe(true);
		expect(t.Rosters.length).toBeGreaterThan(0);
		const has150 = t.Rosters.some((r) => r.Mode?.Key === '150cc');
		expect(has150).toBe(true);
		const anyRosterWithPlayers = t.Rosters.some((r) => Array.isArray(r.Players) && r.Players.length > 0);
		expect(anyRosterWithPlayers).toBe(true);
	});

	test('Load populates a non-full instance in place', async () => {
		// Construct a minimal list-shaped team instance
		const partial = new Team({ id: LIVE_TEAM_ID, name: 'Temp', tag: 'TMP' });
		expect(partial.IsFull).toBe(false);
		const sameRef = partial;
		await partial.Load();
		expect(partial).toBe(sameRef); // identity preserved
		expect(partial.IsFull).toBe(true);
		expect(partial.Name).toBe('Wii Elite Clan');
		expect(partial.Tag).toBe('WEC');
		expect(partial.Rosters.length).toBeGreaterThan(0);
	});
});

describe('Teams (live)', () => {
	test('Get by search string returns list items and allows per-item Load', async () => {
		const teams = await Teams.Get('WEC');
		expect(teams.length).toBe(teams.Count);
		if (teams.length > 0) {
			const item = teams[0];
			expect(item).toBeInstanceOf(Team);
			expect(typeof item.Id === 'number' || item.Id === null).toBe(true);
			// List items are typically not full until Load()
			expect(item.IsFull).toBe(false);
			await item.Load();
			expect(item.IsFull).toBe(true);
			expect(item.Rosters.length).toBeGreaterThan(0);
		}
	});

	test('instance Load refreshes the list and preserves identity', async () => {
		const teams = await Teams.Get(new TeamFilter({ NameOrTag: 'WEC', Page: 1 }));
		const same = teams;
		expect(teams.Count).toBe(teams.length);
		await (Teams.prototype.Load as any).call(same);
		expect(same).toBe(teams);
		expect(same.Count).toBe(same.length);
		expect(typeof same.Filter.Page).toBe('number');
	});
});

describe('TeamFilter and helpers (no network)', () => {
	test('Default filter ToQueryString has page=1 and omits false/nulls', () => {
		const f = TeamFilter.Default();
		const qs = f.ToQueryString();
		const u = new URL('https://x.test/?' + qs);
		expect(u.searchParams.get('page')).toBe('1');
		expect(u.searchParams.get('sort_by_newest')).toBeNull(); // false is omitted
		expect(u.searchParams.get('name')).toBeNull();
		expect(u.searchParams.get('name_or_tag')).toBeNull();
	});

	test('Filter serializes Game/Mode and booleans as expected', () => {
		const f = new TeamFilter({ Game: Game.tryGet('mk8dx'), Mode: GameMode.tryGet('150cc'), IsRecruiting: true, Page: 2 });
		const qs = f.ToQueryString();
		const u = new URL('https://x.test/?' + qs);
		expect(u.searchParams.get('game')).toBe('mk8dx');
		expect(u.searchParams.get('mode')).toBe('150cc');
		expect(u.searchParams.get('is_recruiting')).toBe('true');
		expect(u.searchParams.get('page')).toBe('2');
	});

	test('Team constructor normalizes Logo to https and absolute', () => {
		const t1 = new Team({ id: 1, logo: '/avatars/a.png' });
		expect(t1.Logo).toBe('https://mkcentral.com/avatars/a.png');
		const t2 = new Team({ id: 2, logo: 'http://example.com/x.png' });
		expect(t2.Logo).toBe('https://example.com/x.png');
		const t3 = new Team({ id: 3, logo: 'https://static.example.com/y.png' });
		expect(t3.Logo).toBe('https://static.example.com/y.png');
	});
});
