import { FourPicOneWordChallenges } from "../../../types/dugout.types.js";

const STELLAR_GAME_DATA = [
  {
    id: 1,
    secret: {
      word: "win-probability-added",
      display: "Win Probability",
    },
    definition:
      "A statistic measuring how a player's actions impact their team's chance of winning.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/graph.png",
        description: "A graph",
      },
      {
        type: "image",
        url: "/4-pic-1-word/percentage.jpeg",
        description: "A percentage",
      },
      {
        type: "image",
        url: "/4-pic-1-word/team.webp",
        description: "A team",
      },
      {
        type: "image",
        url: "/4-pic-1-word/victory.jpeg",
        description: "A victory",
      },
    ],
  },
  {
    id: 2,
    secret: {
      word: "magic-number",
      display: "Magic Number",
    },
    definition:
      "The number of wins needed for a team to clinch a playoff spot.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/numbers.webp",
        description: "A number",
      },
      {
        type: "image",
        url: "/4-pic-1-word/team.webp",
        description: "A team",
      },
      {
        type: "image",
        url: "/4-pic-1-word/playoffs.jpeg",
        description: "Playoffs",
      },
      {
        type: "image",
        url: "/4-pic-1-word/celebration.jpg",
        description: "A celebration",
      },
    ],
  },
  {
    id: 3,
    secret: {
      word: "save-percentage",
      display: "Save Percentage",
    },
    definition:
      "The percentage of save opportunities successfully converted by a pitcher.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/percentage.jpeg",
        description: "A percentage",
      },
      {
        type: "image",
        url: "/4-pic-1-word/game.png",
        description: "A game",
      },
      {
        type: "image",
        url: "/4-pic-1-word/save.jpg",
        description: "A save",
      },
    ],
  },
  {
    id: 4,
    secret: {
      word: "earned-run-average",
      display: "Earned Run Average",
    },
    definition:
      "The average number of earned runs a pitcher allows per nine innings.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/runs.jpeg",
        description: "Runs",
      },
      {
        type: "image",
        url: "/4-pic-1-word/average.jpg",
        description: "An average",
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
      word: "slugging-percentage",
      display: "Slugging Percentage",
    },
    definition:
      "A measure of a batter's power, calculated as total bases divided by at-bats.",
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
        url: "/4-pic-1-word/percentage.jpeg",
        description: "A percentage",
      },
      {
        type: "image",
        url: "/4-pic-1-word/hit.webp",
        description: "A hit",
      },
    ],
  },
  {
    id: 6,
    secret: {
      word: "walk-rate",
      display: "Walk Rate",
    },
    definition:
      "The frequency at which a pitcher allows walks, measured per nine innings.",
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
        url: "/4-pic-1-word/walk.webp",
        description: "A walk",
      },
      {
        type: "image",
        url: "/4-pic-1-word/rate.jpeg",
        description: "A rate",
      },
    ],
  },
  {
    id: 7,
    secret: {
      word: "strikeout-rate",
      display: "Strikeout Rate",
    },
    definition:
      "The frequency at which a pitcher records strikeouts, measured per nine innings.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/strike.jpg",
        description: "A strike",
      },
      {
        type: "image",
        url: "/4-pic-1-word/rate.jpeg",
        description: "A rate",
      },
      {
        type: "image",
        url: "/4-pic-1-word/batter.jpg",
        description: "A batter",
      },
    ],
  },
  {
    id: 8,
    secret: {
      word: "balk",
      display: "Balk",
    },
    definition: "An illegal motion by a pitcher that results in a penalty.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
      {
        type: "image",
        url: "/4-pic-1-word/mistake.jpg",
        description: "A mistake",
      },
      {
        type: "image",
        url: "/4-pic-1-word/runner.jpg",
        description: "A runner",
      },
      {
        type: "image",
        url: "/4-pic-1-word/umpire.jpg",
        description: "An umpire",
      },
    ],
  },
  {
    id: 9,
    secret: {
      word: "catcher-framing",
      display: "Catcher Framing",
    },
    definition:
      "A catcher's ability to make pitches appear as strikes to the umpire.",
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
        url: "/4-pic-1-word/umpire.jpg",
        description: "An umpire",
      },
      {
        type: "image",
        url: "/4-pic-1-word/call.webp",
        description: "A call",
      },
    ],
  },
  {
    id: 10,
    secret: {
      word: "spin-rate",
      display: "Spin Rate",
    },
    definition:
      "The rate at which a pitched ball spins, affecting its movement.",
    media: [
      {
        type: "image",
        url: "/4-pic-1-word/baseball.jpeg",
        description: "A baseball",
      },
      {
        type: "image",
        url: "/4-pic-1-word/spin.jpeg",
        description: "A spin",
      },
      {
        type: "image",
        url: "/4-pic-1-word/rate.jpeg",
        description: "A rate",
      },
      {
        type: "image",
        url: "/4-pic-1-word/pitcher.jpg",
        description: "A pitcher",
      },
    ],
  },
] as FourPicOneWordChallenges[];

export default STELLAR_GAME_DATA;
