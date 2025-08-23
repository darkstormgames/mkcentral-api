# mkcentral-api

TypeScript/Node.js SDK for Mario Kart Central’s public API.

Public entry points: `Player`, `Players`, `Team`, `Teams`. Filters: `PlayerFilter`, `TeamFilter`. Registries: `CountryCode`, `Game`, `GameMode`, `Language`, `Platform`.

## Installation

Requires Node.js 16+.

```bash
npm install mkcentral-api
```

## Quick start

CommonJS:

```js
const { Player, Players, Team, Teams } = require('mkcentral-api');

// Get a single player by id
(async () => {
  const player = await Player.Get(1655);
  console.log(player.Name);

  // Search players by name
  const results = await Players.Get('Rollo');
  console.log(`Found ${results.Count} players`);

  // Get a team by id
  const team = await Team.Get(35);
  console.log(`${team.Name} [${team.Tag}]`);
})();
```

ESM/TypeScript:

```ts
import { Player, Players, Team, Teams } from 'mkcentral-api';

const p = await Player.Get(1655);
console.log(p.Name);
```

## Beginner-friendly examples

These mirror what’s in `src/examples.ts` and use the current API surface.

### Players

- Search by name:

```ts
const players = await Players.Get('Rollo');
console.log(`Found ${players.Count}`);
if (players.length) {
  console.log(`${players[0].Name} (ID: ${players[0].Id})`);
}
```

- Get by id and inspect details:

```ts
const player = await Player.Get(1655);
console.log(player.Name);
console.log(player.CountryCode);
console.log(player.Discord?.Username);
console.log(`#FCs: ${player.FriendCodes.length}`);
console.log(`#Rosters: ${player.Rosters.length}`);
```

- Filter with `PlayerFilter` (or `new Players.Filter(...)`):

```ts
const filter = new Players.Filter({
  Country: Players.CountryCode.Germany,
  NameOrFC: 'Alex',
  Page: 1,
});
const filtered = await Players.Get(filter);
console.log(`Total matching players: ${filtered.PlayerCount}`);
console.log(`Pages: ${filtered.PageCount}`);
```

- Hydrate a partial player to full using `Load()`:

```ts
const list = await Players.Get('Alex');
if (list.length) {
  const partial = list[0];
  await partial.Load();
  console.log(`Loaded ${partial.Rosters.length} rosters`);
}
```

- Pagination helpers on the list:

```ts
const page1 = await Players.Get(new Players.Filter({ NameOrFC: 'Anna', Page: 1 }));
console.log(`Page 1 count: ${page1.length}`);
if (await page1.LoadNextPage()) {
  console.log(`Page 2 count: ${page1.length}`);
}

// Load everything
const all = await Players.Get(new Players.Filter({ Country: Players.CountryCode.Chile }));
await all.LoadAllPages();
console.log(`Total Chilean players: ${all.length}`);
```

### Teams

- Search by name/tag and get by id:

```ts
const teamsByName = await Teams.Get('HD');
console.log(`Found ${teamsByName.Count} teams`);

const team = await Team.Get(35);
console.log(`${team.Name} [${team.Tag}]`);
console.log(`Managers: ${team.Managers.length}`);
console.log(`#Rosters: ${team.Rosters.length}`);
```

- Filter with `TeamFilter` (or `new Teams.Filter(...)`):

```ts
const tf = new Teams.Filter({
  NameOrTag: 'Racing',
  Game: Teams.Game.MK8dx,
  Mode: Teams.GameMode.CC150,
  Language: Teams.Language.EnglishSimplified,
  Page: 1,
});
const filteredTeams = await Teams.Get(tf);
console.log(`Total teams: ${filteredTeams.TeamCount}`);
console.log(`Page 1 shows: ${filteredTeams.Count}`);
```

- Hydrate team and inspect roster players:

```ts
const partialTeams = await Teams.Get('Test');
if (partialTeams.length) {
  const t = partialTeams[0];
  await t.Load();
  for (const r of t.Rosters) {
    console.log(`${r.Game?.DisplayName} ${r.Mode} — players: ${r.Players?.length ?? 0}`);
  }
}
```

- Pagination and load-all helpers:

```ts
const teamPages = await Teams.Get(new Teams.Filter({ Page: 1 }));
console.log(`Pages: ${teamPages.PageCount}`);
if (await teamPages.LoadNextPage()) {
  console.log(`Page 2 teams: ${teamPages.Count}`);
}

const all200cc = await Teams.Get(new Teams.Filter({ Game: Teams.Game.MK8dx, Mode: Teams.GameMode.CC200 }));
await all200cc.LoadAllPages();
console.log(`Total 200cc teams: ${all200cc.Count}`);
```

## Error handling

Network and HTTP issues surface as typed errors. Catch them as needed:

```ts
try {
  await Player.Get(99999999);
} catch (err) {
  console.log('Failed to fetch player:', (err as Error).message);
}
```

## Development (repo)

- Build: `npm run build` (emits to `dist/`)
- Test: `npm test` (hits live MKC endpoints; needs internet)
- Lint/format: `npm run lint`, `npm run format`

Run the bundled examples locally:

```bash
npm install
npm run build
node dist/examples.js
```

## Notes

- `Players.Get(filter|string)` and `Teams.Get(filter|string)` build API URLs and set sensible defaults (detailed results, page=1, etc.).
- `Load()` on `Player`/`Team` preserves object identity and fills in full details.
- Remote asset paths are normalized to absolute HTTPS URLs when applicable.
