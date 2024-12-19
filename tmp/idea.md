# Clutch

A TikTok style app which provides fans past video highlights, but the twist is, it shows fans what they want based on their team alongside provides a strategic insights towards the video where fan could get statistical data analysis based on the video, they could as well chat with the ai assistant for that specific video, also save the strategic for later.

I could write a video processing server which goes through all video highlights for each fan favorites and create a personalize highlights with AI. Users could selects their favorite players, and we give them first view short of that player in the generated shots.

```js
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024&gameType=R


// gameType=R (Regular Season)
// gameType=P (Postseason)
// gameType=S (Spring Training)
// gameType=E (Exhibition)
```

Purpose:

- Get list of all games
- Returns ~2,469 records for 2024 season
- Contains game IDs needed for other endpoints
- Includes basic game info (teams, scores, status)

### Team-Specific Schedule

```js
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=136&season=2024
```

Purpose:

- Get games for specific team
- Useful for user's favorite team filtering
- Contains same game data structure

### Game Content

```js
GET https://statsapi.mlb.com/api/v1/game/{gamePk}/content
```

Purpose:

- Get rich content for specific game
- Contains:
  - Editorial content
  - Images in multiple resolutions
  - Video highlights
  - Articles and recaps
  - Multilingual content

### 1. Schedule API Examples

```js
// Get all regular season games for 2024
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024&gameType=R

// Get all postseason games for 2024
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024&gameType=P

// Get games for specific date range
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=2024-04-01&endDate=2024-04-07

// Get games with detailed stats
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024&gameType=R&hydrate=stats
```

### 2. Team-Specific Schedule Examples

```js
// Get LA Dodgers schedule (teamId=119)
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&season=2024

// Get NY Yankees schedule (teamId=147) with team stats
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=147&season=2024&hydrate=team(stats)

// Get Boston Red Sox schedule (teamId=111) for specific month
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=111&startDate=2024-06-01&endDate=2024-06-30

// Get Chicago Cubs schedule (teamId=112) with game status
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=112&season=2024&fields=dates,games,status
```

### 3. Game Content Examples

```js
// Get full content for a specific game
GET https://statsapi.mlb.com/api/v1/game/716463/content

// Get content with specific language preference
GET https://statsapi.mlb.com/api/v1/game/716463/content?language=es

// Get content with specific fields (editorial only)
GET https://statsapi.mlb.com/api/v1/game/716463/content?fields=editorial

// Get content with highlights
GET https://statsapi.mlb.com/api/v1/game/716463/content?fields=highlights,media

// Get content with specific media types
GET https://statsapi.mlb.com/api/v1/game/716463/content?mediaType=video
```

### Response Examples

1. Schedule API Response Structure:

```json
{
  "copyright": "MLB Data API",
  "totalGames": 2469,
  "dates": [
    {
      "date": "2024-04-01",
      "games": [
        {
          "gamePk": 716463,
          "gameDate": "2024-04-01T20:05:00Z",
          "teams": {
            "away": {
              "team": { "id": 119, "name": "Los Angeles Dodgers" },
              "score": 5
            },
            "home": {
              "team": { "id": 147, "name": "New York Yankees" },
              "score": 3
            }
          },
          "status": {
            "abstractGameState": "Final",
            "codedGameState": "F"
          }
        }
      ]
    }
  ]
}
```

2. Team Schedule Response Structure:

```json
{
  "dates": [
    {
      "games": [
        {
          "gamePk": 716464,
          "teams": {
            "away": {
              "leagueRecord": {
                "wins": 0,
                "losses": 0
              }
            },
            "home": {
              "leagueRecord": {
                "wins": 0,
                "losses": 0
              }
            }
          },
          "venue": {
            "id": 3313,
            "name": "Yankee Stadium"
          }
        }
      ]
    }
  ]
}
```

3. Game Content Response Structure:

```json
{
  "copyright": "MLB Data API",
  "highlights": {
    "highlights": [
      {
        "type": "video",
        "id": "123456",
        "date": "2024-04-01T20:05:00Z",
        "title": "Amazing Double Play",
        "description": "Team turns two in style",
        "duration": "00:00:35",
        "playbacks": [
          {
            "url": "https://mlb-cuts-diamond.mlb.com/...",
            "playbackType": "mp4"
          }
        ]
      }
    ]
  },
  "editorial": {
    "recap": {
      "title": "Game Recap",
      "body": "Full game summary..."
    }
  }
}
```

These endpoints can be used to:

1. Get game schedules and live scores
2. Track specific teams
3. Access game highlights and content
4. Get multilingual content
5. Filter specific types of content

# MLB API Endpoints for Team Rosters and Players

## Team Roster Endpoints (List of players for a team)

```js
// Get current roster for a team
GET https://statsapi.mlb.com/api/v1/teams/144/roster

// Get roster for specific season
GET https://statsapi.mlb.com/api/v1/teams/144/roster?season=2024

// Get roster with specific roster type
GET https://statsapi.mlb.com/api/v1/teams/144/roster?rosterType=active
// rosterType options: active, fullSeason, fullRoster, depthChart

// Get roster with player stats
GET https://statsapi.mlb.com/api/v1/teams/144/roster?hydrate=person(stats(type=season))
```

```json
{
  "roster": [
    {
      "person": {
        "id": 660271,
        "fullName": "Ronald Acuña Jr.",
        "link": "/api/v1/people/660271"
      },
      "jerseyNumber": "13",
      "position": {
        "code": "9",
        "name": "Outfielder",
        "type": "Outfielder",
        "abbreviation": "OF"
      },
      "status": {
        "code": "A",
        "description": "Active"
      }
    }
    // ... more players
  ]
}
```

## Team Player Info

```js
// Get detailed player info
GET https://statsapi.mlb.com/api/v1/people/660271

// Get player with current stats
GET https://statsapi.mlb.com/api/v1/people/660271?hydrate=stats(group=[hitting,pitching],type=[season,career])

// Get player with specific season stats
GET https://statsapi.mlb.com/api/v1/people/660271?hydrate=stats(group=[hitting],type=[season],season=2024)
```

response

```json
{
  "copyright": "Copyright 2024 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
  "people": [
    {
      "id": 700363,
      "fullName": "AJ Smith-Shawver",
      "link": "/api/v1/people/700363",
      "firstName": "AJ",
      "lastName": "Smith-Shawver",
      "primaryNumber": "32",
      "birthDate": "2002-11-20",
      "currentAge": 22,
      "birthCity": "Fort Worth",
      "birthStateProvince": "TX",
      "birthCountry": "USA",
      "height": "6' 3\"",
      "weight": 205,
      "active": true,
      "primaryPosition": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "useName": "AJ",
      "useLastName": "Smith-Shawver",
      "boxscoreName": "Smith-Shawver",
      "gender": "M",
      "isPlayer": true,
      "isVerified": true,
      "draftYear": 2021,
      "mlbDebutDate": "2023-06-04",
      "batSide": {
        "code": "R",
        "description": "Right"
      },
      "pitchHand": {
        "code": "R",
        "description": "Right"
      },
      "nameFirstLast": "AJ Smith-Shawver",
      "nameSlug": "aj-smith-shawver-700363",
      "firstLastName": "AJ Smith-Shawver",
      "lastFirstName": "Smith-Shawver, AJ",
      "lastInitName": "Smith-Shawver, A",
      "initLastName": "A Smith-Shawver",
      "fullFMLName": "AJ  Smith-Shawver",
      "fullLFMName": "Smith-Shawver, AJ",
      "strikeZoneTop": 3.49,
      "strikeZoneBottom": 1.601
    }
  ]
}
```

### 2. App Data Flow

3. API Usage Strategy

   **Daily Operations**

   Poll schedule API every 5 minutes for:

   - New games
   - Score updates
   - Game status changes

   When game is completed:

   - Call content API
   - Download video highlights
   - Process with Gemini
   - Generate clips

4. Content Processing Pipeline

   **Game Discovery**

   - Schedule API → Get game IDs
   - Filter by status "Final"
   - Queue for content fetch

   **Content Retrieval**

   - Content API → Get highlights
   - Download videos
   - Extract metadata

   **Video Processing**

   - Extract transcripts
   - Generate timestamps
   - Send to Gemini

   **Feed Management**

   - Store processed clips
   - Index for search
   - Cache popular content

5. Scheduling API Response

```js
{
    "dates": [{
        "games": [{
            "gamePk": "Game ID for content API",
            "gameDate": "For chronological ordering",
            "teams": {
                "away/home": {
                    "team": {
                        "id": "For team filtering",
                        "name": "For display"
                    }
                }
            },
            "status": "For determining completed games"
        }]
    }]
}
```

6. Content API Response
   Important fields:

```js
{
    "editorial": {
        "recap": {
            "mlb": {
                "headline": "For clip title",
                "image": {
                    "cuts": "Various image sizes",
                },
                "body": "For generating context",
                "keywordsAll": "For categorization"
            }
        }
    },
    "media": {
        "videoUrls": "For highlight clips",
        "duration": "For clip length",
        "timestamp": "For synchronization"
    }
}
```

## GAME TEAMS STRUCTURE

```javascript
// When fetching game data
const gameTeams = {
  gamePk: 746606,
  teams: {
    home: {
      id: 114,
      name: "Cleveland Guardians",
      abbreviation: "CLE",
    },
    away: {
      id: 110,
      name: "Baltimore Orioles",
      abbreviation: "BAL",
    },
  },
};

// UI Display Structure
const gameDisplay = {
  gamePk: 746606,
  matchup: {
    teams: [
      { id: 114, name: "Cleveland Guardians", type: "home" },
      { id: 110, name: "Baltimore Orioles", type: "away" },
    ],
    score: {
      home: 5,
      away: 2,
    },
  },
};

// Backend Processing
const processGameHighlights = (gameData, userPreferences) => {
  const gameTeamIds = [gameData.teams.home.id, gameData.teams.away.id];
  const relevantTeams = userPreferences.teams.filter((teamId) =>
    gameTeamIds.includes(teamId)
  );

  // User might be interested in either or both teams
  return {
    gamePk: gameData.gamePk,
    relevantTeams,
  };
};
```

This structure allows:

1. Clear display of both teams in a game
2. Easy filtering of highlights by team
3. Support for users following either/both teams
4. Proper attribution of highlights to specific teams

## Video Processing Workflow

```javascript
// 1. Game Collection Layer
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024&gameType=R
↓
Extract: gamePk, teams (home/away)

// 2. Team & Player Layer
GET https://statsapi.mlb.com/api/v1/teams/{teamId}/roster
↓
Extract: player IDs, positions

// 3. Content Layer
GET https://statsapi.mlb.com/api/v1/game/{gamePk}/content
↓
Extract: highlights, video URLs
```

## Database Schema

```sql
-- Core Tables
CREATE TABLE games (
    game_guid UUID PRIMARY KEY,
    game_pk INTEGER NOT NULL,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    game_date DATE NOT NULL,
    game_type CHAR(1) NOT NULL,  -- R, P, S, E
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE highlights (
    highlight_id UUID PRIMARY KEY,
    game_guid UUID REFERENCES games(game_guid),
    player_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    video_url TEXT NOT NULL,
    processing_status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Cache Tables (Optional)
CREATE TABLE player_stats_cache (
    player_id INTEGER PRIMARY KEY,
    stats_data JSONB,
    last_updated TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE team_info_cache (
    team_id INTEGER PRIMARY KEY,
    team_data JSONB,
    last_updated TIMESTAMP,
    expires_at TIMESTAMP
);
```

## Processing Queue Structure

```javascript
{
    "job_id": "uuid",
    "game_guid": "uuid",
    "highlights": [
        {
            "highlight_id": "uuid",
            "video_url": "https://..../video.mp4",
            "player_id": 123456,
            "team_id": 789
        }
    ],
    "status": "pending",
    "created_at": "2024-12-14T23:00:00Z"
}
```

## Cache Strategy

```javascript
// Cache
{
    "frequently_accessed": [
        "player_basic_stats",
        "team_info",
        "recent_game_summaries (last 24h)"
    ],

    "fetch_on_demand": [
        "full_game_details",
        "complete_player_statistics",
        "editorial_content"
    ],

    "cache_duration": {
        "player_stats": "6h",
        "team_info": "24h",
        "game_summaries": "1h"
    }
}
```

```json
// Priority Queue System
{
  "priority_1": "Most recent games (last 7 days)",
  "priority_2": "Most popular highlights (based on stats/views)",
  "priority_3": "Player signature moments",
  "priority_4": "Remaining content"
}
```

## DATA NEEDED

```js
// Core Data Structure

// 1. Teams Collection
{
    "teams": {
        "id": 114,
        "name": "Cleveland Guardians",
        "abbreviation": "CLE",
        "league": "American League",
        "division": "Central",
        "stats": {
            "wins": 67,
            "losses": 44,
            "winningPercentage": ".604"
        }
    }
}

// 2. Players Collection
{
    "players": {
        "id": 680757,
        "fullName": "Steven Kwan",
        "team_id": 114,
        "primaryPosition": {
            "name": "Outfielder",
            "abbreviation": "LF"
        },
        "stats": {
            "batting": {
                "avg": ".285",
                "hr": 12,
                "rbi": 45
            }
        }
    }
}

// 3. Highlights Collection
{
    "highlights": {
        "id": "uuid",
        "player_id": 680757,
        "team_id": 114,
        "video_url": "https://..../video.mp4",
        "processed_url": "https://..../processed.mp4",
        "metadata": {
            "game_date": "2024-08-04",
            "play_type": "home_run",
            "description": "Solo home run to right field"
        },
        "processing_status": "completed"
    }
}

// 4. Processing Queue
{
    "processing_queue": {
        "job_id": "uuid",
        "player_id": 680757,
        "team_id": 114,
        "video_url": "https://..../video.mp4",
        "status": "pending",
        "created_at": "2024-12-14T23:00:00Z"
    }
}
```

## OPTIMIZED API FLOW

```javascript
// 1. Live Game API Flow
GET https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live
{
    "gameData": {
        "teams": {
            "away": { /* complete team info */ },
            "home": { /* complete team info */ }
        },
        "players": {
            "ID680757": { /* complete player info */ }
        }
    }
}

// 2. Player Images API Options

// Option 1: MLB Photos API (Primary)
GET https://img.mlbstatic.com/mlb-photos/image/upload/w_{size},d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/{player_id}/headshot/silo/current

// Available parameters:
// - w_{size}: width (e.g., w_60, w_213, w_426)
// - q_auto:best: automatic quality optimization
// - f_auto: automatic format selection

// Example URL:
// https://img.mlbstatic.com/mlb-photos/image/upload/w_60,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/656775/headshot/silo/current


// 3. Content API Flow (using same gamePk)
GET https://statsapi.mlb.com/api/v1/game/{game_pk}/content
{
    "highlights": {
        "items": [
            {
                "type": "video",
                "playbacks": [
                    { "url": "https://..../video.mp4" }
                ],
                "keywordsAll": [
                    { "type": "player_id", "value": "680757" },
                    { "type": "team_id", "value": "114" }
                ]
            }
        ]
    }
}

// 4. Processing Flow
const processingFlow = {
    "step1": "Get live game data (teams + players)",
    "step2": "Get content using same gamePk",
    "step3": "Filter highlights by player_id",
    "step4": "Process videos and store with metadata"
}

// 5. Storage Strategy
const storageStrategy = {
    "teams": "Store complete team info from live game API",
    "players": "Store complete player info from live game API",
    "highlights": "Store processed videos with player/team context",
    "metadata": "Link highlights to specific games and plays"
}
```

- Loop through each games,
- select one that hasn't been processed
- save game metadata in db
- get live game data
- for each teams within live game data (home and away), store the team info
- for each teams within live game data (home and away), get team members/rosters and save info in DB. (account for duplicates)

This optimized flow:

1. Reduces API calls
2. Gets complete data in fewer steps
3. Maintains player-team relationships
4. Simplifies video processing pipeline

## BgJob Flow

- Create a scheduler which runs every 30min
- The scheduler will fetch new games from the MLB API and other necessary data
- For each game

- We processed each gamePK contents since all player are tagged to specific game content.
- The highlights section within the game contents have multiple items, for each items have mp4 playback I could leverage this and process them individually.
- Once the metadata have been saved in DB, we trigger the processing job to get this data. for each playback we slice out, we trigger the processing job based on the number of playback video, i.e
  5playbacks -> 5 bgJobs. processed video are stored in DB with {GAME_PK}-{UUID}.mp4
