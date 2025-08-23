# mkcentral-api — AI contributor guide

This repo is a TypeScript Node.js library that wraps the Mario Kart Central public APIs. The public entry is `src/index.ts`, exporting `Players`, `Player`, and `Team`.

## Architecture overview
- Core models: `src/lib/Player.ts`, `src/lib/Players.ts`, `src/lib/Team.ts`.
  - Constructors accept a JSON string or a plain object and normalize to public properties (PascalCase) with sensible nulls.
  - “Load” methods update the current instance in place (preserve identity), rather than creating a new object.
- HTTP layer: `src/lib/common/APIRequest.ts`.
  - Only HTTPS is allowed; includes `InvalidURLError`, `NetworkError`, `HTTPError` and a 15s timeout.
  - `fetchHttpsContent(url)` returns text; `fetchHttpsBuffer(url)` returns Buffer.
- Player querying: `src/lib/Players.ts` + `src/lib/player/PlayerFilter.ts`.
  - `Players.Get(filter | string)` builds a `URL` with query params from `PlayerFilter.ToQueryString()` and adds default flags: `detailed=true`, `matching_fcs_only=true`, `is_banned=false`, `is_hidden=false`, `is_shadow=false`, `page=1` (if not present).
  - Response mapping: `player_list -> Player[]`, with pagination metadata on `Players` (`Count`, `PlayerCount`, `PageCount`).
- Registries and helpers:
  - `src/lib/common/Game.ts`, `Platform.ts` use normalized registries; see `normalizeKey`, `getFromRegistry` in `Helpers.ts`.
  - `Game.tryGet(key)` returns null for unknown keys. `Game.getFriendCodeType(key)` maps to `FriendCodeType`.

## Modeling conventions (follow when adding fields/types)
- Constructors accept `string | object`; if string, `JSON.parse` then map.
- Use PascalCase public properties; map from snake_case response keys. Example from `Player`:
  - `obj.is_banned -> IsBanned` using `toNullableBoolean` when tri-state; `toBoolean` for strict booleans.
- Prefer `null` for absent/unknown values over `undefined` to keep shapes predictable.
- Roster variants: `Player` sets `DataKind` to `Full | List | Roster` by probing keys; roster-embedded flags (`IsLeader`, `IsManager`, `IsBaggerClause`) are only set for roster data.
- Preserve identity in `Load()` methods: copy fields from freshly fetched object back onto `this` rather than replacing the instance.

## Query/build rules (important when extending)
- Build URLs with the standard `URL` API; set defaults only if the param is not already present (see `Players.buildURL`).
- `PlayerFilter.ToQueryString()` omits null/undefined/false; booleans serialize as `'true'` only.
- Keep HTTPS absolute URLs for remote assets; if API returns a relative path (e.g., avatar), prefix with `https://mkcentral.com` (see `UserSettings.AvatarImage`).

## Error handling and network
- Do not introduce external HTTP libs; use `node:https` via `APIRequest`.
- Propagate typed errors (`InvalidURLError`, `NetworkError`, `HTTPError`) so callers/tests can distinguish cases.
- Avoid increasing network surface in tests—prefer spies (see `player.test.ts` mocking `fetchHttpsBuffer`).

## Public API surface (keep stable)
- `src/index.ts` exports: `Players`, `Player`, `Team`.
- Adding new exports requires updating `src/index.ts` and ensuring types emit to `dist/`.

## Developer workflows
- Build: `npm run build` (tsc to `dist/`, strict mode, CJS, ES5 target).
- Test: `npm test` (Jest 27 + ts-jest; see `jestconfig.json`). Tests hit live MKC endpoints; internet required and may be flaky—keep timeouts reasonable (see `jest.setTimeout(20000)`).
- Lint/format: `npm run lint` (TSLint) and `npm run format` (Prettier). Prepublish runs tests and lint.

## Examples to emulate
- Fetch a full player: `await Player.Get(1655)` — parse to `Player` with `IsFull = true` and populated collections.
- Search players: `await Players.Get('Rollo')` — returns `Players` array-like with `Count`, then `await players[0].Load()` to hydrate.
- Map friend code types and games: `Game.tryGet('mk8dx')?.FriendCodeType` and `Platform.tryGet('wiiu')`.

## Where to look when extending
- Add new player/team fields: update `Player.ts` or `Team.ts`, mirror snake_case to PascalCase, use helpers, and add minimal tests in `src/__tests__`.
- New filters: extend `PlayerFilter` and ensure `ToQueryString` + `Players.buildURL` defaults interact correctly.
- Avoid circular imports (e.g., `Player.Notes` left null intentionally).

## Notes
- Dev helper: `src/helpers/MKCentralEndpoints.ts` is a CLI to inspect API shapes; it's not part of the published API.
- Legacy sources: `src/lib/legacy/**` are historical and not wired to current exports.

Questions or gaps? If any section is unclear (e.g., adding team list queries, legacy folders, or handling new MKC endpoints), tell me what you plan to add and I’ll refine this guide accordingly.
