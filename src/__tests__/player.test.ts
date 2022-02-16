import { Player, Players } from '../index';

/**
 * Checking data in a basic player request
 */
test('Player data direct', (done) => {
  Player.Get(1655).then((player) => {
    expect(player.Name).toBe('Rollo');
    expect(player.SwitchFC).toBe('4678-1807-6386');
    expect(player.IsSupporter).toBe(true);
    expect(player.IsModerator).toBe(false);
    done();
  });
});

/**
 * Checking current teams in a player
 */
test('Current teams in Player', (done) => {
  Player.Get(1655).then((player) => {
    if (player.CurrentTeams) {
      expect(player.CurrentTeams.length).toBe(1);
      expect(player.CurrentTeams[0].ModeKey).toBe('mk8dx_150');
    } else {
      fail('Current teams should not be undefined!');
    }
    done();
  });
});

/**
 * Intensive testing of players with defined Options object
 */
test('Players by options', (done) => {
  let playerOptions = new Players.Options({
    Category: Players.Options.Category.ALL,
    Country: Players.Options.Country.Japan,
    Order: Players.Options.Order.NAME_DESC,
    Search: 'Mars',
  });
  Players.Get(playerOptions).then((players) => {
    expect(players.Count).toBeGreaterThan(0);
    expect(players.length).toBe(players.Count);
    expect(players[0].IsBanned).toBeUndefined();
    expect(players[0].Name).toMatch(/[mM][aA][rR][sS]/);
    expect(players[0].CountryCode).toBe('JP');
    players[0].Load().then(() => {
      expect(players[0].IsBanned).toBeDefined();
      done();
    });
  });
});

/**
 * Quick testing of players by search string
 */
test('Players by search string', (done) => {
  Players.Get('Rollo').then((players) => {
    expect(players.Count).toBeGreaterThanOrEqual(1);
    expect(players.length).toBe(players.Count);
    done();
  });
});
