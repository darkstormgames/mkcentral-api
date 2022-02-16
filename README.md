# mkcentral-api
A simple API wrapper for the Mario Kart Central website for NodeJS.

## Installation

Node.js 16.0.0 or newer is required.

```
npm install mkcentral-api
```

## Usage 

### Get a single player or team by id
```js
const MKC = require('mkcentral-api');

// When not in an async function, use the ".then(()=>{})"-syntax
MKC.Player.Get(1655)
  .then(player => {
    console.log(player.Name);
  });
  
MKC.Team.Get(1064)
  .then(team => {
    console.log(team.Tag);
  });

// Inside async functions, just use await
const player = await MKC.Player.Get(1655);
console.log(player.Name);

const team = await MKC.Team.Get(1064);
console.log(team.Tag);
```

### Get a list of players with filters
```js
const { Players } = require('mkcentral-api');

// You can leave out any unwanted filter/options
  // Default Options:
  //  - Category: ALL
  //  - Country: ALL
  //  - Order: NAME_ASC
  //  - Search: ''
const playerOptions = new Players.Options({
  Category: Players.Options.Category.ALL,
  Country: Players.Options.Country.Germany,
  Order: Players.Options.Order.NAME_DESC,
  Search: 'Rollo'
});
let players = await Players.Get(playerOptions);
console.log(players.Count);

// Alternatively, just search by name
players = await Players.Get('Mars');
console.log(players.Count);

// The Players object can be accessed just like any array and contains Player objects, that are not fully loaded
if (players.length > 0) {
  console.log(players[0].Name);
  console.log(players[0].IsBanned); // prints undefined
  await players[0].Load();
  console.log(players[0].IsBanned); // prints true or false
}
```

### Get a list of teams with filters
```js
const { Teams } = require('mkcentral-api');

// You can leave out any unwanted filter/options
  // Default Options:
  //  - Category: ACTIVE
  //  - Language: ALL
  //  - Order: NAME_ASC
  //  - Search: ''
const teamOptions = new Teams.Options({
  Category: Teams.Options.Category.ALL,
  Country: Teams.Options.Country.Germany,
  Order: Teams.Options.Order.NAME_DESC,
  Search: 'HIVE'
});
let teams = await Teams.Get(teamOptions);
console.log(teams.Count);

// Alternatively, just search by name
teams = await Teams.Get('HIVE');
console.log(teams.Count);

// The Teams object can be accessed just like any array and contains Team objects, that are not fully loaded
if (teams.length > 0) {
  console.log(teams[0].Name);
  console.log(teams[0].Category); // prints undefined
  await teams[0].Load();
  console.log(teams[0].Category); // prints the category (150cc, etc.)
}
```

## ToDo:

* Add registration history to Player
* Add tournament history to Player
* Get player count of all rosters in a team without duplicates
* Add tournament history to Team
* Add events (resource-heavy because of the lack of filtering...)
