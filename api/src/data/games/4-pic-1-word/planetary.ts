import { FourPicOneWordChallenges } from "../../../types/dugout.types.js";

const PLANETARY_GAME_DATA = [
  {
    id: 1,
    secret: {
      word: "at-bat",
      display: "At Bat",
    },
    definition: "A player's turn to hit the ball against the pitcher.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/batter.jpg",
        description: "A batter",
      },
      {
        type: "image",
        url: "/4-pic-1-word/baseball.jpeg",
        description: "A baseball",
      },
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/plate.jpeg",
        description: "Home plate",
      },
    ],
  },
  {
    id: 2,
    secret: {
      word: "catcher",
      display: "Catcher",
    },
    definition: "The player positioned behind home plate who receives pitches.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/catcher.jpg",
        description: "A catcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/mitt.jpeg",
        description: "A mitt",
      },
      {
        type: "image",
        url: "/4-pic-1-word/helmet.jpg",
        description: "A helmet",
      },
      {
        type: "image",
        url: "/4-pic-1-word/plate.jpeg",
        description: "Home plate",
      },
    ],
  },
  {
    id: 3,
    secret: {
      word: "game-score",
      display: "Game Score",
    },
    definition: "The total points accumulated by teams during a game.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/scoreboard.jpg",
        description: "A scoreboard",
      },
      {
        type: "image",
        url: "/4-pic-1-word/numbers.webp",
        description: "Numbers",
      },
      {
        type: "image",
        url: "/4-pic-1-word/team.webp",
        description: "A team",
      },
      {
        type: "image",
        url: "/4-pic-1-word/stadium.jpg",
        description: "A stadium",
      },
    ],
  },
  {
    id: 4,
    secret: {
      word: "earned-run",
      display: "Earned Run",
    },
    definition: "A run scored due to the batter's performance, without errors.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/baseball.jpeg",
        description: "A baseball",
      },
      {
        type: "image",
        url: "/4-pic-1-word/runner.jpg",
        description: "A runner",
      },
      {
        type: "image",
        url: "/4-pic-1-word/scoreboard.jpg",
        description: "A scoreboard",
      },
    ],
  },
  {
    id: 5,
    secret: {
      word: "strikeout",
      display: "Strikeout",
    },
    definition: "When a batter accumulates three strikes and is out.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/batter.jpg",
        description: "A batter",
      },
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/umpire.jpg",
        description: "An umpire",
      },
      {
        type: "image",
        url: "/4-pic-1-word/strike.jpg",
        description: "A strike",
      },
    ],
  },
  {
    id: 6,
    secret: {
      word: "wild-pitch",
      display: "Wild Pitch",
    },
    definition: "A pitch that is too difficult for the catcher to control.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/baseball.jpeg",
        description: "A baseball",
      },
      {
        type: "image",
        url: "/4-pic-1-word/catcher.jpg",
        description: "A catcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/miss.jpg",
        description: "A miss",
      },
    ],
  },
  {
    id: 7,
    secret: {
      word: "error",
      display: "Error",
    },
    definition: "A mistake made by a fielder that benefits the opposing team.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/fielder.webp",
        description: "A fielder",
      },
      {
        type: "image",
        url: "/4-pic-1-word/baseball.jpeg",
        description: "A baseball",
      },
      {
        type: "image",
        url: "/4-pic-1-word/mistake.jpg",
        description: "A mistake",
      },
      {
        type: "image",
        url: "/4-pic-1-word/scoreboard.jpg",
        description: "A scoreboard",
      },
    ],
  },
  {
    id: 8,
    secret: {
      word: "home-run",
      display: "Home Run",
    },
    definition: "A hit that allows the batter to circle all bases and score.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/batter.jpg",
        description: "A batter",
      },
      {
        type: "image",
        url: "/4-pic-1-word/baseball.jpeg",
        description: "A baseball",
      },
      {
        type: "image",
        url: "/4-pic-1-word/fence.webp",
        description: "A fence",
      },
      {
        type: "image",
        url: "/4-pic-1-word/crowd.webp",
        description: "A crowd",
      },
    ],
  },
  {
    id: 9,
    secret: {
      word: "triple",
      display: "Triple",
    },
    definition: "A hit that allows the batter to reach third base.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/runner.jpg",
        description: "A runner",
      },
      {
        type: "image",
        url: "/4-pic-1-word/baseball.jpeg",
        description: "A baseball",
      },
      {
        type: "image",
        url: "/4-pic-1-word/third-base.jpg",
        description: "Third base",
      },
      {
        type: "image",
        url: "/4-pic-1-word/field.jpg",
        description: "A field",
      },
    ],
  },
  {
    id: 10,
    secret: {
      word: "baseball-age",
      display: "Baseball Age",
    },
    definition: "The era or period in the history of baseball.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/player.webp",
        description: "A player",
      },
      {
        type: "image",
        url: "/4-pic-1-word/calendar.jpg",
        description: "A calendar",
      },
      {
        type: "image",
        url: "/4-pic-1-word/field.jpg",
        description: "A field",
      },
      {
        type: "image",
        url: "/4-pic-1-word/history.jpg",
        description: "History",
      },
    ],
  },
] as FourPicOneWordChallenges[];

export default PLANETARY_GAME_DATA;
