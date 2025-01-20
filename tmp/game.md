# Game structure

### (4-pics-one-word)

Here's what I think the structure should look like:

### Base Structure

```json
{
    "id": "SHORT-UUID",
    "secret": {
        "word": "homerun",
        "display": "Homerun"
    },
    "media": [
        {
            "type": "image",
            "url": "/4-pic-one-word/house",
            "description": "An image of a house"
        },
        {
            "type": "image",
            "url": "/4-pic-one-word/runner",
            "description": "A person running"
        },
        {
            "type": "image",
            "url": "/4-pic-one-word/baseball",
            "description": "A baseball lying on the ground"
        },
        {
            "type": "image",
            "url": "/4-pic-one-word/swing",
            "description": "A player swinging a bat"
        }
    ]
}

// OR

{
    "id": "SHORT-UUID",
    "secret": {
        "word": "homerun",
        "display": "Homerun"
    },
    "media": [
        {
            "type": "video",
            "url": "/4-pic-one-word/homerun-action",
            "description": "A video showing a baseball player hitting a home run and running the bases"
        }
    ]
}

```

### Level 1

```json
[
    {
        "id"
    }
]
```

### Common IMage names:

```js
[
  "batter",
  "baseball",
  "pitcher",
  "plate",
  "catcher",
  "mitt",
  "helmet",
  "scoreboard",
  "numbers",
  "team",
  "stadium",
  "runner",
  "mistake",
  "fence",
  "crowd",
  "third-base",
  "field",
  "player",
  "calendar",
  "history",
  "graph",
  "percentage",
  "victory",
  "playoffs",
  "celebration",
  "game",
  "save",
  "runs",
  "average",
  "hit",
  "walk",
  "rate",
  "strike",
  "call",
  "spin",
];
```

## DB MODELS

```js
model user {
    id          String          @id @default(cuid())
    name        String
    email       String          @unique
    created_at  DateTime       @default(now())
    game_progress dugout_game_progress[] // Relation to track progress in various dugout games
}

model dugout_game_progress {
    id                String   @id @default(cuid())
    user_id           String
    game_name         String   // Name of the dugout game (e.g., "4-pic-one-word", "Quiz")
    level             GameLevel // Current level as an enum
    total_challenges  Int?     // Total challenges in the level (optional)
    completed_challenges Int?   // Challenges answered correctly (optional)
    created_at        DateTime @default(now())

    user user @relation(fields: [user_id], references: [id])
}

model user_progress {
    id          String   @id @default(cuid())
    user_id     String
    game_name   String   // Name of the dugout game
    score       Int      // Score based on performance
    created_at  DateTime @default(now())

    user user @relation(fields: [user_id], references: [id])
}

// Enum for game levels
enum GameLevel {
    APPRENTICE
    INTERMEDIATE
    ADVANCED
    EXPERT
}
```

For now, Hint Usage would be preserved on the client side in localstorage.
