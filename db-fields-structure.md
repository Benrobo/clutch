## Teams

```json
// league
{
  "id": 115,
  "name": "Grapefruit League",
  "abbreviation": "GL"
}

// division
```

## Games

```json
// decisions
{
  "winner": {
    "id": 669203,
    "fullName": "Corbin Burnes"
  },
  "loser": {
    "id": 668909,
    "fullName": "Gavin Williams"
  }
}
```

## Players

```json
// stats
{
  "batSide": {
    "code": "R",
    "description": "Right"
  },
  "pitchHand": {
    "code": "R",
    "description": "Right"
  }
}
```

## Highlights

```json

// description -> gotten from highlights -> items -> -> description (API based)
// title -> gotten from highlights -> items -> -> title (API based)
```

## Chat Messages

```js
// sources
[
  {
    title: "",
    description: "",
    url: "",
    favicon: "",
    site_name: "",
  },
];
```

## Matchups

```js
// highlights
{
  comparisonHighlights: [
    {
      title: "", // questions
      players: {
        challenger: {
          id: "",
          stats: [
            {
              key: "", // stats key
              value: ""
            }
          ],
          visualization: {
            percentage: 0,
            trend: "up" | "down"
          }
        },
        opponent: {
          id: "",
          stats: [
            {
              key: "", // stats key
              value: ""
            }
          ],
          visualization: {
            percentage: 0,
            trend: "up" | "down"
          }
        }
      },
      insight: "",
      source: {
        url: "",
        title: ""
      }
    }
  ],
  playerOfTheDay: {
    player_id: "",
    reason: ""
  }
}
```

## Player Position Stats

```js
{
  challenger:{
    position: "",
    stats: [
      {} // MLB API based
    ]
  },
  opponent: {
    position: "",
    stats: [
      {} // MLB API based
    ]
  }
}
```

The player's info and stats would be gotten from MLB API before sending the final structure to client.
