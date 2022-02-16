import { Team, Teams } from '../index';

test('Team data direct', (done) => {
  Team.Get(1064).then((team) => {
    expect(team.Name).toBe('Project HIVE Academia');
    expect(team.FoundingDateHuman).toBe('Oct 22, 2020');
    expect(team.Rosters?.['150cc']?.ModeKey).toBe('150cc');
    done();
  });
});

/**
 * Checking current teams in a player
 */
test('Current players in Team', (done) => {
  Team.Get(1064).then((team) => {
    if (team.Rosters && team.Rosters['150cc']) {
      expect(team.Rosters['150cc'].ModeKey).toBe('150cc');
      for (let member of team.Rosters['150cc'].Members) {
        if (member.Id == 7922) {
          expect(member.Name).toBe('Xyros');
          member.GetPlayer().then((player) => {
            expect(player.ProfilePictureBorderColor).toBe(60);
            expect(player.ProfileMessage).toBe('Bin a geiler bub');
            done();
          });
        }
      }
    } else {
      fail('Current teams should not be undefined!');
    }
  });
});

/**
 * Intensive testing of players with defined Options object
 */
test('Teams by options', (done) => {
  let playerOptions = new Teams.Options({
    Category: Teams.Options.Category.ALL,
    Language: Teams.Options.Language.FRENCH,
    Order: Teams.Options.Order.NAME_DESC,
    Search: 'Ron',
  });
  Teams.Get(playerOptions).then((teams) => {
    expect(teams.Count).toBeGreaterThan(0);
    expect(teams.length).toBe(teams.Count);
    expect(teams[0].Logo).toBeUndefined();
    expect(teams[0].Name).toMatch(/[rR][oO][nN]/);
    teams[0].Load().then(() => {
      expect(teams[0].Logo).toBeDefined();
      expect(teams[0].MainLanguage).toBe('French');
      done();
    });
  });
});

/**
 * Quick testing of players by search string
 */
test('Teams by search string', (done) => {
  Teams.Get('HIVE').then((teams) => {
    expect(teams.Count).toBeGreaterThanOrEqual(1);
    expect(teams.length).toBe(teams.Count);
    done();
  });
});
