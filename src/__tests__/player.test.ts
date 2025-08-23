import { Players } from '../index';
import { Player, PlayerDataKind } from '../lib/Player';
import { PlayerFilter } from '../lib/player/PlayerFilter';
import { CountryCode } from '../lib/common/CountryCode';
import { Roster } from '../lib/common/Roster';
import { FriendCode, FriendCodeType } from '../lib/player/FriendCode';
import { Role } from '../lib/player/Roles';
import { Discord } from '../lib/player/Discord';
import { BanInfo } from '../lib/player/BanInfo';
import { NameChange } from '../lib/player/NameChanges';
import { UserSettings } from '../lib/player/UserSettings';
import { Game } from '../lib/common/Game';
import { Platform } from '../lib/common/Platform';
import { toBoolean, toNullableBoolean } from '../lib/common/Helpers';
import * as APIRequest from '../lib/common/APIRequest';

// Live tests may take longer
jest.setTimeout(20000);

// Players module tests (live)
describe('Players', () => {
  test('Get with search string parses list (live)', async () => {
    const result = await Players.Get('Rollo');
    expect(result.length).toBe(result.Count);
    if (result.length) {
      expect(result[0]).toBeInstanceOf(Player);
      expect(result[0]).toHaveProperty('Id');
      expect(typeof result[0].Name === 'string' || result[0].Name === null).toBe(true);
    }
  });

  test('Get with options object (live)', async () => {
    const filter = new PlayerFilter({ Country: CountryCode.Germany, NameOrFC: 'Rollo' });
    const result = await Players.Get(filter);
    expect(result.length).toBe(result.Count);
  });

  test('instance Load refreshes contents and preserves identity (live)', async () => {
    const initial = await Players.Get('Rollo');
    const same = initial;
    expect(typeof same.Count).toBe('number');
    // Call via prototype for robust Array subclassing
    await (Players.prototype.Load as any).call(same);
    expect(same).toBe(initial);
    expect(same.length).toBe(same.Count);
  });
});

// Player module tests (live)
describe('Player', () => {
  test('Get 1655 (Rollo) live: full payload', async () => {
    const p = await Player.Get(1655);
    expect(p).toBeInstanceOf(Player);
    expect(p.Id).toBe(1655);
    expect(p.IsFull).toBe(true);
    expect(p.DataKind).toBe(PlayerDataKind.Full);
    expect(Array.isArray(p.Rosters)).toBe(true);
  });

  test('Get 183 (Alex) live: not banned or shadow', async () => {
    const p = await Player.Get(183);
    expect(p.Id).toBe(183);
    expect(p.IsBanned).toBe(false);
    expect(p.IsShadow).toBe(false);
  });

  test('Get 43083 (ABC12345) live: banned', async () => {
    const p = await Player.Get(43083);
    expect(p.Id).toBe(43083);
    expect(p.IsBanned).toBe(true);
  });

  test('Get 3214 (Agosta) live: shadow', async () => {
    const p = await Player.Get(3214);
    expect(p.Id).toBe(3214);
    expect(p.IsShadow).toBe(true);
  });

  test('Load populates non-full instance in-place (uses live Get)', async () => {
    const listShape = new Player({ id: 1655, name: 'Temp' });
    expect(listShape.IsFull).toBe(false);
    await listShape.Load();
    expect(listShape.Id).toBe(1655);
    expect(listShape.IsFull).toBe(true);
  });
});

// Sanity tests for referenced classes (no network)
describe('Referenced classes sanity', () => {
  test('PlayerFilter: Default and ToQueryString', () => {
    const f = PlayerFilter.Default();
    const qs = f.ToQueryString();
    const u = new URL('https://x.test/?' + qs);
    expect(u.searchParams.get('detailed')).toBe('true');
    expect(u.searchParams.get('matching_fcs_only')).toBe('true');
    // Default false flags are omitted in the filter string
    expect(u.searchParams.get('is_banned')).toBeNull();
    expect(u.searchParams.get('page')).toBe('1');
  });

  test('FriendCode mapping', () => {
    const fc = new FriendCode({ id: 10, fc: '1111-2222-3333', type: 'switch', player_id: 1, is_verified: true, is_primary: false, creation_date: 1, description: 'alt', is_active: true });
    expect(fc.Id).toBe(10);
    expect(fc.Fc).toBe('1111-2222-3333');
    expect(fc.Type).toBe(FriendCodeType.Switch);
    expect(fc.Description).toBe('alt');
  });

  test('Role mapping from object, number, and string', () => {
    const r1 = new Role({ id: 1, name: 'Admin', position: 0 });
    const r2 = new Role(7);
    const r3 = new Role('Moderator');
    expect(r1.Id).toBe(1);
    expect(r2.Id).toBe(7);
    expect(r3.Name).toBe('Moderator');
  });

  test('Discord mapping', () => {
    const d = new Discord({ discord_id: 'abc', username: 'user', discriminator: '1234', global_name: null, avatar: null });
    expect(d.DiscordId).toBe('abc');
    expect(d.Username).toBe('user');
  });

  test('BanInfo mapping', () => {
    const b = new BanInfo({ is_indefinite: null, player_id: 2, reason: 'test', unban_date: null });
    expect(b.PlayerId).toBe(2);
    expect(b.Reason).toBe('test');
  });

  test('NameChange mapping', () => {
    const nc = new NameChange({ id: 1, date: 2, old_name: 'A', new_name: 'B', approval_status: 'approved' });
    expect(nc.OldName).toBe('A');
    expect(nc.NewName).toBe('B');
  });

  test('Roster mapping and Game.tryGet', () => {
    const r = new Roster({ game: 'mk8dx', mode: '150', join_date: 1, is_bagger_clause: false, roster_id: 1, roster_name: 'X', roster_tag: 'XX', team_id: 99, team_name: 'Team', team_tag: 'TT', team_color: 123 });
    expect(r.Game?.Key).toBe('mk8dx');
    expect(r.TeamName).toBe('Team');
  });

  test('UserSettings AvatarImage uses https and caches result (spy to avoid download)', async () => {
    const us = new UserSettings({ user_id: 1, avatar: '/avatars/a.png', about_me: '', language: 'en-us', color_scheme: 'dark', timezone: 'UTC', hide_discord: false });
    const buf = Buffer.from('img');
    const spy = jest.spyOn(APIRequest, 'fetchHttpsBuffer').mockResolvedValueOnce(buf);
    const b1 = await us.AvatarImage;
    const b2 = await us.AvatarImage; // cached
    expect(b1).toBe(buf);
    expect(b2).toBe(buf);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('https://mkcentral.com/avatars/a.png');
    spy.mockRestore();
  });

  test('Helpers toBoolean/toNullableBoolean', () => {
    expect(toBoolean('true')).toBe(true);
    expect(toBoolean('1')).toBe(true);
    expect(toBoolean(0)).toBe(false);
    expect(toNullableBoolean(undefined)).toBeNull();
    expect(toNullableBoolean('false')).toBe(false);
  });

  test('Game and Platform registries', () => {
    expect(Game.getFriendCodeType('mk8dx')).toBe(FriendCodeType.Switch);
    const g = new Game('MK7');
    expect(g.Platform.DisplayName).toMatch(/3DS/i);
    expect(Platform.tryGet('wiiu')?.Key).toBe('wiiu');
    expect(new Platform('??').Key).toBe('unknown');
  });
});
