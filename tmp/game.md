# Game structure

### (4-pics-one-word)

Here's what I think the structure to look like:

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
